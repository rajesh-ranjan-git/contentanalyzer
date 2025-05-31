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

export type HTMLInputTypeRangeElement = HTMLInputElement & {
  type: "range";
};
