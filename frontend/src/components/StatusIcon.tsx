import { ArrowRight, Ban } from "lucide-react";

interface Props {
  active: boolean;
}

const StatusIcon = ({ active }: Props) => {
  return active ? (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
      <ArrowRight size={14} strokeWidth={2.5} />
    </span>
  ) : (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-400">
      <Ban size={14} strokeWidth={2} />
    </span>
  );
};

export default StatusIcon;
