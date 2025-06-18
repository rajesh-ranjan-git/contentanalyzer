import { useCallback, useEffect, useState } from "react";
import { Globe, RefreshCw, Search } from "lucide-react";
import { API_CCA_URL, sitemapUrls } from "@/config/config";
import { Article } from "@/types/types";
import { useAppStore } from "@/store/store";
import InputToggle from "@/components/leftColumn/inputToggle";
import InputField from "@/components/leftColumn/inputField";
import SelectCompetitors from "@/components/leftColumn/selectCompetitors";
import Filters from "@/components/leftColumn/filters";
import Analyze from "@/components/leftColumn/analyze";

const LeftContainer = () => {
  const inputValue = useAppStore((state) => state.inputValue);
  const inputType = useAppStore((state) => state.inputType);
  const filters = useAppStore((state) => state.filters);
  const setIsAnalyzing = useAppStore((state) => state.setIsAnalyzing);
  const loadingSitemaps = useAppStore((state) => state.loadingSitemaps);
  const competitors = useAppStore((state) => state.competitors);
  const setCompetitors = useAppStore((state) => state.setCompetitors);
  const setLoadingSitemaps = useAppStore((state) => state.setLoadingSitemaps);
  const setSitemapsLoadTime = useAppStore((state) => state.setSitemapsLoadTime);
  const setResults = useAppStore((state) => state.setResults);
  const setAnalysisLoadTime = useAppStore((state) => state.setAnalysisLoadTime);
  const setUserContent = useAppStore((state) => state.setUserContent);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const selectedCompetitors = useAppStore((state) => state.selectedCompetitors);

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
        const response = await fetch(`${API_CCA_URL}/fetch_sitemap`, {
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
    setAnalysisLoadTime(0);

    let initialTime = performance.now();

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

    setResults(analysisResults);
    setIsAnalyzing(false);
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
      const response = await fetch(`${API_CCA_URL}/fetch_article_content`, {
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

  useEffect(() => {
    fetchSitemapAndArticles();
  }, []); // Run only once on initial load

  return (
    <section className="top-6 sticky flex flex-col justify-between lg:col-span-1 bg-white shadow-md p-4 rounded-lg max-h-[85vh]">
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
