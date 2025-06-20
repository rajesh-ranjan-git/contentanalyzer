import { create } from "zustand";
import {
  ContentAnalyzerAppState,
  CommentsSummarizerAppState,
} from "@/types/types";

export const useContentAnalyzerAppStore = create<ContentAnalyzerAppState>(
  (set) => ({
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
  })
);

export const useCommentsSummarizerAppStore = create<CommentsSummarizerAppState>(
  (set) => ({
    inputUrl: "",
    setInputUrl: (value) => set({ inputUrl: value }),

    inputPostId: "",
    setInputPostId: (value) => set({ inputPostId: value }),

    inputType: "url",
    setInputType: (type) => set({ inputType: type }),

    filters: {
      contentType: { name: "Story", value: "story" },
      hostName: {
        name: "India Today (Alpha)",
        url: "https://alpha-opinion.intoday.in/new/comment/getbypostid",
      },
    },
    setFilters: (filters) => set({ filters }),

    isSummarizing: false,
    setIsSummarizing: (type) => set({ isSummarizing: type }),

    activeTab: "summary",
    setActiveTab: (tab) => set({ activeTab: tab }),

    summaryLoadTime: 0,
    setSummaryLoadTime: (time) => set({ summaryLoadTime: time }),

    commentsSummary: "",
    setCommentsSummary: (content) => set({ commentsSummary: content }),

    commentsSentiments: "",
    setCommentsSentiments: (content) => set({ commentsSentiments: content }),

    commentsTheme: "",
    setCommentsTheme: (content) => set({ commentsTheme: content }),

    commentsFrequentKeywords: "",
    setCommentsFrequentKeywords: (content) =>
      set({ commentsFrequentKeywords: content }),
  })
);
