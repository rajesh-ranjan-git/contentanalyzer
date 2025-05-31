import { RightContainerProps } from "@/types/propTypes";
import RightTabs from "@/components/rightColumn/rightTabs";
import Overview from "@/components/rightColumn/overview";
import Results from "@/components/rightColumn/results";

const RightContainer = ({
  activeTab,
  setActiveTab,
  loadingSitemaps,
  sitemapsLoadTime,
  isAnalyzing,
  analysisLoadTime,
  competitors,
  filters,
  results,
  inputType,
  inputValue,
  userContent,
}: RightContainerProps) => {
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
