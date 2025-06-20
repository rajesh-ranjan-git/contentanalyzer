import { useCallback, useEffect, useState } from "react";
import { Proportions } from "lucide-react";
import { API_CS_URL, fetchCommentsApi, test_comments } from "@/config/config";
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
  const errorMessage = useCommentsSummarizerAppStore(
    (state) => state.errorMessage
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

    let commentsSummaryResults = {
      summary: "",
      sentiment: {
        negative: 0,
        neutral: 0,
        positive: 0,
      },
      themes: [],
      keywords: [],
    };

    if (commentsData) {
      commentsSummaryResults = await fetchCommentsSummary(commentsData);
    }

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
            url: inputUrl,
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
            // return test_comments;
            return;
          }
        } else {
          console.error(data.error || `HTTP error! status: ${response.status}`);
          setErrorMessage("Unable to fetch comments!");
        }
      } catch (error) {
        console.error(`Error fetching comments : `, error);
        setErrorMessage(`Failed to fetch comments!`);
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

      if (response.ok) {
        return data;
      } else {
        setErrorMessage(data.error || `HTTP error! status: ${response.status}`);
        return;
      }
    } catch (error) {
      console.error(`Error fetching comments summary :`, error);
      setErrorMessage("Failed to fetch comments summary!");
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
    <section className="top-6 sticky flex flex-col justify-between lg:col-span-1 bg-white shadow-md p-4 rounded-lg min-h-[85vh] max-h-[85vh]">
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
