import { RefreshCw, TrendingUp } from "lucide-react";
import { AnalyzeProps } from "@/types/propTypes";
import { useAppStore } from "@/store/store";

const Analyze = ({ handleAnalyze }: AnalyzeProps) => {
  const inputValue = useAppStore((state) => state.inputValue);
  const selectedCompetitors = useAppStore((state) => state.selectedCompetitors);
  const isAnalyzing = useAppStore((state) => state.isAnalyzing);

  return (
    <button
      onClick={handleAnalyze}
      className={`flex justify-center items-center bg-blue-600 hover:bg-blue-700 shadow-lg px-6 py-2 rounded-md w-full font-semibold text-white text-lg transition-colors ${
        selectedCompetitors.length === 0 || !inputValue.trim()
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer"
      } ${isAnalyzing && "opacity-50 cursor-progress"}`}
      disabled={
        isAnalyzing || selectedCompetitors.length === 0 || !inputValue.trim()
      }
    >
      {isAnalyzing ? (
        <>
          <RefreshCw className="mr-2 w-5 h-5 animate-spin" /> Analyzing...
        </>
      ) : (
        <>
          <TrendingUp className="mr-2 w-5 h-5" /> Start Analysis
        </>
      )}
    </button>
  );
};

export default Analyze;
