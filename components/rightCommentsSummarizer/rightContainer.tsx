import { useCommentsSummarizerAppStore } from "@/store/store";
import RightTabs from "@/components/rightCommentsSummarizer/rightTabs";
import Summary from "@/components/rightCommentsSummarizer/summary";
import Sentiments from "@/components/rightCommentsSummarizer/sentiments";

const RightContainer = () => {
  const activeTab = useCommentsSummarizerAppStore((state) => state.activeTab);

  return (
    <section className="lg:col-span-2 bg-white shadow-md px-4 py-1 rounded-lg min-h-[85vh] max-h-[85vh] overflow-hidden">
      <RightTabs />

      {/* Tab Content */}
      {activeTab === "summary" && <Summary />}

      {activeTab === "sentiments" && <Sentiments />}
    </section>
  );
};

export default RightContainer;
