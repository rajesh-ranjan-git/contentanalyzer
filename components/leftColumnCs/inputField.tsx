import { AlertCircle } from "lucide-react";
import { InputFieldProps } from "@/types/propTypes";
import { useCommentsSummarizerAppStore } from "@/store/store";

const InputField = ({ errorMessage }: InputFieldProps) => {
  const inputValue = useCommentsSummarizerAppStore((state) => state.inputValue);
  const setInputValue = useCommentsSummarizerAppStore(
    (state) => state.setInputValue
  );
  const inputType = useCommentsSummarizerAppStore((state) => state.inputType);

  return (
    <div className="mb-2 pb-6 h-full">
      <label
        htmlFor="contentInput"
        className="block mb-1 font-medium text-gray-700 text-sm"
      >
        Enter {inputType === "url" ? "URL" : "Post ID"}
      </label>
      {inputType === "url" ? (
        <input
          id="contentInput"
          className="px-4 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full text-gray-900"
          placeholder="Paste your comments JSON url here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      ) : (
        <input
          id="contentInput"
          className="px-4 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full text-gray-900"
          placeholder="Paste your post ID here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      )}
      {errorMessage && (
        <p className="flex items-center mt-2 text-red-600 text-sm">
          <AlertCircle className="mr-1 w-4 h-4" /> {errorMessage}
        </p>
      )}
    </div>
  );
};

export default InputField;
