import { useCommentsSummarizerAppStore } from "@/store/store";
import { contentTypes, hostNameUrls } from "@/config/config";

const Filters = () => {
  const filters = useCommentsSummarizerAppStore((state) => state.filters);
  const setFilters = useCommentsSummarizerAppStore((state) => state.setFilters);

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "contentType") {
      setFilters({
        ...filters,
        [name]: contentTypes.reduce(
          (acc, curr) => (value === curr.name ? curr : acc),
          {
            name: "Story",
            value: "story",
          }
        ),
      });
    } else {
      setFilters({
        ...filters,
        [name]: hostNameUrls.reduce(
          (acc, curr) => (value === curr.name ? curr : acc),
          {
            name: "India Today (Alpha)",
            url: "https://alpha-opinion.intoday.in/new/comment/getbypostid",
          }
        ),
      });
    }
  };

  return (
    <div className="mb-2">
      <div className="space-y-1">
        <div>
          <label
            htmlFor="contentType"
            className="block font-medium text-gray-700 text-sm"
          >
            Select Content Type
          </label>
          <select
            id="contentType"
            name="contentType"
            value={filters.contentType.name}
            onChange={handleFilterChange}
            className="px-2 py-1 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full text-gray-900"
          >
            {contentTypes.map((contentType) => (
              <option value={contentType.name} key={contentType.name}>
                {contentType.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="hostName"
            className="block font-medium text-gray-700 text-sm"
          >
            Select Host Name
          </label>
          <select
            id="hostName"
            name="hostName"
            value={filters.hostName.name}
            onChange={handleFilterChange}
            className="px-2 py-1 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full text-gray-900"
          >
            {hostNameUrls.map((hostName) => (
              <option value={hostName.name} key={hostName.name}>
                {hostName.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
