import { create } from "zustand";
import { ContentAnalyzerAppState } from "@/types/types";

export const useAppStore = create<ContentAnalyzerAppState>((set) => ({
  inputValue: "",
  setInputValue: (value) => set({ inputValue: value }),

  inputType: "url",
  setInputType: (type) => set({ inputType: type }),

  isAnalyzing: false,
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),

  results: null,
  setResults: (results) => set({ results }),

  competitors: [],
  setCompetitors: (list) => set({ competitors: list }),

  selectedCompetitors: [],
  setSelectedCompetitors: (list) => set({ selectedCompetitors: list }),

  filters: {
    similarity: 30,
    dateRange: "365",
  },
  setFilters: (filters) => set({ filters }),

  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),

  loadingSitemaps: false,
  setLoadingSitemaps: (value) => set({ loadingSitemaps: value }),

  sitemapsLoadTime: 0,
  setSitemapsLoadTime: (time) => set({ sitemapsLoadTime: time }),

  analysisLoadTime: 0,
  setAnalysisLoadTime: (time) => set({ analysisLoadTime: time }),

  userContent: "",
  setUserContent: (content) => set({ userContent: content }),
}));
