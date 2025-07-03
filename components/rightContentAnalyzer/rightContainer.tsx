import { useContentAnalyzerAppStore } from "@/store/store";
import RightTabs from "@/components/rightContentAnalyzer/rightTabs";
import Overview from "@/components/rightContentAnalyzer/overview";
import Results from "@/components/rightContentAnalyzer/results";

const RightContainer = () => {
  const activeTab = useContentAnalyzerAppStore((state) => state.activeTab);

  return (
    <section className="lg:col-span-2 bg-white [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 shadow-md px-4 py-1 rounded-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 min-h-[85vh] max-h-[85vh] overflow-y-scroll transition-all ease-in-out [&::-webkit-scrollbar-track]:transparent">
      <RightTabs />

      {/* Tab Content */}
      {activeTab === "overview" && <Overview />}

      {activeTab === "results" && <Results />}
    </section>
  );
};

export default RightContainer;
