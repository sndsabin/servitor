import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, pageSize, total, onPageChange }: Props) => {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const canPrev = page > 1;
  const canNext = end < total;

  return (
    <div className="flex items-center justify-between text-[13px] text-slate-500">
      <span>
        Showing <span className="font-medium text-slate-700">{start}</span> to{" "}
        <span className="font-medium text-slate-700">{end}</span> of{" "}
        <span className="font-medium text-slate-700">{total}</span>
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          className="text-accent-600 hover:bg-accent-50 flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:text-slate-600 disabled:opacity-40 disabled:hover:bg-white"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
