"use client";

import { useEffect } from "react";
import Header from "@/components/header/header";
import { useAppStore } from "@/store/store";
import LeftContainer from "@/components/leftColumn/leftContainer";
import RightContainer from "@/components/rightColumn/rightContainer";

const CompetitiveContentAnalyzer = () => {
  const isAnalyzing = useAppStore((state) => state.isAnalyzing);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

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
        <LeftContainer />

        {/* Right Column - Results & Overview */}
        <RightContainer />
      </main>
    </div>
  );
};

export default CompetitiveContentAnalyzer;
