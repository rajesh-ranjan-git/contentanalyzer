import { useCallback, useEffect, useState } from "react";
import { Globe, RefreshCw, Search } from "lucide-react";
import { API_CCA_URL, sitemapUrls } from "@/config/config";
import { Article, Competitor } from "@/types/types";
import { formatDate } from "@/helpers/helpers";
import { useContentAnalyzerAppStore } from "@/store/store";
import InputToggle from "@/components/leftContentAnalyzer/inputToggle";
import InputField from "@/components/leftContentAnalyzer/inputField";
import SelectCompetitors from "@/components/leftContentAnalyzer/selectCompetitors";
import Filters from "@/components/leftContentAnalyzer/filters";
import Analyze from "@/components/leftContentAnalyzer/analyze";

const LeftContainer = () => {
  const inputValue = useContentAnalyzerAppStore((state) => state.inputValue);
  const inputType = useContentAnalyzerAppStore((state) => state.inputType);
  const filters = useContentAnalyzerAppStore((state) => state.filters);
  const setIsAnalyzing = useContentAnalyzerAppStore(
    (state) => state.setIsAnalyzing
  );
  const setCountOfArticlesAnalyzing = useContentAnalyzerAppStore(
    (state) => state.setCountOfArticlesAnalyzing
  );
  const setIsCalculatingWordCount = useContentAnalyzerAppStore(
    (state) => state.setIsCalculatingWordCount
  );
  const loadingSitemaps = useContentAnalyzerAppStore(
    (state) => state.loadingSitemaps
  );
  const competitors = useContentAnalyzerAppStore((state) => state.competitors);
  const setCompetitors = useContentAnalyzerAppStore(
    (state) => state.setCompetitors
  );
  const setLoadingSitemaps = useContentAnalyzerAppStore(
    (state) => state.setLoadingSitemaps
  );
  const setSitemapsLoadTime = useContentAnalyzerAppStore(
    (state) => state.setSitemapsLoadTime
  );
  const setResults = useContentAnalyzerAppStore((state) => state.setResults);
  const setAnalysisLoadTime = useContentAnalyzerAppStore(
    (state) => state.setAnalysisLoadTime
  );
  const setMainArticleContent = useContentAnalyzerAppStore(
    (state) => state.setMainArticleContent
  );
  const setActiveTab = useContentAnalyzerAppStore(
    (state) => state.setActiveTab
  );
  const selectedCompetitors = useContentAnalyzerAppStore(
    (state) => state.selectedCompetitors
  );

  const [errorMessage, setErrorMessage] = useState("");

  const fetchSitemapAndArticles = useCallback(async () => {
    setLoadingSitemaps(true);
    setErrorMessage("");
    setSitemapsLoadTime(0);

    let initialTime = performance.now();
    const fetchedCompetitors = [];

    for (const sitemapUrl of sitemapUrls) {
      const domainMatch = sitemapUrl.match(
        /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im
      );
      const domain = domainMatch ? domainMatch[1] : sitemapUrl;
      const name = domain.replace(".com", "").replace(".in", "").split(".")[0];

      try {
        const response = await fetch(`${API_CCA_URL}/fetch_sitemap_urls`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sitemap_url: sitemapUrl }),
        });

        // The backend now returns an array of objects {url: '...', title: '...', published_date: "..."}
        const fetchedArticles = await response.json();

        if (response.ok) {
          const sampleArticles = fetchedArticles
            .slice(0, 10)
            .map((article: Article, index: number) => ({
              id: article.id,
              title: article.title,
              domain: article.domain,
              url: article.url,
              published_date: article.published_date,
            }));

          fetchedCompetitors.push({
            id: domain,
            name: name,
            domain: domain,
            totalArticlesCount: fetchedArticles.length,
            allArticles: fetchedArticles,
            lastUpdated: formatDate(new Date()),
            sampleArticlesList: sampleArticles,
          });
        } else {
          throw new Error(
            fetchedArticles.error || "Failed to fetch sitemap URLs."
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

  const getSampleArticlesWordCount = async () => {
    setIsCalculatingWordCount(true);

    for (const competitor of competitors) {
      // Take the first 10 articles (or adjust as needed) from the fetched data
      const sampleArticles = competitor.sampleArticlesList.slice(0, 10);

      const results = await Promise.allSettled(
        sampleArticles.map(async (article: Article) => {
          try {
            article.content = await getArticleData(article);
          } catch (err) {
            console.error(`Error fetching article content:`, err);
          }
        })
      );

      // Optional: Log failed ones
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.warn(`Article ${index} failed:`, result.reason);
        }
      });
    }

    setIsCalculatingWordCount(false);
  };

  const getArticleData = async (article: Article) => {
    try {
      const articleResponse = await fetch(`${API_CCA_URL}/fetch_article_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: article?.url }),
      });

      const articleData = await articleResponse.json();

      if (articleResponse.ok) {
        return articleData;
      }
    } catch (error: any) {
      console.error(
        `Failed to fetch article data for url : ${article?.url}:`,
        error
      );
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
    setCountOfArticlesAnalyzing(getCountOfArticlesAnalyzing());
    setErrorMessage("");
    setResults(null);
    setAnalysisLoadTime(0);

    let initialTime = performance.now();

    let mainContent = inputValue;
    if (inputType === "url") {
      const fetchedMainContent = await fetchContentFromUrl(inputValue);
      if (!fetchedMainContent) {
        setIsAnalyzing(false);
        setCountOfArticlesAnalyzing(0);
        return; // Error message already set by fetchContentFromUrl
      }
      mainContent =
        fetchedMainContent.article_heading + fetchedMainContent.article_body;
    }
    setMainArticleContent(mainContent); // Store the content for display/reuse

    const analysisResults = [];
    const selectedCompetitorObjects = competitors.filter((competitor) =>
      selectedCompetitors.includes(competitor.id)
    );

    for (const competitor of selectedCompetitorObjects) {
      const relevantArticles = getRelevantArticlesToAnalyze(competitor);

      const articlesWithSimilarity = [];
      for (const article of relevantArticles) {
        // Fetch content for competitor article only when analyzing
        const ArticleContent = await fetchContentFromUrl(article.url);
        if (ArticleContent) {
          const similarity = await calculateSimilarity(
            mainContent,
            ArticleContent.article_heading + ArticleContent.article_body
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
    setCountOfArticlesAnalyzing(0);
    setActiveTab("results"); // Switch to results tab after analysis

    if (initialTime) {
      const endTime = performance.now();
      setAnalysisLoadTime(endTime - initialTime);
    }
  };

  const calculateSimilarity = async (text1: string, text2: string) => {
    if (!text1 || !text2) return 0;

    try {
      const response = await fetch(`${API_CCA_URL}/calculate_similarity`, {
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

  const fetchContentFromUrl = useCallback(async (url: string) => {
    try {
      const response = await fetch(`${API_CCA_URL}/fetch_article_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });
      const data = await response.json();
      if (response.ok) {
        return data;
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

  const getRelevantArticlesToAnalyze = (competitor: Competitor) => {
    return competitor.allArticles.filter((article: Article) => {
      const articleDate = new Date(article.published_date);
      const cutoffDate = new Date(); // clone

      const dateRangeValue = filters.dateRange.toString().toLowerCase(); // e.g., "1h", "3d"

      if (dateRangeValue.endsWith("h")) {
        // Hour-based filtering
        const hours = parseInt(dateRangeValue);
        cutoffDate.setHours(cutoffDate.getHours() - hours);
      } else if (dateRangeValue.endsWith("d")) {
        // Day-based filtering
        const days = parseInt(dateRangeValue);
        cutoffDate.setDate(cutoffDate.getDate() - days);
      } else {
        // Default fallback (assume days if no suffix)
        const days = parseInt(dateRangeValue);
        cutoffDate.setDate(cutoffDate.getDate() - days);
      }

      return articleDate >= cutoffDate;
    });
  };

  const getCountOfArticlesAnalyzing = () => {
    const selectedCompetitorObjects = competitors.filter((competitor) =>
      selectedCompetitors.includes(competitor.id)
    );

    if (selectedCompetitorObjects.length <= 0) {
      return 0;
    }

    let countOfRelevantArticles = 0;

    for (const competitor of selectedCompetitorObjects) {
      countOfRelevantArticles +=
        getRelevantArticlesToAnalyze(competitor).length;
    }

    return countOfRelevantArticles;
  };

  useEffect(() => {
    getSampleArticlesWordCount();
  }, [competitors]);

  useEffect(() => {
    fetchSitemapAndArticles();
  }, []); // Run only once on initial load

  return (
    <section className="top-6 sticky flex flex-col justify-between lg:col-span-1 bg-white [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 shadow-md p-4 rounded-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 min-h-[85vh] max-h-[85vh] overflow-y-auto transition-all ease-in-out [&::-webkit-scrollbar-track]:transparent">
      <div className="flex flex-col justify-between">
        <h2 className="flex items-center mb-2 font-medium text-gray-800 text-xl">
          <Search className="mr-2 w-5 h-5 text-blue-600" /> Analyze Content
        </h2>

        {/* Input Type Toggle */}
        <InputToggle />

        {/* Input Field */}
        <InputField errorMessage={errorMessage} />
      </div>

      {/* Competitor Selection */}
      <div className="flex flex-col flex-1 flex-start gap-1 mb-2">
        <div className="flex justify-between items-center">
          <h3 className="flex items-center font-medium text-gray-800 text-lg">
            <Globe className="mr-2 w-5 h-5 text-blue-600" /> Select Competitors
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
        <SelectCompetitors />
      </div>

      <div className="flex flex-col justify-between gap-2">
        {/* Filters */}
        <Filters />

        {/* Analyze Button */}
        <Analyze handleAnalyze={handleAnalyze} />
      </div>
    </section>
  );
};

export default LeftContainer;
