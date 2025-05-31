export type Article = {
  id: string;
  title: string;
  domain: string;
  url: string;
  publishDate: string;
  content: string;
  similarity?: number;
};

export type Competitor = {
  id: string;
  name: string;
  domain: string;
  articles: string;
  lastUpdated: string;
  articleList: Article[];
};

export type AnalysisResults = {
  articles: Article[];
  competitorId: string;
  competitorName: string;
};

export type Filters = {
  similarity: number;
  dateRange: string;
  contentType: string;
};

export type LeftColumnProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  inputType: string;
  setInputType: (value: string) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
  setResults: (value: AnalysisResults[] | null) => void;
  competitors: Competitor[];
  setCompetitors: (value: Competitor[]) => void;
  selectedCompetitors: string[];
  setSelectedCompetitors: (value: string[]) => void;
  filters: Filters;
  setFilters: (value: Filters) => void;
  setActiveTab: (value: string) => void;
  loadingSitemaps: boolean;
  setLoadingSitemaps: (value: boolean) => void;
  setSitemapsLoadTime: (value: number) => void;
  setAnalysisLoadTime: (value: number) => void;
  setUserContent: (value: string) => void;
};

export type InputToggleProps = {
  inputType: string;
  setInputType: (value: string) => void;
};

export type InputFieldProps = {
  inputType: string;
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
