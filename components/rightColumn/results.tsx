import { BarChart3, CheckCircle, Link, RefreshCw } from "lucide-react";
import { useContentAnalyzerAppStore } from "@/store/store";
import SampleArticles from "@/components/rightColumn/sampleArticles";

const Results = () => {
  const isAnalyzing = useContentAnalyzerAppStore((state) => state.isAnalyzing);
  const results = useContentAnalyzerAppStore((state) => state.results);
  const inputType = useContentAnalyzerAppStore((state) => state.inputType);
  const inputValue = useContentAnalyzerAppStore((state) => state.inputValue);
  const userContent = useContentAnalyzerAppStore((state) => state.userContent);

  return (
    <div className="[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 max-h-[82vh] overflow-y-scroll transition-all ease-in-out">
      <h2 className="flex items-center mb-2 font-medium text-gray-800 text-xl">
        <BarChart3 className="mr-2 w-5 h-5 text-blue-600" /> Analysis Results
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
                Enter your content/URL and select competitors to start the
                analysis.
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
                    {compResult.competitorName} based on current filters.
                  </p>
                ) : (
                  <div className="relative [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100 pl-4 border-gray-200 border-l-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-2 max-h-40 overflow-y-scroll">
                    {compResult.articles
                      .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0)) // Sort by similarity descending
                      .map((article) => (
                        <SampleArticles article={article} key={article.id} />
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
