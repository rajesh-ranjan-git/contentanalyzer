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
  dateRange: "0" | "1" | "7" | "30" | "90" | "365";
};

export type ContentAnalyzerAppState = {
  inputValue: string;
  setInputValue: (value: string) => void;

  inputType: "url" | "text";
  setInputType: (type: "url" | "text") => void;

  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;

  results: AnalysisResults[] | null;
  setResults: (results: AnalysisResults[] | null) => void;

  competitors: Competitor[];
  setCompetitors: (list: Competitor[]) => void;

  selectedCompetitors: string[];
  setSelectedCompetitors: (list: string[]) => void;

  filters: Filters;
  setFilters: (filters: Filters) => void;

  activeTab: "overview" | "results";
  setActiveTab: (tab: "overview" | "results") => void;

  loadingSitemaps: boolean;
  setLoadingSitemaps: (value: boolean) => void;

  sitemapsLoadTime: number;
  setSitemapsLoadTime: (time: number) => void;

  analysisLoadTime: number;
  setAnalysisLoadTime: (time: number) => void;

  userContent: string;
  setUserContent: (content: string) => void;
};
