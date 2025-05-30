"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Link,
  Calendar,
  TrendingUp,
  BarChart3,
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Share2,
  BookOpen,
  Filter,
  Download,
  Settings,
  XCircle,
} from "lucide-react";

const CompetitiveContentAnalyzer = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState("url");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);
  const [filters, setFilters] = useState({
    similarity: 30,
    dateRange: "365", // Default to 1 year
    contentType: "all",
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingSitemaps, setLoadingSitemaps] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userContent, setUserContent] = useState(""); // Stores the content of the user's input URL/text

  const API_BASE_URL = "http://localhost:5000"; // Ensure this matches your Flask app's port

  const sitemapUrls = [
    "https://www.indiatoday.in/news-it-sitemap.xml",
    "https://www.ndtv.com/sitemap/google-news-sitemap",
    "https://indianexpress.com/news-sitemap.xml",
    "https://www.hindustantimes.com/sitemap/news.xml",
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getSimilarityColor = (similarity) => {
    if (similarity >= 80) return "bg-red-100 text-red-800";
    if (similarity >= 60) return "bg-orange-100 text-orange-800";
    if (similarity >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const fetchSitemapAndArticles = useCallback(async () => {
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
            .map((item, index) => ({
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
      } catch (error) {
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
  }, [sitemapUrls]); // Keep this dependency if sitemapUrls can change. If truly static, [] is fine.

  useEffect(() => {
    fetchSitemapAndArticles();
  }, []); // Run only once on initial load

  const handleCompetitorSelect = (competitorId) => {
    setSelectedCompetitors((prev) =>
      prev.includes(competitorId)
        ? prev.filter((id) => id !== competitorId)
        : [...prev, competitorId]
    );
  };

  const handleFilterChange = (e) => {
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

  const fetchContentFromUrl = useCallback(async (url) => {
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

  const calculateSimilarity = async (text1, text2) => {
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
    } catch (error) {
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
      const relevantArticles = competitor.articleList.filter((article) => {
        const articleDate = new Date(article.publishDate);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(filters.dateRange));
        return articleDate >= cutoffDate;
      });

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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center mb-2 sm:mb-0">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" /> Competitive
          Content Analyzer
        </h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <Download className="w-5 h-5 mr-1" /> Export
          </button>
          <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <Settings className="w-5 h-5 mr-1" /> Settings
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input & Controls */}
        <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-6 h-fit sticky top-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" /> Analyze Content
          </h2>

          {/* Input Type Toggle */}
          <div className="mb-4 flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                inputType === "url"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setInputType("url")}
            >
              <Link className="inline-block w-4 h-4 mr-1" /> URL
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                inputType === "text"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setInputType("text")}
            >
              <BookOpen className="inline-block w-4 h-4 mr-1" /> Text
            </button>
          </div>

          {/* Input Field */}
          <div className="mb-4">
            <label
              htmlFor="contentInput"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter {inputType === "url" ? "URL" : "Content"}
            </label>
            {inputType === "url" ? (
              <input
                type="url"
                id="contentInput"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="e.g., https://yourwebsite.com/article"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            ) : (
              <textarea
                id="contentInput"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 h-32 resize-y"
                placeholder="Paste your content here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              ></textarea>
            )}
            {errorMessage && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" /> {errorMessage}
              </p>
            )}
          </div>

          {/* Competitor Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" /> Select
                Competitors
              </h3>
              <button
                onClick={fetchSitemapAndArticles}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
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
            <div className="space-y-3">
              {competitors.length === 0 && !loadingSitemaps && (
                <p className="text-gray-600 text-sm">
                  No competitors loaded. Check sitemap URLs or refresh.
                </p>
              )}
              {loadingSitemaps ? (
                <div className="text-gray-600 text-sm flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <p>Loading competitors...</p>
                </div>
              ) : (
                competitors.map((comp) => (
                  <label
                    key={comp.id}
                    className="flex items-center cursor-pointer p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      checked={selectedCompetitors.includes(comp.id)}
                      onChange={() => handleCompetitorSelect(comp.id)}
                    />
                    <span className="ml-3 text-gray-800 font-medium">
                      {comp.name}
                    </span>
                    <span className="ml-auto text-sm text-gray-600">
                      {comp.articles} articles
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" /> Filters
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="similarity"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-sm text-gray-600">
                  {filters.similarity}%
                </span>
              </div>
              <div>
                <label
                  htmlFor="dateRange"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Content Published In
                </label>
                <select
                  id="dateRange"
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                  <option value="0">All time</option>
                </select>
              </div>
              {/* <div>
                <label
                  htmlFor="contentType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Content Type
                </label>
                <select
                  id="contentType"
                  name="contentType"
                  value={filters.contentType}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="all">All</option>
                  <option value="article">Article</option>
                  <option value="blog">Blog Post</option>
                  <option value="news">News</option>
                </select>
              </div> */}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg"
            disabled={
              isAnalyzing ||
              selectedCompetitors.length === 0 ||
              !inputValue.trim()
            }
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" /> Start Analysis
              </>
            )}
          </button>
        </div>

        {/* Right Column - Results & Overview */}
        <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("results")}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "results"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Analysis Results
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-600" /> Competitor
                Overview
              </h2>
              {competitors.length === 0 && !loadingSitemaps && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle
                        className="h-5 w-5 text-yellow-400"
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
                <div className="p-4 flex items-center justify-center text-blue-600">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  <p>Loading competitor sitemaps...</p>
                </div>
              )}
              {competitors.map((competitor) => (
                <div
                  key={competitor.id}
                  className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 p-4 flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {competitor.name}
                    </h3>
                    <span className="text-sm text-gray-600">
                      Last updated: {competitor.lastUpdated}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 mb-3">
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
                    <p className="text-gray-700 mb-3">
                      Total articles found (sample):{" "}
                      {competitor.articleList
                        ? competitor.articleList.length
                        : 0}
                    </p>
                    <h4 className="font-medium text-gray-800 mb-3">
                      Sample Articles (Last{" "}
                      {filters.dateRange === "0"
                        ? "All Time"
                        : `${filters.dateRange} Days`}
                      )
                    </h4>
                    <div className="relative border-l-2 border-gray-200 pl-6">
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
                              className="relative flex items-center space-x-6 pb-8"
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center relative z-10">
                                <Clock className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">
                                    {article.title}
                                  </h4>
                                  <span className="text-sm text-gray-600">
                                    {formatDate(article.publishDate)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {article.domain}
                                </p>
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 text-sm hover:underline flex items-center"
                                >
                                  <Link className="w-4 h-4 mr-1" /> View Article
                                </a>
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
            <div>
              <h2 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" /> Analysis
                Results
              </h2>

              {isAnalyzing && (
                <div className="p-4 flex items-center justify-center text-blue-600">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  <p>Analyzing content and calculating similarities...</p>
                </div>
              )}

              {results === null && !isAnalyzing && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle
                        className="h-5 w-5 text-blue-400"
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
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">
                      Your Input Content:
                    </h3>
                    {inputType === "url" ? (
                      <a
                        href={inputValue}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center"
                      >
                        <Link className="w-4 h-4 mr-1" /> {inputValue}
                      </a>
                    ) : (
                      <p className="text-gray-700 text-sm max-h-40 overflow-y-auto">
                        {userContent.substring(0, 500)}...
                      </p>
                    )}
                  </div>

                  {results.map((compResult) => (
                    <div
                      key={compResult.competitorId}
                      className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 p-4">
                        <h3 className="font-semibold text-lg text-gray-800">
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
                          <div className="relative border-l-2 border-gray-200 pl-6">
                            {compResult.articles
                              .sort((a, b) => b.similarity - a.similarity) // Sort by similarity descending
                              .map((article, index) => (
                                <div
                                  key={article.id}
                                  className="relative flex items-center space-x-6 pb-8"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center relative z-10">
                                    <Clock className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-medium text-gray-900">
                                        {article.title}
                                      </h4>
                                      <span className="text-sm text-gray-600">
                                        {formatDate(article.publishDate)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        {article.domain}
                                      </a>
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
