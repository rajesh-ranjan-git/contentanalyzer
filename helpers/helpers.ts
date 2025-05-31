export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const getSimilarityColor = (similarity) => {
  if (similarity >= 80) return "bg-red-100 text-red-800";
  if (similarity >= 60) return "bg-orange-100 text-orange-800";
  if (similarity >= 40) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};
