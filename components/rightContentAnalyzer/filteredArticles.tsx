import { Clock, Link, Info } from "lucide-react";
import { ArticlesProp } from "@/types/propTypes";
import {
  formatDate,
  getSimilarityColor,
} from "@/helpers/helpers";

const FilteredArticles = ({ article }: ArticlesProp) => {
  const date = formatDate(article.published_date).split(", ");

  console.log("article : ", article);

  return (
    <div className="relative flex items-center space-x-2 pb-1">
      <div className="z-10 relative flex flex-shrink-0 justify-center items-center bg-blue-600 rounded-full w-8 h-8">
        <Clock className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 bg-gray-50 p-2 rounded-lg">
        <div className="flex justify-between items-center gap-2 mb-1">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600"
          >
            <Link className="mr-1 w-4 h-4" />{" "}
            <h4 className="font-medium text-gray-900 hover:text-blue-600 text-sm transition-all ease-in-out">
              {article.title}
            </h4>
          </a>
          <span className="min-w-24 text-gray-600 text-sm text-right">
            {date[0]}, {date[1]}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                article.similarity && getSimilarityColor(article.similarity)
              }`}
            >
              {article.similarity}% similar
            </span>
            <p className="flex items-center gap-2 mb-1 text-gray-600 text-sm">
              <span className="font-semibold">Article's Word Count : </span>
              {article.content && article.content?.word_count > 0 ? (
                article.content?.word_count
              ) : (
                <Info className="w-3 h-3 text-red-600" />
              )}
            </p>
            <p className="mb-1 text-gray-600 text-sm">
              <span className="font-semibold">Domain : </span>
              {article.domain}
            </p>
          </div>
          <span className="min-w-16 text-gray-600 text-sm text-right">
            {date[date.length - 1]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilteredArticles;
