"use client";

import { useState, useEffect } from "react";
import { AnalysisResults, Competitor, Filters } from "@/types/types";
import Header from "@/components/header/header";
import LeftContainer from "@/components/leftColumn/leftContainer";
import RightContainer from "@/components/rightColumn/rightContainer";

const CompetitiveContentAnalyzer = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [inputType, setInputType] = useState<"url" | "text">("url");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResults[] | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    similarity: 30,
    dateRange: "365", // Default to 1 year
  });
  const [activeTab, setActiveTab] = useState<"overview" | "results">(
    "overview"
  );
  const [loadingSitemaps, setLoadingSitemaps] = useState<boolean>(false);
  const [sitemapsLoadTime, setSitemapsLoadTime] = useState<number>(0);
  const [analysisLoadTime, setAnalysisLoadTime] = useState<number>(0);
  const [userContent, setUserContent] = useState<string>(""); // Stores the content of the user's input URL/text

  useEffect(() => {
    if (!isAnalyzing) return;
    setActiveTab("results");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [isAnalyzing]);

  return (
    <div className="flex flex-col bg-gray-100 p-4 sm:p-4 min-h-screen font-sans">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow gap-4 grid grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Input & Controls */}
        <LeftContainer
          inputValue={inputValue}
          setInputValue={setInputValue}
          inputType={inputType}
          setInputType={setInputType}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
          setResults={setResults}
          competitors={competitors}
          setCompetitors={setCompetitors}
          selectedCompetitors={selectedCompetitors}
          setSelectedCompetitors={setSelectedCompetitors}
          filters={filters}
          setFilters={setFilters}
          setActiveTab={setActiveTab}
          loadingSitemaps={loadingSitemaps}
          setLoadingSitemaps={setLoadingSitemaps}
          setSitemapsLoadTime={setSitemapsLoadTime}
          setAnalysisLoadTime={setAnalysisLoadTime}
          setUserContent={setUserContent}
        />

        {/* Right Column - Results & Overview */}
        <RightContainer
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          loadingSitemaps={loadingSitemaps}
          sitemapsLoadTime={sitemapsLoadTime}
          isAnalyzing={isAnalyzing}
          analysisLoadTime={analysisLoadTime}
          competitors={competitors}
          filters={filters}
          results={results}
          inputType={inputType}
          inputValue={inputValue}
          userContent={userContent}
        />
      </main>
    </div>
  );
};

export default CompetitiveContentAnalyzer;
