import { BookOpen, Link } from "lucide-react";
import { useCommentsSummarizerAppStore } from "@/store/store";

const InputToggle = () => {
  const inputType = useCommentsSummarizerAppStore((state) => state.inputType);
  const setInputType = useCommentsSummarizerAppStore(
    (state) => state.setInputType
  );

  return (
    <div className="flex space-x-2 bg-gray-100 mb-2 p-1 rounded-lg">
      <button
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          inputType === "url"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-700 hover:bg-gray-200"
        }`}
        onClick={() => setInputType("url")}
      >
        <Link className="inline-block mr-1 w-4 h-4" /> URL
      </button>
      <button
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          inputType === "post"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-700 hover:bg-gray-200"
        }`}
        onClick={() => setInputType("post")}
      >
        <BookOpen className="inline-block mr-1 w-4 h-4" /> Post
      </button>
    </div>
  );
};

export default InputToggle;
