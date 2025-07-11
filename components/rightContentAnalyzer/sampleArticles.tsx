import { Clock, Link } from "lucide-react";
import { SingleArticleProp } from "@/types/propTypes";
import { formatDate, getSimilarityColor } from "@/helpers/helpers";

const SampleArticles = ({ article }: SingleArticleProp) => {
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
            className="flex items-center text-blue-600"
          >
            <Link className="mr-1 w-4 h-4" />{" "}
            <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-all ease-in-out">
              {article.title}
            </h4>
          </a>
          <span className="text-gray-600 text-sm">
            {formatDate(article.publishedDate)}
          </span>
        </div>
        <p className="mb-1 text-gray-600 text-sm">{article.domain}</p>
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            article.similarity && getSimilarityColor(article.similarity)
          }`}
        >
          {article.similarity}% similar
        </span>
      </div>
    </div>
  );
};

export default SampleArticles;
