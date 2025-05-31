import { Article, AnalysisResults, Competitor, Filters } from "@/types/types";

export interface LeftContainerProps {
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
}

export interface InputToggleProps {
  inputType: "url" | "text";
  setInputType: (value: "url" | "text") => void;
}

export interface InputFieldProps {
  inputType: "url" | "text";
  inputValue: string;
  setInputValue: (value: string) => void;
  errorMessage: string;
}

export interface SelectCompetitorsProps {
  competitors: Competitor[];
  loadingSitemaps: boolean;
  selectedCompetitors: string[];
  setSelectedCompetitors: (value: string[]) => void;
}

export interface FiltersProps {
  filters: Filters;
  setFilters: (value: Filters) => void;
}

export interface AnalyzeProps {
  handleAnalyze: () => void;
  selectedCompetitors: string[];
  inputValue: string;
  isAnalyzing: boolean;
}

export interface RightContainerProps {
  activeTab: "overview" | "results";
  setActiveTab: (value: "overview" | "results") => void;
  loadingSitemaps: boolean;
  sitemapsLoadTime: number;
  isAnalyzing: boolean;
  analysisLoadTime: number;
  competitors: Competitor[];
  filters: Filters;
  results: AnalysisResults[] | null;
  inputType: "url" | "text";
  inputValue: string;
  userContent: string;
}

export interface RightTabsProps {
  activeTab: "overview" | "results";
  setActiveTab: (value: "overview" | "results") => void;
  loadingSitemaps: boolean;
  sitemapsLoadTime: number;
  isAnalyzing: boolean;
  analysisLoadTime: number;
}

export interface OverviewProps {
  competitors: Competitor[];
  loadingSitemaps: boolean;
  filters: Filters;
}

export interface ResultsProps {
  isAnalyzing: boolean;
  results: AnalysisResults[] | null;
  inputType: "url" | "text";
  inputValue: string;
  userContent: string;
}

export interface SingleArticleProp {
  article: Article;
}
