import { AlertCircle } from "lucide-react";
import { useCommentsSummarizerAppStore } from "@/store/store";
import Filters from "@/components/leftCommentsSummarizer/filters";

const InputField = () => {
  const inputUrl = useCommentsSummarizerAppStore((state) => state.inputUrl);
  const setInputUrl = useCommentsSummarizerAppStore(
    (state) => state.setInputUrl
  );
  const inputPostId = useCommentsSummarizerAppStore(
    (state) => state.inputPostId
  );
  const setInputPostId = useCommentsSummarizerAppStore(
    (state) => state.setInputPostId
  );
  const inputType = useCommentsSummarizerAppStore((state) => state.inputType);
  const errorMessage = useCommentsSummarizerAppStore(
    (state) => state.errorMessage
  );

  return (
    <div className="mb-2 pb-6 h-full">
      {inputType === "url" ? (
        <div>
          <label
            htmlFor="url"
            className="block mb-1 font-medium text-gray-700 text-sm"
          >
            Enter URL
          </label>
          <textarea
            id="url"
            className="px-4 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full min-h-40 text-gray-900"
            placeholder="Paste your URL here..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div>
            <label
              htmlFor="postId"
              className="block mb-1 font-medium text-gray-700 text-sm"
            >
              Enter Post ID
            </label>
            <input
              id="postId "
              className="px-4 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full text-gray-900"
              placeholder="Paste your Post ID here..."
              value={inputPostId}
              onChange={(e) => setInputPostId(e.target.value)}
            />
          </div>
          <Filters />
        </div>
      )}
      {errorMessage && (
        <p className="flex items-center mt-2 text-red-600 text-sm break-words">
          <AlertCircle className="mr-1 w-4 h-4" /> {errorMessage}
        </p>
      )}
    </div>
  );
};

export default InputField;
