import { useCallback } from "react";
import { Proportions } from "lucide-react";
import { API_CS_URL, fetchCommentsApi } from "@/config/config";
import { useCommentsSummarizerAppStore } from "@/store/store";
import InputToggle from "@/components/leftCommentsSummarizer/inputToggle";
import InputField from "@/components/leftCommentsSummarizer/inputField";
import Summarize from "@/components/leftCommentsSummarizer/summarize";

const LeftContainer = () => {
  const inputUrl = useCommentsSummarizerAppStore((state) => state.inputUrl);
  const inputPostId = useCommentsSummarizerAppStore(
    (state) => state.inputPostId
  );
  const filters = useCommentsSummarizerAppStore((state) => state.filters);
  const inputType = useCommentsSummarizerAppStore((state) => state.inputType);
  const setIsSummarizing = useCommentsSummarizerAppStore(
    (state) => state.setIsSummarizing
  );
  const setSummaryLoadTime = useCommentsSummarizerAppStore(
    (state) => state.setSummaryLoadTime
  );
  const setResult = useCommentsSummarizerAppStore((state) => state.setResult);
  const setActiveTab = useCommentsSummarizerAppStore(
    (state) => state.setActiveTab
  );
  const setErrorMessage = useCommentsSummarizerAppStore(
    (state) => state.setErrorMessage
  );

  const handleSummarize = async () => {
    if (!validateInput()) {
      return;
    }

    setIsSummarizing(true);
    setErrorMessage("");
    setResult(null);
    setSummaryLoadTime(0);

    let initialTime = performance.now();

    let commentsData = [];

    if (inputType === "url") {
      commentsData = await fetchCommentsJSON(fetchCommentsApi, inputUrl);
    } else if (inputType === "post") {
      commentsData = await fetchCommentsJSON(
        fetchCommentsApi,
        "",
        filters.hostName.url,
        inputPostId,
        filters.contentType.value
      );
    }

    let commentsSummaryResultsData = "";

    if (commentsData) {
      commentsSummaryResultsData = await fetchCommentsSummary(commentsData);
    }

    // Extract Pros
    const prosSection = commentsSummaryResultsData
      .split("Pros:")[1]
      .split("Cons:")[0];
    const pros = prosSection
      .split("- ")
      .slice(1)
      .map((s) => s.trim().replace(/\n$/, ""));

    // Extract Cons
    const consSection = commentsSummaryResultsData
      .split("Cons:")[1]
      .split("Overall Summary:")[0];
    const cons = consSection
      .split("- ")
      .slice(1)
      .map((s) => s.trim().replace(/\n$/, ""));

    // Extract Overall Summary
    const overall = commentsSummaryResultsData
      .split("Overall Summary:")[1]
      .split("Sentiment Analysis:")[0]
      .trim();

    // Extract Sentiments
    const positive = commentsSummaryResultsData
      .split("Positive Sentiment %: ")[1]
      .substring(0, 2);
    const neutral = commentsSummaryResultsData
      .split("Neutral Sentiment %: ")[1]
      .substring(0, 2);
    const negative = commentsSummaryResultsData
      .split("Negative Sentiment %: ")[1]
      .substring(0, 2);

    // Extract Keywords
    const keywordsSection = commentsSummaryResultsData
      .split("Frequent Keywords:")[1]
      .split("Key Themes:")[0]
      .trim();
    const keywords = keywordsSection
      .substring(2)
      .split(", ")
      .map((s) => s.trim().replace(/\.$/, ""));

    // Extract Themes
    const themesSection = commentsSummaryResultsData.split("Key Themes:")[1];
    const themes = themesSection
      .split("- ")
      .slice(1)
      .map((s) => s.trim().replace(/\n$/, ""));

    const commentsSummaryResults = {
      summary: {
        pros: pros,
        cons: cons,
        overall: overall,
      },
      sentiment: {
        negative: Number(negative),
        neutral: Number(neutral),
        positive: Number(positive),
      },
      themes: themes,
      keywords: keywords,
    };

    if (commentsSummaryResults) {
      setResult(commentsSummaryResults);
    }

    setIsSummarizing(false);
    setActiveTab("summary");

    if (initialTime) {
      const endTime = performance.now();
      setSummaryLoadTime(endTime - initialTime);
    }
  };

  const fetchCommentsJSON = useCallback(
    async (
      url: string,
      inputUrl: string = "",
      hostName: string = "",
      postId: string = "",
      contentType: string = ""
    ) => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: inputUrl.trim(),
            hostName: hostName,
            postId: postId,
            contentType: contentType,
          }),
        });

        let data = await response.json();
        if (response.status === 200) {
          if (data.length > 0) {
            const comments = data.map(
              (commentsData: any) => commentsData.message
            );
            return comments;
          } else {
            setErrorMessage(`No comments found!`);
            setIsSummarizing(false);
            // return test_comments;
            return;
          }
        } else {
          console.error(data.error || `HTTP error! status: ${response.status}`);
          setErrorMessage("Unable to fetch comments!");
          setIsSummarizing(false);
        }
      } catch (error) {
        console.error(`Error fetching comments : `, error);
        setErrorMessage(`Failed to fetch comments!`);
        setIsSummarizing(false);
        return null;
      }
    },
    []
  );

  const fetchCommentsSummary = useCallback(async (commentsData: string[]) => {
    try {
      const response = await fetch(`${API_CS_URL}/analyze_comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments: commentsData }),
      });
      const data = await response.json();

      if (response.ok && data && data?.summary) {
        return data?.summary;
      } else {
        setErrorMessage(data.error || `HTTP error! status: ${response.status}`);
        setIsSummarizing(false);
        return;
      }
    } catch (error) {
      console.error(`Error fetching comments summary :`, error);
      setErrorMessage("Failed to fetch comments summary!");
      setIsSummarizing(false);
      return null;
    }
  }, []);

  const validateInput = () => {
    if (inputType === "url") {
      if (!inputUrl.trim()) {
        setErrorMessage("Input value cannot be empty.");
        return false;
      }

      try {
        new URL(inputUrl);
      } catch (_) {
        setErrorMessage("Please enter a valid URL.");
        return false;
      }
    } else if (inputType === "post") {
      if (!Number(inputPostId)) {
        setErrorMessage("Please enter a valid post ID.");
        return false;
      }
    }
    setErrorMessage("");
    return true;
  };

  return (
    <section className="top-6 sticky flex flex-col justify-between lg:col-span-1 bg-white [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 shadow-md p-4 rounded-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar]:w-1 min-h-[85vh] max-h-[85vh] overflow-y-auto transition-all ease-in-out [&::-webkit-scrollbar-track]:transparent">
      <div className="flex flex-col justify-start h-full">
        <h2 className="flex items-center mb-2 font-medium text-gray-800 text-xl">
          <Proportions className="mr-2 w-5 h-5 text-blue-600" /> Summarize
          Content
        </h2>

        <InputToggle />

        <InputField />
      </div>

      <div className="flex flex-col justify-between gap-2">
        <Summarize handleSummarize={handleSummarize} />
      </div>
    </section>
  );
};

export default LeftContainer;
