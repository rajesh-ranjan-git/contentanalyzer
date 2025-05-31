import { AnalysisResults, Competitor, Filters } from "@/types/types";

export type LeftContainerProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  inputType: "url" | "text";
  setInputType: (value: "url" | "text") => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
  setResults: (value: AnalysisResults[] | null) => void;
  competitors: Competitor[];
  setCompetitors: (value: Competitor[]) => void;
  selectedCompetitors: string[];
  setSelectedCompetitors: (value: string[]) => void;
  filters: Filters;
  setFilters: (value: Filters) => void;
  setActiveTab: (value: "overview" | "results") => void;
  loadingSitemaps: boolean;
  setLoadingSitemaps: (value: boolean) => void;
  setSitemapsLoadTime: (value: number) => void;
  setAnalysisLoadTime: (value: number) => void;
  setUserContent: (value: string) => void;
};

export type InputToggleProps = {
  inputType: "url" | "text";
  setInputType: (value: "url" | "text") => void;
};

export type InputFieldProps = {
  inputType: "url" | "text";
  inputValue: string;
  setInputValue: (value: string) => void;
  errorMessage: string;
};

export type SelectCompetitorsProps = {
  competitors: Competitor[];
  loadingSitemaps: boolean;
  selectedCompetitors: string[];
  setSelectedCompetitors: (value: string[]) => void;
};

export type FiltersProps = {
  filters: Filters;
  setFilters: (value: Filters) => void;
};

export type AnalyzeProps = {
  handleAnalyze: () => void;
  selectedCompetitors: string[];
  inputValue: string;
  isAnalyzing: boolean;
};
