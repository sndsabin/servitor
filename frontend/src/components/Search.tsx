import { useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";

interface Props {
  placeholder: string;
  query: string;
  onQueryChange: (value: string) => void;
}

const Search = ({ placeholder, query, onQueryChange }: Props) => {
  const [open, setOpen] = useState(false);

  return open ? (
    <div className="relative">
      <SearchIcon
        size={14}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        autoFocus
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        className="focus:border-accent-400 focus:ring-accent-100 w-64 rounded-full border border-slate-200 bg-slate-50 py-1.5 pr-8 pl-9 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2"
      />
      <button
        type="button"
        onClick={() => {
          onQueryChange("");
          setOpen(false);
        }}
        className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        <X size={13} />
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <SearchIcon size={14} />
    </button>
  );
};

export default Search;
