import { useEffect, useRef, useState } from "react";
import { X, RefreshCw } from "lucide-react";

import { api } from "../api";

interface Props {
  containerId: string;
  containerName: string;
  onClose: () => void;
}

const LogsDrawer = ({ containerId, containerName, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState("");

  const fetchContainerLogs = async (containerId: string) => {
    if (!containerId) {
      return;
    }

    try {
      setLoading(true);
      setLogs("fetching logs...");
      const logs = await api.getContainerLogs(containerId);
      setLogs(logs);
    } catch (err) {
      setLogs(`Something went wrong when fetching the logs ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchLogs = async () => {
    setLoading(true);

    try {
      await fetchContainerLogs(containerId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainerLogs(containerId);
  }, [containerId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-[14px] font-semibold text-slate-900">
              {containerName.replace("/", "")}
            </div>
            <div className="font-mono text-[11.5px] text-slate-400">logs (last 300 lines)</div>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleFetchLogs}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""}></RefreshCw>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto bg-slate-900 p-5 font-mono text-[11.5px] leading-relaxed break-all whitespace-pre-wrap text-slate-300">
          {logs || "No logs"}
        </pre>
      </div>
    </div>
  );
};

export default LogsDrawer;
