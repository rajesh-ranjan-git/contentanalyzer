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
import { formatDate, getSimilarityColor } from "@/helpers/helpers";
import { AnalysisResults, Article, Competitor, Filters } from "@/types/types";
import Header from "@/components/header/header";
import LeftColumn from "@/components/leftColumn/LeftColumn";

const CompetitiveContentAnalyzer = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState("url");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResults[] | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    similarity: 30,
    dateRange: "365", // Default to 1 year
    contentType: "all",
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingSitemaps, setLoadingSitemaps] = useState(false);
  const [sitemapsLoadTime, setSitemapsLoadTime] = useState(0);
  const [analysisLoadTime, setAnalysisLoadTime] = useState(0);
  const [userContent, setUserContent] = useState(""); // Stores the content of the user's input URL/text

  // Filtered articles for display in the overview tab
  const filteredCompetitorArticles = (competitorId: string) => {
    const competitor = competitors.find((c) => c.id === competitorId);
    if (!competitor || !competitor.articleList) return [];

    return competitor.articleList
      .filter((article) => {
        const articleDate = new Date(article.publishDate);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(filters.dateRange));
        return articleDate >= cutoffDate;
      })
      .sort(
        (a, b) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      );
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
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow gap-4 grid grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Input & Controls */}
        <LeftColumn
          inputValue={inputValue}
          setInputValue={setInputValue}
          inputType={inputType}
          setInputType={setInputType}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
          setResults={setResults}
          competitors={competitors}
          setCompetitors={setCompetitors}
          selectedCompetitors={selectedCompetitors}
          setSelectedCompetitors={setSelectedCompetitors}
          filters={filters}
          setFilters={setFilters}
          setActiveTab={setActiveTab}
          loadingSitemaps={loadingSitemaps}
          setLoadingSitemaps={setLoadingSitemaps}
          setSitemapsLoadTime={setSitemapsLoadTime}
          setAnalysisLoadTime={setAnalysisLoadTime}
          setUserContent={setUserContent}
        />

        {/* Right Column - Results & Overview */}
        <section className="lg:col-span-2 bg-white shadow-md px-4 py-1 rounded-lg max-h-dvh overflow-hidden">
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

            {activeTab === "overview" ? (
              loadingSitemaps ? (
                <div className="flex justify-center items-center gap-2 font-semibold text-blue-600 text-sm">
                  <span>Please be patient while we are fetching sitemaps</span>{" "}
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loadingSitemaps ? "animate-spin" : ""
                    }`}
                  />
                </div>
              ) : sitemapsLoadTime ? (
                <div className="flex justify-center items-center gap-2 font-semibold text-blue-600 text-sm">
                  <Timer className="w-4 h-4" />
                  Time taken to load articles :{" "}
                  {(sitemapsLoadTime / 1000).toFixed(0)}s
                </div>
              ) : null
            ) : null}

            {activeTab === "results" ? (
              isAnalyzing ? (
                <div className="flex justify-center items-center gap-2 font-semibold text-blue-600 text-sm">
                  <span>
                    Please be patient while we are fetching analysis results
                  </span>{" "}
                  <RefreshCw
                    className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`}
                  />
                </div>
              ) : analysisLoadTime ? (
                <div className="flex justify-center items-center gap-2 font-semibold text-blue-600 text-sm">
                  <Timer className="w-4 h-4" />
                  Time taken to analyze : {(analysisLoadTime / 1000).toFixed(0)}
                  s
                </div>
              ) : null
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
                              .sort(
                                (a, b) =>
                                  (b.similarity ?? 0) - (a.similarity ?? 0)
                              ) // Sort by similarity descending
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
        </section>
      </main>
    </div>
  );
};

export default CompetitiveContentAnalyzer;
