import Link from "next/link";
import {
  BarChart3,
  Download,
  Settings,
  SquareArrowOutUpRight,
} from "lucide-react";
import { appNames, BASE_URL } from "@/config/config";
import { HeaderProps } from "@/types/propTypes";

const Header = ({ title }: HeaderProps) => {
  if (!BASE_URL) return null;

  return (
    <header className="flex flex-wrap justify-between items-center bg-white shadow-sm mb-2 p-2 rounded-lg">
      <h1 className="flex items-center mb-2 sm:mb-0 font-semibold text-gray-800 text-2xl">
        <BarChart3 className="mr-2 w-6 h-6 text-blue-600" /> {title.name}
      </h1>
      <div className="flex items-center space-x-4">
        <Link
          href={`${BASE_URL}\\${title.name === appNames.cca.name ? appNames.cs.url : appNames.cca.url}`}
          target="_blank"
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <SquareArrowOutUpRight className="mr-1 w-5 h-5" /> Go To {title.name === appNames.cca.name ? appNames.cs.name : appNames.cca.name}
        </Link>
        <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
          <Download className="mr-1 w-5 h-5" /> Export
        </button>
        <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
          <Settings className="mr-1 w-5 h-5" /> Settings
        </button>
      </div>
    </header>
  );
};

export default Header;
