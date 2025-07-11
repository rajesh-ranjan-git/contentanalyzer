import { Clock, Link, RefreshCw } from "lucide-react";
import { FilteredArticlesProp } from "@/types/propTypes";
import { useContentAnalyzerAppStore } from "@/store/store";
import { formatDate } from "@/helpers/helpers";

const FilteredArticles = ({ article }: FilteredArticlesProp) => {
  const isCalculatingWordCount = useContentAnalyzerAppStore(
    (state) => state.isCalculatingWordCount
  );

  const date = formatDate(article.published_date).split(", ");

  return (
    <div className="relative flex items-center space-x-2 pb-1">
      <div className="z-10 relative flex flex-shrink-0 justify-center items-center bg-blue-600 rounded-full w-8 h-8">
        <Clock className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 bg-gray-50 p-2 rounded-lg">
        <div className="flex justify-between items-center mb-1">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 text-sm"
          >
            <Link className="mr-1 w-4 h-4" />{" "}
            <h4 className="font-medium text-gray-900 hover:text-blue-600 text-sm transition-all ease-in-out">
              {article.title}
            </h4>
          </a>
          <span className="min-w-20 text-gray-600 text-sm">
            {date[0]}, {date[1]}
          </span>
        </div>
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-4">
            <p className="flex items-center gap-2 mb-1 text-gray-600 text-sm">
              <span className="font-semibold">Article's Word Count : </span>
              {isCalculatingWordCount ? (
                <>
                  <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />{" "}
                  <span className="text-blue-600">Calculating...</span>
                </>
              ) : article.content && article.content?.word_count > 0 ? (
                article.content?.word_count
              ) : null}
            </p>
            <p className="mb-1 text-gray-600 text-sm">
              <span className="font-semibold">Domain : </span>
              {article.domain}
            </p>
          </div>
          <span className="min-w-16 text-gray-600 text-sm">
            {date[date.length - 1]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilteredArticles;
