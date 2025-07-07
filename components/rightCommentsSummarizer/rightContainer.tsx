import { useCommentsSummarizerAppStore } from "@/store/store";
import RightTabs from "@/components/rightCommentsSummarizer/rightTabs";
import Summary from "@/components/rightCommentsSummarizer/summary";
import Sentiments from "@/components/rightCommentsSummarizer/sentiments";
import FrequentKeywords from "@/components/rightCommentsSummarizer/frequentKeywords";
import KeyTheme from "@/components/rightCommentsSummarizer/keyTheme";

const RightContainer = () => {
  const activeTab = useCommentsSummarizerAppStore((state) => state.activeTab);

  return (
    <section className="lg:col-span-2 bg-white [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 shadow-md px-4 py-1 rounded-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 min-h-[85vh] max-h-[85vh] overflow-y-auto transition-all ease-in-out [&::-webkit-scrollbar-track]:transparent">
      <RightTabs />

      {/* Tab Content */}
      {activeTab === "summary" && <Summary />}
      {activeTab === "sentiments" && <Sentiments />}
      {activeTab === "theme" && <KeyTheme />}
      {activeTab === "frequent-keywords" && <FrequentKeywords />}
    </section>
  );
};

export default RightContainer;
