import { Article } from "@/types/types";

export interface HeaderProps {
  title: { name: string, url: string };
}

export interface InputFieldProps {
  errorMessage: string;
}

export interface AnalyzeProps {
  handleAnalyze: () => void;
}

export interface SingleArticleProp {
  article: Article;
}

