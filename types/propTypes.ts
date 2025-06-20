import { Article } from "@/types/types";

export interface HeaderProps {
  title: { name: string; url: string };
}

export interface AnalyzeProps {
  handleAnalyze: () => void;
}

export interface SingleArticleProp {
  article: Article;
}

export interface SummarizeProps {
  handleSummarize: () => void;
}

export type ProgressBarProps = {
  percentage: number;
  color: string;
  hoverColor: string;
  label?: string;
};
