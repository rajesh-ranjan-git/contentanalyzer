export const BASE_URL = process.env.BASE_URL;
export const API_CCA_URL = process.env.NEXT_PUBLIC_API_CCA_URL;
export const API_CS_URL = process.env.NEXT_PUBLIC_API_CS_URL;

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
