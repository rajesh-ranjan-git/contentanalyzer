import { useContentAnalyzerAppStore } from "@/store/store";
import RightTabs from "@/components/rightContentAnalyzer/rightTabs";
import Overview from "@/components/rightContentAnalyzer/overview";
import Results from "@/components/rightContentAnalyzer/results";

const RightContainer = () => {
  const activeTab = useContentAnalyzerAppStore((state) => state.activeTab);

  return (
    <section className="lg:col-span-2 bg-white shadow-md px-4 py-1 rounded-lg max-h-[85vh] overflow-hidden">
      <RightTabs />

      {/* Tab Content */}
      {activeTab === "overview" && <Overview />}

      {activeTab === "results" && <Results />}
    </section>
  );
};

export default RightContainer;
