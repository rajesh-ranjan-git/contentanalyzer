"use client";

import { useEffect } from "react";
import { appNames } from "@/config/config";
import { useContentAnalyzerAppStore } from "@/store/store";
import Header from "@/components/header/header";
import LeftContainer from "@/components/leftColumn/leftContainer";
import RightContainer from "@/components/rightColumn/rightContainer";

const CompetitiveContentAnalyzer = () => {
  const isAnalyzing = useContentAnalyzerAppStore((state) => state.isAnalyzing);
  const setActiveTab = useContentAnalyzerAppStore(
    (state) => state.setActiveTab
  );

  useEffect(() => {
    if (!isAnalyzing) return;
    setActiveTab("results");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [isAnalyzing]);

  return (
    <>
      {/* Header */}
      <Header title={appNames.cca} />

      {/* Main Content Area */}
      <main className="flex-grow gap-4 grid grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Input & Controls */}
        <LeftContainer />

        {/* Right Column - Results & Overview */}
        <RightContainer />
      </main>
    </>
  );
};

export default CompetitiveContentAnalyzer;
