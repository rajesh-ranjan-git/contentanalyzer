import {
  CheckCircle,
  Sparkle,
  RefreshCw,
  ShieldAlert,
  BadgeCheck,
  BadgeInfo,
  ArrowBigRightDash,
  Text,
} from "lucide-react";
import { useCommentsSummarizerAppStore } from "@/store/store";

const Summary = () => {
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
        <Sparkle className="mr-2 w-5 h-5 text-blue-600" /> Comments Summary
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

      {!isSummarizing && result && result.summary ? (
        <div className="[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 mb-2 border border-gray-200 rounded-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 max-h-[68vh] overflow-y-auto transition-all ease-in-out">
          <div className="p-4">
            <div className="flex flex-col justify-between items-center gap-2">
              {result.summary.pros && result.summary.pros.length > 0 && (
                <div className="flex items-center gap-2 bg-green-200 p-2 border border-green-600 rounded-md w-full">
                  <div className="min-w-18 font-semibold text-green-600 text-xl">
                    <p className="flex items-center gap-1">
                      <span>Pros</span>
                      <ArrowBigRightDash className="min-w-6 max-w-6 min-h-6 max-h-6" />
                    </p>
                  </div>
                  <ul className="list-inside list-item">
                    {result.summary.pros.map((pro, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-green-900 text-sm"
                      >
                        <BadgeCheck className="min-w-4 max-w-4 min-h-4 max-h-4 text-green-600" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.summary.cons && result.summary.cons.length > 0 && (
                <div className="flex items-center gap-2 bg-red-200 p-2 border border-red-600 rounded-md w-full">
                  <div className="min-w-18 font-semibold text-red-600 text-xl">
                    <p className="flex items-center gap-1">
                      <span>Cons</span>
                      <ArrowBigRightDash className="min-w-6 max-w-6 min-h-6 max-h-6" />
                    </p>
                  </div>
                  <ul className="list-inside list-item">
                    {result.summary.cons.map((con, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-red-900 text-sm"
                      >
                        <BadgeInfo className="min-w-4 max-w-4 min-h-4 max-h-4 text-red-600" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-2 py-2">
                <h2 className="flex items-center mb-2 font-medium text-gray-800 text-xl">
                  <Text className="mr-2 w-5 h-5 text-blue-600" /> Overall
                  Summary
                </h2>
                {result.summary.overall.split("\n\n").length === 1 ? (
                  <p className="text-gray-700 text-sm">
                    {result.summary.overall}
                  </p>
                ) : (
                  result.summary.overall
                    .split("\n\n")
                    .map((paragraph, index) => (
                      <p key={index} className="text-gray-700 text-sm">
                        {paragraph}
                      </p>
                    ))
                )}
              </div>
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
                  Unable to generate summary - {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Summary;
