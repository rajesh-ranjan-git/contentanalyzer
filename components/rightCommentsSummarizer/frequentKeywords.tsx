import { CheckCircle, Hash, RefreshCw, ShieldAlert, Tags } from "lucide-react";
import { useCommentsSummarizerAppStore } from "@/store/store";

const FrequentKeywords = () => {
  const inputType = useCommentsSummarizerAppStore((state) => state.inputType);
  const result = useCommentsSummarizerAppStore((state) => state.result);
  const isSummarizing = useCommentsSummarizerAppStore(
    (state) => state.isSummarizing
  );
  const errorMessage = useCommentsSummarizerAppStore(
    (state) => state.errorMessage
  );

  return (
    <div className="[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 min-h-[75vh] overflow-y-auto transition-all ease-in-out">
      <h2 className="flex items-center mb-2 font-medium text-gray-800 text-xl">
        <Tags className="mr-2 w-5 h-5 text-blue-600" /> Frequent Keywords
      </h2>
      {!result && !isSummarizing && !errorMessage && (
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

      {!isSummarizing &&
      result &&
      result.keywords &&
      result.keywords.length > 0 ? (
        <div className="[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 mb-2 border border-gray-200 rounded-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 max-h-[68vh] overflow-y-scroll transition-all ease-in-out">
          <div className="p-2 px-4">
            <div className="flex flex-col justify-between items-start">
              {result.keywords.map((keyword) => (
                <p
                  className="flex items-center gap-1 bg-green-300 mb-1 p-1 px-4 rounded-3xl font-semibold text-green-800"
                  key={keyword}
                >
                  <Hash size={16} />
                  {keyword}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        errorMessage && (
          <div className="bg-red-50 p-2 px-4 border-red-400 border-l-4 rounded-md text-red-800">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldAlert
                  className="w-5 h-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  Unable to get frequent keywords - {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default FrequentKeywords;
