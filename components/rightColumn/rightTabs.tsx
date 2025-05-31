import { RefreshCw, Timer } from "lucide-react";
import { RightTabsProps } from "@/types/propTypes";

const RightTabs = ({
  activeTab,
  setActiveTab,
  loadingSitemaps,
  sitemapsLoadTime,
  isAnalyzing,
  analysisLoadTime,
}: RightTabsProps) => {
  return (
    <>
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
                className={`w-4 h-4 ${loadingSitemaps ? "animate-spin" : ""}`}
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
              Time taken to analyze : {(analysisLoadTime / 1000).toFixed(0)}s
            </div>
          ) : null
        ) : null}
      </div>
    </>
  );
};

export default RightTabs;
