import { useContentAnalyzerAppStore } from "@/store/store";
import { RefreshCw } from "lucide-react";

const SelectCompetitors = () => {
  const loadingSitemaps = useContentAnalyzerAppStore((state) => state.loadingSitemaps);
  const competitors = useContentAnalyzerAppStore((state) => state.competitors);
  const selectedCompetitors = useContentAnalyzerAppStore((state) => state.selectedCompetitors);
  const setSelectedCompetitors = useContentAnalyzerAppStore(
    (state) => state.setSelectedCompetitors
  );

  const handleCompetitorSelect = (competitorId: string) => {
    setSelectedCompetitors(
      selectedCompetitors.includes(competitorId)
        ? selectedCompetitors.filter((id) => id !== competitorId)
        : [...selectedCompetitors, competitorId]
    );
  };

  return (
    <div className="flex flex-col flex-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-gray-100 p-1 border border-slate-300 rounded-md [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-2 max-h-[12vh] overflow-y-scroll">
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
              className="rounded focus:ring-blue-500 w-3 h-3 text-blue-600 form-checkbox"
              checked={selectedCompetitors.includes(comp.id)}
              onChange={() => handleCompetitorSelect(comp.id)}
            />
            <span className="ml-3 font-medium text-gray-800 text-sm">
              {comp.name}
            </span>
            <span className="ml-auto text-gray-600 text-xs">
              {comp.articles} articles
            </span>
          </label>
        ))
      )}
    </div>
  );
};

export default SelectCompetitors;
