import { useCommentsSummarizerAppStore } from "@/store/store";
import RightTabs from "@/components/rightColumnCs/rightTabs";
import Summary from "@/components/rightColumnCs/summary";
import Sentiments from "@/components/rightColumnCs/sentiments";

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
