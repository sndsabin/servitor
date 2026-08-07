import { JSX, useEffect, useState } from "react";
import { AlertTriangleIcon, Check, Loader } from "lucide-react";

import usePortCheck from "../../hooks/usePortCheck";
import { PortStatus } from "../../types";
import { PORT_STATUS } from "../../constants";

interface Props {
  label: string;
  containerPort: number;
  defaultHostPort: number;
  onChange: (key: string, value: number) => void;
}

const PortField = ({ label, containerPort, defaultHostPort, onChange }: Props) => {
  const [hostPort, setHostPort] = useState(defaultHostPort);
  const status = usePortCheck(hostPort);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setHostPort(val);
    // state updates are asynchronous. ${hostPort}
    // might still contain stale value. So, using ${val} here
    onChange(label, val);
  };

  const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    // hostPort = 0 happens when user clears the input and leave it as it is
    // since, port 0 is not valid port, restore it to default one
    if (hostPort === 0) {
      setHostPort(defaultHostPort);
      onChange(label, defaultHostPort);
    }
  };

  const renderStatusIcon = (status: PortStatus): JSX.Element => {
    if (status === PORT_STATUS.CHECKING) {
      return <Loader size={11} className="animate-spin text-slate-300" />;
    }

    if (!status) {
      return <AlertTriangleIcon size={11} className="text-rose-500" />;
    }

    return <Check size={12} className="text-emerald-500" />;
  };

  useEffect(() => {
    setHostPort(defaultHostPort);
  }, [defaultHostPort]); // sync when parent defaultHostPort changes

  return (
    <div className="flex items-center gap-2 text-[11.5px]">
      <span className="w-28 shrink-0 truncate text-slate-500" title={label}>
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          value={hostPort}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          required={true}
          className={`w-24 rounded-md border bg-slate-50 py-1 pr-6 pl-2 font-mono text-[11.5px] text-slate-700 outline-none focus:ring-2 ${status !== PORT_STATUS.CHECKING && !status ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "focus:border-accent-400 focus:ring-accent-100 border-slate-200"}`}
        />
        <span className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2">
          {renderStatusIcon(status)}
        </span>
      </div>
    </div>
  );
};

export default PortField;
