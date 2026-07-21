import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  envKey: string;
  initialValue: string;
  description: string;
  secret: boolean;
  required: boolean;
  onChange: (key: string, value: string) => void;
}

const EnvField = ({ envKey, initialValue, description, secret, required, onChange }: Props) => {
  const [value, setValue] = useState(initialValue);
  const [isVisible, setIsVisible] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(envKey, e.target.value);
  };

  const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If value is empty, restore to its default value
    // The value is empty incase where e.target.value is "" when user
    // removes all the input values.
    if (value.trim() === "") {
      setValue(initialValue);
      onChange(envKey, initialValue);
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]); //Sync when parent initialValue changes

  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span
        title={description}
        className="flex w-28 shrink-0 items-center gap-0.5 truncate font-mono text-slate-500"
      >
        {envKey}
        {required && (
          <span className="text-rose-400" title="Required">
            *{" "}
          </span>
        )}
      </span>

      <div className="relative min-w-0 flex-1">
        <input
          type={secret && !isVisible ? "password" : "text"}
          value={value}
          onChange={handleInputChange}
          required={required}
          onBlur={handleInputBlur}
          className={`w-full rounded-md border bg-slate-50 py-1 pl-2 text-[10px] text-slate-700 outline-none focus:ring-2 ${secret} ? "pr-7" : "pr-2"`}
        />

        {secret && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsVisible((val) => !val)}
            title={isVisible ? "hide" : "show"}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default EnvField;
