export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// export const API_CCA_URL = process.env.NEXT_PUBLIC_ELEVATE_DEV_CCA_URL;
// export const API_CS_URL = process.env.NEXT_PUBLIC_ELEVATE_DEV_CS_URL;
export const API_CCA_URL = process.env.NEXT_PUBLIC_ELEVATE_LOCAL_CCA_URL;
export const API_CS_URL = process.env.NEXT_PUBLIC_ELEVATE_LOCAL_CS_URL;

export const BT_ALPHA_COMMENTS_JSON_URL =
  process.env.BT_ALPHA_COMMENTS_JSON_URL;
export const BT_PROD_COMMENTS_JSON_URL = process.env.BT_PROD_COMMENTS_JSON_URL;

export const IT_ALPHA_COMMENTS_JSON_URL =
  process.env.IT_ALPHA_COMMENTS_JSON_URL;
export const IT_PROD_COMMENTS_JSON_URL = process.env.IT_PROD_COMMENTS_JSON_URL;

export const BT_ALPHA_COMMENT_AUTHORIZATION_TOKEN =
  process.env.BT_ALPHA_COMMENT_AUTHORIZATION_TOKEN;
export const BT_DEV_COMMENT_AUTHORIZATION_TOKEN =
  process.env.BT_DEV_COMMENT_AUTHORIZATION_TOKEN;
export const BT_PROD_COMMENT_AUTHORIZATION_TOKEN =
  process.env.BT_PROD_COMMENT_AUTHORIZATION_TOKEN;

export const IT_ALPHA_COMMENT_AUTHORIZATION_TOKEN =
  process.env.IT_ALPHA_COMMENT_AUTHORIZATION_TOKEN;
export const IT_DEV_COMMENT_AUTHORIZATION_TOKEN =
  process.env.IT_DEV_COMMENT_AUTHORIZATION_TOKEN;
export const IT_PROD_COMMENT_AUTHORIZATION_TOKEN =
  process.env.IT_PROD_COMMENT_AUTHORIZATION_TOKEN;

export const sitemapUrls = [
  "https://www.indiatoday.in/news-it-sitemap.xml",
  "https://www.ndtv.com/sitemap/google-news-sitemap",
  "https://indianexpress.com/news-sitemap.xml",
  "https://www.hindustantimes.com/sitemap/news.xml",
];

export const appNames = {
  cca: {
    name: "Competitive Content Analyzer",
    url: "/competitive-content-analyzer",
  },
  cs: { name: "Comments Summarizer", url: "/comments-summarizer" },
};

export const fetchCommentsApi = "/api/fetch-comments";

export const hostNameUrls = [
  {
    name: "Business Today (Alpha)",
    url: "alpha-businesstoday.intoday.in",
  },
  {
    name: "Business Today (Dev)",
    url: "dev-businesstoday.intoday.in",
  },
  {
    name: "Business Today (Live)",
    url: "businesstoday.in",
  },
  {
    name: "India Today (Alpha)",
    url: "alpha-indiatoday.intoday.in",
  },
  {
    name: "India Today (Dev)",
    url: "dev-indiatoday.intoday.in",
  },
  {
    name: "India Today (Live)",
    url: "indiatoday.in",
  },
];

export const contentTypes = [
  {
    name: "Story",
    value: "story",
  },
  {
    name: "Video",
    value: "video",
  },
];
