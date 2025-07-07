import {
  CheckCircle,
  RefreshCw,
  Gauge,
  Smile,
  Frown,
  Meh,
  ShieldAlert,
} from "lucide-react";
import { useCommentsSummarizerAppStore } from "@/store/store";
import ProgressBar from "./progressBar";

const Sentiments = () => {
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
        <Gauge className="mr-2 w-5 h-5 text-blue-600" /> Sentiments Analysis
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
      result.sentiment &&
      result.sentiment.positive !== 0 &&
      result.sentiment.neutral &&
      result.sentiment.negative ? (
        <div className="[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 mb-2 border border-gray-200 rounded-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 max-h-[68vh] overflow-y-auto transition-all ease-in-out">
          <div className="p-2 px-4">
            <div className="flex flex-col justify-between items-start gap-2">
              <div className="flex items-center gap-2 mb-1 w-full text-gray-700">
                <div className="bg-green-500 rounded-full w-6 h-5.5">
                  &nbsp;
                </div>
                <Smile size={24} className="text-green-700" />
                <div className="flex items-center gap-2 w-full">
                  Positive :{" "}
                  <span className="font-semibold">
                    {Number(result.sentiment.positive) || 0}%
                  </span>
                  <ProgressBar
                    percentage={Number(result.sentiment.positive) || 0}
                    color="bg-green-500"
                    hoverColor="bg-green-700"
                  />
                </div>
              </div>
              <div className="flex gap-2 mb-1 w-full text-gray-700 item-center">
                <div className="bg-gray-500 rounded-full w-6 h-5.5">&nbsp;</div>
                <Meh size={24} className="text-gray-700" />
                <div className="flex items-center gap-2 w-full">
                  Neutral :{" "}
                  <span className="font-semibold">
                    {Number(result.sentiment.neutral) || 0}%
                  </span>
                  <ProgressBar
                    percentage={Number(result.sentiment.neutral) || 0}
                    color="bg-gray-500"
                    hoverColor="bg-gray-700"
                  />
                </div>
              </div>
              <div className="flex gap-2 mb-1 w-full text-gray-700 item-center">
                <div className="bg-red-500 rounded-full w-6 h-5.5">&nbsp;</div>
                <Frown size={24} className="text-red-700" />
                <span className="flex items-center gap-2 w-full">
                  Negative :{" "}
                  <span className="font-semibold">
                    {Number(result.sentiment.negative) || 0}%
                  </span>
                  <ProgressBar
                    percentage={Number(result.sentiment.negative) || 0}
                    color="bg-red-500"
                    hoverColor="bg-red-700"
                  />
                </span>
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
                  Unable to analyze sentiment - {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Sentiments;
