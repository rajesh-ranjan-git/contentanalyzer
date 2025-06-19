import { Filter } from "lucide-react";
import { useContentAnalyzerAppStore } from "@/store/store";

const Filters = () => {
  const filters = useContentAnalyzerAppStore((state) => state.filters);
  const setFilters = useContentAnalyzerAppStore((state) => state.setFilters);

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div className="mb-2">
      <h3 className="flex items-center mb-2 font-medium text-gray-800 text-lg">
        <Filter className="mr-2 w-5 h-5 text-blue-600" /> Filters
      </h3>
      <div className="space-y-1">
        <div>
          <label
            htmlFor="similarity"
            className="block font-medium text-gray-700 text-sm"
          >
            Minimum Similarity (
            <span className="text-gray-600 text-sm">{filters.similarity}%</span>
            )
          </label>
          <input
            type="range"
            id="similarity"
            name="similarity"
            min="0"
            max="100"
            value={filters.similarity}
            onChange={handleFilterChange}
            className="bg-gray-200 rounded-lg w-full h-1 accent-blue-600 appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label
            htmlFor="dateRange"
            className="block mb-1 font-medium text-gray-700 text-sm"
          >
            Content Published In
          </label>
          <select
            id="dateRange"
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            className="px-2 py-1 border border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-full text-gray-900"
          >
            <option value="1">Last 1 day</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
            <option value="0">All time</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Filters;
