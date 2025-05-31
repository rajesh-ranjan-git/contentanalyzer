import { InputFieldProps } from "@/types/types";
import { AlertCircle } from "lucide-react";

const InputField = ({
  inputType,
  inputValue,
  setInputValue,
  errorMessage,
}: InputFieldProps) => {
  return (
    <div className="mb-2">
      <label
        htmlFor="contentInput"
        className="block mb-1 font-medium text-gray-700 text-sm"
      >
        Enter {inputType === "url" ? "URL" : "Content"}
      </label>
      {inputType === "url" ? (
        <input
          type="url"
          id="contentInput"
          className="px-4 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full text-gray-900"
          placeholder="e.g., https://yourwebsite.com/article"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      ) : (
        <textarea
          id="contentInput"
          className="px-4 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full h-32 text-gray-900 resize-y"
          placeholder="Paste your content here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        ></textarea>
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
