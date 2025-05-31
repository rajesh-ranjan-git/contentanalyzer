import { BarChart3, Download, Settings } from "lucide-react";

const Header = () => {
  return (
    <header className="flex flex-wrap justify-between items-center bg-white shadow-sm mb-4 p-4 rounded-lg">
      <h1 className="flex items-center mb-2 sm:mb-0 font-semibold text-gray-800 text-2xl">
        <BarChart3 className="mr-2 w-6 h-6 text-blue-600" /> Competitive Content
        Analyzer
      </h1>
      <div className="flex items-center space-x-4">
        <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
          <Download className="mr-1 w-5 h-5" /> Export
        </button>
        <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
          <Settings className="mr-1 w-5 h-5" /> Settings
        </button>
      </div>
    </header>
  );
};

export default Header;
