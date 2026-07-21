import { RefreshCcw } from "lucide-react";

interface Props {
  error: string;
  onRetry?: () => void;
}

const ErrorPage = ({ error, onRetry }: Props) => {
  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 px-6">
      <svg width="180" height="140" viewBox="0 0 180 140" className="mb-2">
        <rect
          x="18"
          y="108"
          width="16"
          height="16"
          rx="2"
          className="fill-amber-200"
          transform="rotate(-8 26 116)"
        />
        <rect
          x="128"
          y="112"
          width="14"
          height="14"
          rx="2"
          className="fill-blue-200"
          transform="rotate(12 135 119)"
        />
        <circle cx="48" cy="120" r="7" className="fill-emerald-200" />
        <rect
          x="98"
          y="118"
          width="12"
          height="12"
          rx="2"
          className="fill-rose-200"
          transform="rotate(-15 104 124)"
        />

        <g transform="rotate(-11 90 78)">
          <rect x="35" y="55" width="110" height="52" rx="4" className="fill-accent-500" />

          {[46, 58, 70, 82, 94, 106, 118, 130].map((x) => (
            <line
              key={x}
              x1={x}
              y1="59"
              x2={x}
              y2="103"
              stroke="white"
              strokeOpacity="0.25"
              strokeWidth="2"
            />
          ))}

          <line
            x1="90"
            y1="55"
            x2="90"
            y2="107"
            stroke="white"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          <rect x="80" y="76" width="6" height="10" rx="1.5" className="fill-accent-700" />
          <rect x="94" y="76" width="6" height="10" rx="1.5" className="fill-accent-700" />

          <path
            d="M 100 55 L 92 68 L 104 76 L 90 92 L 98 107"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-rose-500"
          />
        </g>

        <ellipse cx="90" cy="118" rx="55" ry="6" className="fill-slate-200" />
      </svg>

      <h1 className="text-lg font-bold tracking-tight text-slate-900">
        Servitor hit a little snag!
      </h1>
      <p className="mt-2 max-w-sm text-center text-[13.5px] leading-relaxed text-slate-500">
        Try reloading. If the problem persists, restart App.
      </p>
      <p className="bg-slate-100 px-1 py-0.5 font-mono text-[12px] text-slate-600">
        {error && <em>{error}</em>}
      </p>

      <div className="mt-6 flex items-center gap-2">
        <button
          onClick={handleReload}
          className="bg-accent-600 hover:bg-accent-700 flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition-colors"
        >
          <RefreshCcw size={14} />
          Reload
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
