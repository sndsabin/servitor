interface Props {
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}

const IconButton = ({ title, children, disabled, danger, onClick: clickHandler }: Props) => {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={clickHandler}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white ${danger ? "text-rose-500 hover:border-rose-200 hover:bg-rose-50" : "text-slate-500"} `}
    >
      {children}
    </button>
  );
};

export default IconButton;
