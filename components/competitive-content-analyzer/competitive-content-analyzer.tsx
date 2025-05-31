"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Link,
  TrendingUp,
  BarChart3,
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  BookOpen,
  Filter,
  Download,
  Settings,
  Timer,
} from "lucide-react";
import { sitemapUrls } from "@/config/config";
import { formatDate, getSimilarityColor } from "@/helpers/helpers";
import { Article, Competitor } from "@/types/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const CompetitiveContentAnalyzer = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState("url");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    similarity: 30,
    dateRange: "365", // Default to 1 year
    contentType: "all",
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingSitemaps, setLoadingSitemaps] = useState(false);
  const [sitemapsLoadTime, setSitemapsLoadTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [userContent, setUserContent] = useState(""); // Stores the content of the user's input URL/text

  const fetchSitemapAndArticles = useCallback(async () => {
    let initialTime = performance.now();
    setLoadingSitemaps(true);
    setErrorMessage("");
    const fetchedCompetitors = [];

    for (const sitemapUrl of sitemapUrls) {
      const domainMatch = sitemapUrl.match(
        /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im
      );
      const domain = domainMatch ? domainMatch[1] : sitemapUrl;
      const name = domain.replace(".com", "").replace(".in", "").split(".")[0];

      try {
        const response = await fetch(`${API_BASE_URL}/fetch_sitemap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sitemap_url: sitemapUrl }),
        });
        // The backend now returns an array of objects {url: '...', title: '...'}
        const fetchedArticlesData = await response.json();

        if (response.ok) {
          // Take the first 10 articles (or adjust as needed) from the fetched data
          const articles = fetchedArticlesData
            .slice(0, 10)
            .map((item: Article, index: number) => ({
              id: `${domain}-${index}`,
              title: item.title, // Use the actual title from the backend
              domain: domain,
              url: item.url,
              // Assign a random publish date for demonstration (if not available from sitemap)
              publishDate: new Date(
                Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split("T")[0],
              content: "", // Content will be fetched later
            }));

          fetchedCompetitors.push({
            id: domain,
            name: name,
            domain: domain,
            articles: articles.length,
            lastUpdated: "Just now",
            articleList: articles,
          });
        } else {
          throw new Error(
            fetchedArticlesData.error || "Failed to fetch sitemap URLs."
          );
        }
      } catch (error: any) {
        console.error(
          `Failed to fetch sitemap or articles for ${sitemapUrl}:`,
          error
        );
        setErrorMessage(
          (prev) => `${prev} Failed to load data for ${name}: ${error.message}.`
        );
      }
    }
    setCompetitors(fetchedCompetitors);
    setLoadingSitemaps(false);
    if (initialTime) {
      const endTime = performance.now();
      setSitemapsLoadTime(endTime - initialTime);
    }
  }, [sitemapUrls]); // Keep this dependency if sitemapUrls can change. If truly static, [] is fine.

  useEffect(() => {
    fetchSitemapAndArticles();
  }, []); // Run only once on initial load

  const handleCompetitorSelect = (competitorId: string) => {
    setSelectedCompetitors((prev) =>
      prev.includes(competitorId)
        ? prev.filter((id) => id !== competitorId)
        : [...prev, competitorId]
    );
  };

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const validateInput = () => {
    if (!inputValue.trim()) {
      setErrorMessage("Input value cannot be empty.");
      return false;
    }
    if (inputType === "url") {
      try {
        new URL(inputValue); // Basic URL validation
      } catch (_) {
        setErrorMessage("Please enter a valid URL.");
        return false;
      }
    }
    setErrorMessage("");
    return true;
  };

  const fetchContentFromUrl = useCallback(async (url: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/fetch_article_content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });
      const data = await response.json();
      if (response.ok) {
        return data.content;
      } else {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching content from ${url}:`, error);
      setErrorMessage(
        `Failed to fetch content from ${url}. Please check the URL.`
      );
      return null;
    }
  }, []);

  const calculateSimilarity = async (text1: string, text2: string) => {
    if (!text1 || !text2) return 0;

    try {
      const response = await fetch(`${API_BASE_URL}/calculate_similarity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text1: text1, text2: text2 }),
      });
      const data = await response.json();
      if (response.ok) {
        return data.similarity;
      } else {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error calling backend for similarity:", error);
      setErrorMessage(`Error calculating similarity: ${error.message}`);
      return 0;
    }
  };

  const handleAnalyze = async () => {
    if (!validateInput()) {
      return;
    }
    if (selectedCompetitors.length === 0) {
      setErrorMessage("Please select at least one competitor to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage("");
    setResults(null);

    let mainContent = inputValue;
    if (inputType === "url") {
      const fetchedMainContent = await fetchContentFromUrl(inputValue);
      if (!fetchedMainContent) {
        setIsAnalyzing(false);
        return; // Error message already set by fetchContentFromUrl
      }
      mainContent = fetchedMainContent;
    }
    setUserContent(mainContent); // Store the content for display/reuse

    const analysisResults = [];
    const selectedCompetitorObjects = competitors.filter((comp) =>
      selectedCompetitors.includes(comp.id)
    );

    for (const competitor of selectedCompetitorObjects) {
      const relevantArticles = competitor.articleList.filter(
        (article: Article) => {
          const articleDate = new Date(article.publishDate);
          const cutoffDate = new Date();
          cutoffDate.setDate(
            cutoffDate.getDate() - parseInt(filters.dateRange)
          );
          return articleDate >= cutoffDate;
        }
      );

      const articlesWithSimilarity = [];
      for (const article of relevantArticles) {
        // Fetch content for competitor article only when analyzing
        const competitorArticleContent = await fetchContentFromUrl(article.url);
        if (competitorArticleContent) {
          const similarity = await calculateSimilarity(
            mainContent,
            competitorArticleContent
          );
          if (similarity >= filters.similarity) {
            articlesWithSimilarity.push({ ...article, similarity });
          }
        }
      }
      analysisResults.push({
        competitorId: competitor.id,
        competitorName: competitor.name,
        articles: articlesWithSimilarity.sort(
          (a, b) => b.similarity - a.similarity
        ),
      });
    }

    console.log("analysisResults : ", analysisResults);

    setResults(analysisResults);
    setIsAnalyzing(false);
    setActiveTab("results"); // Switch to results tab after analysis
  };

  // Filtered articles for display in the overview tab
  const filteredCompetitorArticles = (competitorId) => {
    const competitor = competitors.find((c) => c.id === competitorId);
    if (!competitor || !competitor.articleList) return [];

    return competitor.articleList
      .filter((article) => {
        const articleDate = new Date(article.publishDate);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(filters.dateRange));
        return articleDate >= cutoffDate;
      })
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
  };

  useEffect(() => {
    if (!isAnalyzing) return;
    setActiveTab("results");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [isAnalyzing]);

  return (
    <div className="flex flex-col bg-gray-100 p-4 sm:p-4 min-h-screen font-sans">
      {/* Header */}
      <header className="flex flex-wrap justify-between items-center bg-white shadow-sm mb-4 p-4 rounded-lg">
        <h1 className="flex items-center mb-2 sm:mb-0 font-semibold text-gray-800 text-2xl">
          <BarChart3 className="mr-2 w-6 h-6 text-blue-600" /> Competitive
          Content Analyzer
        </h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <Download className="mr-1 w-5 h-5" /> Export
          </button>
          <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <Settings className="mr-1 w-5 h-5" /> Settings
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow gap-4 grid grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Input & Controls */}
        <div className="top-6 sticky flex flex-col justify-between lg:col-span-1 bg-white shadow-md p-4 rounded-lg max-h-dvh">
          <div className="flex flex-col justify-between gap-2">
            <h2 className="flex items-center mb-2 font-medium text-gray-800 text-xl">
              <Search className="mr-2 w-5 h-5 text-blue-600" /> Analyze Content
            </h2>

            {/* Input Type Toggle */}
            <div className="flex space-x-2 bg-gray-100 mb-2 p-1 rounded-lg">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  inputType === "url"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setInputType("url")}
              >
                <Link className="inline-block mr-1 w-4 h-4" /> URL
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  inputType === "text"
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setInputType("text")}
              >
                <BookOpen className="inline-block mr-1 w-4 h-4" /> Text
              </button>
            </div>

            {/* Input Field */}
            <div className="mb-2">
              <label
                htmlFor="contentInput"
                className="block mb-1 font-medium text-gray-700 text-sm"
              >
                Enter {inputType === "url" ? "URL" : "Content"}
              </label>
              {inputType === "url" ? (
                <input
                  type="url"
                  id="contentInput"
                  className="px-4 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full text-gray-900"
                  placeholder="e.g., https://yourwebsite.com/article"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              ) : (
                <textarea
                  id="contentInput"
                  className="px-4 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full h-32 text-gray-900 resize-y"
                  placeholder="Paste your content here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                ></textarea>
              )}
              {errorMessage && (
                <p className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="mr-1 w-4 h-4" /> {errorMessage}
                </p>
              )}
            </div>

            {/* Competitor Selection */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="flex items-center font-medium text-gray-800 text-lg">
                  <Globe className="mr-2 w-5 h-5 text-blue-600" /> Select
                  Competitors
                </h3>
                <button
                  onClick={fetchSitemapAndArticles}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  disabled={loadingSitemaps}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1 ${
                      loadingSitemaps ? "animate-spin" : ""
                    }`}
                  />
                  {loadingSitemaps ? "Loading..." : "Refresh Sitemaps"}
                </button>
              </div>
              <div className="space-y-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100 p-1 border border-slate-300 rounded-md [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-2 min-h-24 overflow-y-scroll">
                {competitors.length === 0 && !loadingSitemaps && (
                  <p className="text-gray-600 text-sm">
                    No competitors loaded. Check sitemap URLs or refresh.
                  </p>
                )}
                {loadingSitemaps ? (
                  <div className="flex items-center text-gray-600 text-sm">
                    <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                    <p>Loading competitors...</p>
                  </div>
                ) : (
                  competitors.map((comp) => (
                    <label
                      key={comp.id}
                      className="flex items-center bg-gray-50 hover:bg-gray-100 p-2 rounded-md transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded focus:ring-blue-500 w-5 h-5 text-blue-600 form-checkbox"
                        checked={selectedCompetitors.includes(comp.id)}
                        onChange={() => handleCompetitorSelect(comp.id)}
                      />
                      <span className="ml-3 font-medium text-gray-800">
                        {comp.name}
                      </span>
                      <span className="ml-auto text-gray-600 text-sm">
                        {comp.articles} articles
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-2">
            {/* Filters */}
            <div className="mb-2">
              <h3 className="flex items-center mb-2 font-medium text-gray-800 text-lg">
                <Filter className="mr-2 w-5 h-5 text-blue-600" /> Filters
              </h3>
              <div className="space-y-1">
                <div>
                  <label
                    htmlFor="similarity"
                    className="block font-medium text-gray-700 text-sm"
                  >
                    Minimum Similarity (%)
                  </label>
                  <input
                    type="range"
                    id="similarity"
                    name="similarity"
                    min="0"
                    max="100"
                    value={filters.similarity}
                    onChange={handleFilterChange}
                    className="bg-gray-200 rounded-lg w-full h-1 accent-blue-600 appearance-none cursor-pointer"
                  />
                  <span className="text-gray-600 text-sm">
                    {filters.similarity}%
                  </span>
                </div>
                <div>
                  <label
                    htmlFor="dateRange"
                    className="block mb-1 font-medium text-gray-700 text-sm"
                  >
                    Content Published In
                  </label>
                  <select
                    id="dateRange"
                    name="dateRange"
                    value={filters.dateRange}
                    onChange={handleFilterChange}
                    className="px-2 py-1 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full text-gray-900"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                    <option value="0">All time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 shadow-lg px-6 py-2 rounded-md w-full font-semibold text-white text-lg transition-colors"
              disabled={
                isAnalyzing ||
                selectedCompetitors.length === 0 ||
                !inputValue.trim()
              }
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 w-5 h-5 animate-spin" />{" "}
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 w-5 h-5" /> Start Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Results & Overview */}
        <div className="lg:col-span-2 bg-white shadow-md px-4 py-1 rounded-lg max-h-dvh overflow-hidden">
          {/* Tabs */}
          <div className="flex justify-between items-center mb-2 border-gray-200 border-b">
            <nav className="flex space-x-8 -mb-px" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("results")}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "results"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Analysis Results
              </button>
            </nav>
            {loadingSitemaps ? (
              <div className="flex justify-center items-center gap-2 font-semibold text-blue-600 text-sm">
                <span>Please be patient while we are fetching sitemaps</span>{" "}
                <RefreshCw
                  className={`w-4 h-4 ${loadingSitemaps ? "animate-spin" : ""}`}
                />
              </div>
            ) : sitemapsLoadTime ? (
              <div className="flex justify-center items-center gap-2 font-semibold text-blue-600 text-sm">
                <Timer className="w-4 h-4" />
                Time taken : {(sitemapsLoadTime / 1000).toFixed(0)}s
              </div>
            ) : null}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 max-h-[82vh] overflow-y-scroll transition-all ease-in-out">
              <h2 className="flex items-center mb-2 font-medium text-gray-800 text-xl">
                <Eye className="mr-2 w-5 h-5 text-blue-600" /> Competitor
                Overview
              </h2>
              {competitors.length === 0 && !loadingSitemaps && (
                <div className="bg-yellow-50 p-4 border-yellow-400 border-l-4 rounded-md text-yellow-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle
                        className="w-5 h-5 text-yellow-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">
                        No competitor data loaded. Please ensure sitemap URLs
                        are correct and try refreshing.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {loadingSitemaps && (
                <div className="flex justify-center items-center p-4 text-blue-600">
                  <RefreshCw className="mr-2 w-5 h-5 animate-spin" />
                  <p>Loading competitor sitemaps...</p>
                </div>
              )}
              {competitors.map((competitor) => (
                <div
                  key={competitor.id}
                  className="mb-2 border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="flex justify-between items-center bg-gray-50 p-2 px-4">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {competitor.name}
                    </h3>
                    <span className="text-gray-600 text-sm">
                      Last updated: {competitor.lastUpdated}
                    </span>
                  </div>
                  <div className="p-2 px-4">
                    <div className="flex justify-between items-center">
                      <p className="mb-1 text-gray-700">
                        Domain:{" "}
                        <a
                          href={`https://${competitor.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {competitor.domain}
                        </a>
                      </p>
                      <p className="mb-1 text-gray-700">
                        Total articles found (sample):{" "}
                        {competitor.articleList
                          ? competitor.articleList.length
                          : 0}
                      </p>
                    </div>
                    <h4 className="mb-1 font-medium text-gray-800">
                      Sample Articles (Last{" "}
                      {filters.dateRange === "0"
                        ? "All Time"
                        : `${filters.dateRange} Days`}
                      )
                    </h4>
                    <div className="relative [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100 pl-4 border-gray-200 border-l-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-2 max-h-40 overflow-y-scroll">
                      {filteredCompetitorArticles(competitor.id).length ===
                      0 ? (
                        <p className="text-gray-600 text-sm">
                          No articles found matching current filters for{" "}
                          {competitor.name}.
                        </p>
                      ) : (
                        filteredCompetitorArticles(competitor.id).map(
                          (article, index) => (
                            <div
                              key={article.id}
                              className="relative flex items-center space-x-2 pb-1"
                            >
                              <div className="z-10 relative flex flex-shrink-0 justify-center items-center bg-blue-600 rounded-full w-8 h-8">
                                <Clock className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 bg-gray-50 p-2 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                  <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-600 text-sm"
                                  >
                                    <Link className="mr-1 w-4 h-4" />{" "}
                                    <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-all ease-in-out">
                                      {article.title}
                                    </h4>
                                  </a>
                                  <span className="text-gray-600 text-sm">
                                    {formatDate(article.publishDate)}
                                  </span>
                                </div>
                                <p className="mb-1 text-gray-600 text-sm">
                                  {article.domain}
                                </p>
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "results" && (
            <div className="[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 max-h-[82vh] overflow-y-scroll transition-all ease-in-out">
              <h2 className="flex items-center mb-2 font-medium text-gray-800 text-xl">
                <BarChart3 className="mr-2 w-5 h-5 text-blue-600" /> Analysis
                Results
              </h2>

              {isAnalyzing && (
                <div className="flex justify-center items-center p-4 text-blue-600">
                  <RefreshCw className="mr-2 w-5 h-5 animate-spin" />
                  <p>Analyzing content and calculating similarities...</p>
                </div>
              )}

              {results === null && !isAnalyzing && (
                <div className="bg-blue-50 p-2 px-4 border-blue-400 border-l-4 rounded-md text-blue-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle
                        className="w-5 h-5 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">
                        Enter your content/URL and select competitors to start
                        the analysis.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {results && results.length > 0 && (
                <div>
                  <div className="bg-gray-50 shadow-inner mb-2 px-3 py-2 rounded-lg">
                    <h3 className="mb-1 font-semibold text-gray-800 text-lg">
                      Your Input Content:
                    </h3>
                    {inputType === "url" ? (
                      <a
                        href={inputValue}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 text-sm hover:underline"
                      >
                        <Link className="mr-1 w-4 h-4" /> {inputValue}
                      </a>
                    ) : (
                      <p className="max-h-40 overflow-y-auto text-gray-700 text-sm">
                        {userContent.substring(0, 500)}...
                      </p>
                    )}
                  </div>

                  {results.map((compResult) => (
                    <div
                      key={compResult.competitorId}
                      className="mb-2 border border-gray-200 rounded-lg max-h-96 overflow-hidden"
                    >
                      <div className="bg-gray-50 p-2 px-4">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {compResult.competitorName}
                        </h3>
                      </div>
                      <div className="p-4">
                        {compResult.articles.length === 0 ? (
                          <p className="text-gray-600 text-sm">
                            No highly similar articles found for{" "}
                            {compResult.competitorName} based on current
                            filters.
                          </p>
                        ) : (
                          <div className="relative [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100 pl-4 border-gray-200 border-l-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-2 max-h-40 overflow-y-scroll">
                            {compResult.articles
                              .sort((a, b) => b.similarity - a.similarity) // Sort by similarity descending
                              .map((article, index) => (
                                <div
                                  key={article.id}
                                  className="relative flex items-center space-x-2 pb-1"
                                >
                                  <div className="z-10 relative flex flex-shrink-0 justify-center items-center bg-blue-600 rounded-full w-8 h-8">
                                    <Clock className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 bg-gray-50 p-2 rounded-lg">
                                    <div className="flex justify-between items-center mb-1">
                                      <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-600 text-sm"
                                      >
                                        <Link className="mr-1 w-4 h-4" />{" "}
                                        <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-all ease-in-out">
                                          {article.title}
                                        </h4>
                                      </a>
                                      <span className="text-gray-600 text-sm">
                                        {formatDate(article.publishDate)}
                                      </span>
                                    </div>
                                    <p className="mb-1 text-gray-600 text-sm">
                                      {article.domain}
                                    </p>
                                    <span
                                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSimilarityColor(
                                        article.similarity
                                      )}`}
                                    >
                                      {article.similarity}% similar
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitiveContentAnalyzer;
