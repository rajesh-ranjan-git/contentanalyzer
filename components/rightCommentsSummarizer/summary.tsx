import { CheckCircle, Sparkle, RefreshCw } from "lucide-react";
import { useCommentsSummarizerAppStore } from "@/store/store";
import { useEffect } from "react";

const Summary = () => {
  const inputType = useCommentsSummarizerAppStore((state) => state.inputType);
  const commentsSummary = useCommentsSummarizerAppStore(
    (state) => state.commentsSummary
  );
  const isSummarizing = useCommentsSummarizerAppStore(
    (state) => state.isSummarizing
  );

  return (
    <div className="[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 min-h-[82vh] max-h-[82vh] overflow-y-scroll transition-all ease-in-out">
      <h2 className="flex items-center mb-2 font-medium text-gray-800 text-xl">
        <Sparkle className="mr-2 w-5 h-5 text-blue-600" /> Comments Summary
      </h2>
      {!commentsSummary && (
        <div className="bg-blue-50 p-2 px-4 border-blue-400 border-l-4 rounded-md text-blue-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle
                className="w-5 h-5 text-blue-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm">
                Enter your {inputType === "url" ? "URL" : "Post Details"} to
                start summarizing.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSummarizing && (
        <div className="flex justify-center items-center p-4 text-blue-600">
          <RefreshCw className="mr-2 w-5 h-5 animate-spin" />
          <p>Summarizing comments...</p>
        </div>
      )}

      {!isSummarizing && commentsSummary && (
        <div className="[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 mb-2 border border-gray-200 rounded-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 max-h-[68vh] overflow-y-scroll transition-all ease-in-out">
          <div className="p-2 px-4">
            <div className="flex justify-between items-center">
              <p className="mb-1 text-gray-700">{commentsSummary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
