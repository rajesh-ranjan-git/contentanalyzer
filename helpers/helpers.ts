export const formatDate = (dateString: string | Date) => {
  if (!dateString) return "N/A";

  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Set to false for 24-hour format
  });
};

export const getSimilarityColor = (similarity: number | undefined) => {
  if (similarity && similarity >= 80) return "bg-red-100 text-red-800";
  if (similarity && similarity >= 60) return "bg-orange-100 text-orange-800";
  if (similarity && similarity >= 40) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};
