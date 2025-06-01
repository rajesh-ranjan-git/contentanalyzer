import { useAppStore } from "@/store/store";
import RightTabs from "@/components/rightColumn/rightTabs";
import Overview from "@/components/rightColumn/overview";
import Results from "@/components/rightColumn/results";

const RightContainer = () => {
  const inputValue = useAppStore((state) => state.inputValue);
  const activeTab = useAppStore((state) => state.activeTab);
  const inputType = useAppStore((state) => state.inputType);
  const filters = useAppStore((state) => state.filters);
  const isAnalyzing = useAppStore((state) => state.isAnalyzing);
  const loadingSitemaps = useAppStore((state) => state.loadingSitemaps);
  const competitors = useAppStore((state) => state.competitors);
  const sitemapsLoadTime = useAppStore((state) => state.sitemapsLoadTime);
  const results = useAppStore((state) => state.results);
  const analysisLoadTime = useAppStore((state) => state.analysisLoadTime);
  const userContent = useAppStore((state) => state.userContent);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  return (
    <section className="lg:col-span-2 bg-white shadow-md px-4 py-1 rounded-lg max-h-dvh overflow-hidden">
      <RightTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loadingSitemaps={loadingSitemaps}
        sitemapsLoadTime={sitemapsLoadTime}
        isAnalyzing={isAnalyzing}
        analysisLoadTime={analysisLoadTime}
      />

      {/* Tab Content */}
      {activeTab === "overview" && (
        <Overview
          competitors={competitors}
          loadingSitemaps={loadingSitemaps}
          filters={filters}
        />
      )}

      {activeTab === "results" && (
        <Results
          isAnalyzing={isAnalyzing}
          results={results}
          inputType={inputType}
          inputValue={inputValue}
          userContent={userContent}
        />
      )}
    </section>
  );
};

export default RightContainer;
