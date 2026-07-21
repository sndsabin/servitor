import { X } from "lucide-react";

interface Props {
  error: string;
  showDismissButton?: boolean;
  onDismiss?: () => void;
}

const ErrorAlert = ({ error, showDismissButton = true, onDismiss }: Props) => {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12.5px] text-rose-700">
      <span>{error}</span>
      {showDismissButton && onDismiss && (
        <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600">
          <X size={13} />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
