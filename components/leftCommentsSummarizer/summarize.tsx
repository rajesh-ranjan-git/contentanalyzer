import { LetterText, RefreshCw, TrendingUp } from "lucide-react";
import { SummarizeProps } from "@/types/propTypes";
import { useCommentsSummarizerAppStore } from "@/store/store";

const Summarize = ({ handleSummarize }: SummarizeProps) => {
  const inputUrl = useCommentsSummarizerAppStore((state) => state.inputUrl);
  const inputHostName = useCommentsSummarizerAppStore(
    (state) => state.inputHostName
  );
  const inputPostId = useCommentsSummarizerAppStore(
    (state) => state.inputPostId
  );
  const inputContentType = useCommentsSummarizerAppStore(
    (state) => state.inputContentType
  );
  const isSummarizing = useCommentsSummarizerAppStore(
    (state) => state.isSummarizing
  );

  return (
    <button
      onClick={handleSummarize}
      className={`flex justify-center items-center bg-blue-600 hover:bg-blue-700 shadow-lg px-6 py-2 rounded-md w-full font-semibold text-white text-lg transition-colors ${
        !inputUrl.trim() &&
        (!inputHostName.trim() ||
          !inputPostId.trim() ||
          !inputContentType.trim())
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer"
      } ${isSummarizing && "opacity-50 cursor-progress"}`}
      disabled={
        isSummarizing ||
        (!inputUrl.trim() &&
          (!inputHostName.trim() ||
            !inputPostId.trim() ||
            !inputContentType.trim()))
      }
    >
      {isSummarizing ? (
        <>
          <RefreshCw className="mr-2 w-5 h-5 animate-spin" /> Summarizing...
        </>
      ) : (
        <>
          <LetterText className="mr-2 w-5 h-5" /> Summarize
        </>
      )}
    </button>
  );
};

export default Summarize;
