import { ProgressBarProps } from "@/types/propTypes";

const ProgressBar = ({
  percentage,
  color = "bg-blue-500",
  hoverColor = "bg-blue-700",
  label,
}: ProgressBarProps) => {
  const safePercentage = Math.max(0, Math.min(percentage, 100));

  return (
    <div className="w-full max-w-md cursor-pointer">
      {label && (
        <div className="flex justify-between mb-1 font-medium text-gray-700 text-sm">
          <span>{label}</span>
          <span>{safePercentage}%</span>
        </div>
      )}
      <div className="bg-gray-200 rounded-full w-full h-4 overflow-hidden">
        <div
          className={`h-4 transition-all duration-300 hover:${hoverColor} ${color}`}
          style={{ width: `${safePercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
