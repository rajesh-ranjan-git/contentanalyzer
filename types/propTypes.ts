import { Article, Article } from "@/types/types";

export interface HeaderProps {
  title: { name: string; url: string };
}

export interface AnalyzeProps {
  handleAnalyze: () => void;
}

export interface FilteredArticlesProp {
  article: Article;
}

export interface SampleArticleProp {
  article: Article;
}

export interface SummarizeProps {
  handleSummarize: () => void;
}

export interface InputFieldProps {
  errorMessage: string;
}

export type ProgressBarProps = {
  percentage: number;
  color: string;
  hoverColor: string;
  label?: string;
};
