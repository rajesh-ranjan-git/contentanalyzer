import { RefreshCw, Timer } from "lucide-react";
import { useCommentsSummarizerAppStore } from "@/store/store";

const RightTabs = () => {
  const activeTab = useCommentsSummarizerAppStore((state) => state.activeTab);
  const setActiveTab = useCommentsSummarizerAppStore(
    (state) => state.setActiveTab
  );
  const isSummarizing = useCommentsSummarizerAppStore(
    (state) => state.isSummarizing
  );
  const loadingSitemaps = useCommentsSummarizerAppStore(
    (state) => state.loadingSitemaps
  );
  const sitemapsLoadTime = useCommentsSummarizerAppStore(
    (state) => state.sitemapsLoadTime
  );
  const summaryLoadTime = useCommentsSummarizerAppStore(
    (state) => state.summaryLoadTime
  );

  return (
    <>
      {/* Tabs */}
      <div className="flex justify-between items-center mb-2 border-gray-200 border-b">
        <nav className="flex space-x-8 -mb-px" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("summary")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "summary"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("sentiments")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "sentiments"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Sentiment Analysis
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "theme"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Key Theme
          </button>
          <button
            onClick={() => setActiveTab("frequent-keywords")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "frequent-keywords"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Frequent Keywords
          </button>
        </nav>

        {activeTab === "summary" ? (
          isSummarizing ? (
            <div className="flex justify-center items-center gap-2 font-semibold text-blue-600 text-sm">
              <span>
                Please be patient while we are summarizing comments :{" "}
              </span>{" "}
              <RefreshCw
                className={`w-4 h-4 ${isSummarizing ? "animate-spin" : ""}`}
              />
            </div>
          ) : summaryLoadTime ? (
            <div className="flex justify-center items-center gap-2 font-semibold text-blue-600 text-sm">
              <Timer className="w-4 h-4" />
              Time taken to summarize comments :{" "}
              {(summaryLoadTime / 1000).toFixed(0)}s
            </div>
          ) : null
        ) : null}

        {activeTab === "sentiments" ? (
          isSummarizing ? (
            <div className="flex justify-center items-center gap-2 font-semibold text-blue-600 text-sm">
              <span>
                Please be patient while we are fetching sentiment analysis
                result :{" "}
              </span>{" "}
              <RefreshCw
                className={`w-4 h-4 ${isSummarizing ? "animate-spin" : ""}`}
              />
            </div>
          ) : summaryLoadTime ? (
            <div className="flex justify-center items-center gap-2 font-semibold text-blue-600 text-sm">
              <Timer className="w-4 h-4" />
              Time taken to fetch sentiment analysis results :{" "}
              {(summaryLoadTime / 1000).toFixed(0)}s
            </div>
          ) : null
        ) : null}
      </div>
    </>
  );
};

export default RightTabs;
