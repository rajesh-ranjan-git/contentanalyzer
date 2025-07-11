import { AlertCircle, Eye, RefreshCw } from "lucide-react";
import { useContentAnalyzerAppStore } from "@/store/store";
import FilteredArticles from "@/components/rightContentAnalyzer/filteredArticles";
import { formatDate } from "@/helpers/helpers";

const Overview = () => {
  const filters = useContentAnalyzerAppStore((state) => state.filters);
  const loadingSitemaps = useContentAnalyzerAppStore(
    (state) => state.loadingSitemaps
  );
  const competitors = useContentAnalyzerAppStore((state) => state.competitors);

  // Filtered articles for display in the overview tab
  const filteredArticles = (competitorId: string) => {
    const competitor = competitors.find((c) => c.id === competitorId);
    if (!competitor || !competitor.sampleArticlesList) return [];

    return competitor.sampleArticlesList
      .filter((article) => {
        const articleDate = new Date(article.published_date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(filters.dateRange));
        return articleDate >= cutoffDate;
      })
      .sort(
        (a, b) =>
          new Date(b.published_date).getTime() -
          new Date(a.published_date).getTime()
      );
  };

  return (
    <div className="[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 min-h-[75vh] overflow-y-auto transition-all ease-in-out">
      <h2 className="flex items-center mb-2 font-medium text-gray-800 text-xl">
        <Eye className="mr-2 w-5 h-5 text-blue-600" /> Competitor Overview
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
                No competitor data loaded. Please ensure sitemap URLs are
                correct and try refreshing.
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

      {!loadingSitemaps &&
        competitors &&
        competitors.length > 0 &&
        competitors.map((competitor) => (
          <div
            key={competitor.id}
            className="mb-2 border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="flex justify-between items-center bg-gray-50 p-2 px-4">
              <h3 className="font-semibold text-gray-800 text-lg">
                {competitor.name}
              </h3>
              <span className="text-gray-600 text-sm">
                <span className="font-bold">Last updated : </span>
                {formatDate(competitor.lastUpdated)}
              </span>
            </div>
            <div className="p-2 px-4">
              <div className="flex justify-between items-center">
                <p className="mb-1 text-gray-700">
                  <span className="font-semibold">Domain: </span>
                  <a
                    href={`https://${competitor.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {competitor.domain}
                  </a>
                </p>
                <div className="flex gap-4">
                  <p className="mb-1 text-gray-700">
                    <span className="font-semibold">
                      Total articles found :{" "}
                    </span>
                    {competitor.totalArticlesCount
                      ? competitor.totalArticlesCount
                      : 0}
                  </p>
                  <p className="mb-1 text-gray-700">
                    <span className="font-semibold">(Sample : </span>
                    {competitor.sampleArticlesList
                      ? competitor.sampleArticlesList.length
                      : 0}
                    <span className="font-semibold">)</span>
                  </p>
                </div>
              </div>
              <h4 className="mb-1 font-medium text-gray-800 text-lg">
                Latest Articles
              </h4>
              <div className="relative [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100 pl-4 border-gray-200 border-l-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-2 max-h-40 overflow-y-auto">
                {filteredArticles(competitor.id).length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    No articles found matching current filters for{" "}
                    {competitor.name}.
                  </p>
                ) : (
                  filteredArticles(competitor.id).map((article) => (
                    <FilteredArticles article={article} key={article.id} />
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Overview;
