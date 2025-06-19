import { useCallback, useState } from "react";
import { Proportions } from "lucide-react";
import { API_CS_URL, fetchCommentsApi, test_comments } from "@/config/config";
import { useCommentsSummarizerAppStore } from "@/store/store";
import InputToggle from "@/components/leftCommentsSummarizer/inputToggle";
import InputField from "@/components/leftCommentsSummarizer/inputField";
import Summarize from "@/components/leftCommentsSummarizer/summarize";

const LeftContainer = () => {
  const inputUrl = useCommentsSummarizerAppStore((state) => state.inputUrl);
  const inputHostName = useCommentsSummarizerAppStore(
    (state) => state.inputHostName
  );
  const inputPostId = useCommentsSummarizerAppStore(
    (state) => state.inputPostId
  );
  const inputContentType = useCommentsSummarizerAppStore(
    (state) => state.inputContentType
  );
  const inputType = useCommentsSummarizerAppStore((state) => state.inputType);
  const setIsSummarizing = useCommentsSummarizerAppStore(
    (state) => state.setIsSummarizing
  );
  const setSummaryLoadTime = useCommentsSummarizerAppStore(
    (state) => state.setSummaryLoadTime
  );
  const setCommentsSummary = useCommentsSummarizerAppStore(
    (state) => state.setCommentsSummary
  );
  const setActiveTab = useCommentsSummarizerAppStore(
    (state) => state.setActiveTab
  );

  const [errorMessage, setErrorMessage] = useState("");

  const handleSummarize = async () => {
    if (!validateInput()) {
      return;
    }

    setIsSummarizing(true);
    setErrorMessage("");
    setSummaryLoadTime(0);

    let initialTime = performance.now();

    let commentsData = [];
    if (inputType === "url") {
      commentsData = await fetchCommentsJSON(fetchCommentsApi, inputUrl);
    } else if (inputType === "post") {
      commentsData = await fetchCommentsJSON(
        fetchCommentsApi,
        inputHostName,
        inputPostId,
        inputContentType
      );
    }

    const commentsSummary = await fetchCommentsSummary(commentsData);

    if (!commentsSummary) {
      setCommentsSummary(commentsSummary);
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
      inputHostName: string = "",
      inputPostId: string = "",
      inputContentType: string = ""
    ) => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: inputUrl,
            hostname: inputHostName,
            postId: inputPostId,
            contentType: inputContentType,
          }),
        });

        let data = await response.json();
        if (response.status === 200) {
          if (data.length > 0) {
            const comments = data.map(
              (commentsData: any) => commentsData.message
            );
            return comments;
          }
        } else {
          throw new Error(
            data.error || `HTTP error! status: ${response.status}`
          );
        }
      } catch (error) {
        console.error(`Error fetching content from ${url}:`, error);
        setErrorMessage(
          `Failed to fetch comments from ${url}. Please check the URL.`
        );
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
        return data.summary;
      } else {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(
        `Error fetching comments summary for ${commentsData}:`,
        error
      );
      setErrorMessage("Failed to fetch comments summary.");
      return null;
    }
  }, []);

  const validateInput = () => {
    if (!inputUrl.trim()) {
      setErrorMessage("Input value cannot be empty.");
      return false;
    }
    if (inputType === "url") {
      try {
        new URL(inputUrl);
      } catch (_) {
        setErrorMessage("Please enter a valid URL.");
        return false;
      }
    } else if (inputType === "post") {
      if (!Number(inputUrl)) {
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

        <InputField errorMessage={errorMessage} />
      </div>

      <div className="flex flex-col justify-between gap-2">
        <Summarize handleSummarize={handleSummarize} />
      </div>
    </section>
  );
};

export default LeftContainer;
