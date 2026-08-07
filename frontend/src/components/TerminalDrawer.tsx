import { useEffect, useRef, useState } from "react";
import { Circle, X } from "lucide-react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

import "@xterm/xterm/css/xterm.css";

import { TERMINAL_STATUS } from "../constants";
import { api } from "../api";

interface Props {
  containerId: string;
  containerName: string;
  onClose: () => void;
}

type Status = (typeof TERMINAL_STATUS)[keyof typeof TERMINAL_STATUS];

const TerminalDrawer = ({ containerId, containerName, onClose }: Props) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>(TERMINAL_STATUS.CONNECTING);
  const [error, setError] = useState("");
  const sessionIdRef = useRef("");

  useEffect(() => {
    if (!terminalRef.current) {
      return;
    }

    let cancelled = false;
    let onTerminalOutput: (() => void) | null = null;
    let onTerminalClosed: (() => void) | null = null;

    const terminal = new Terminal({
      fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Consolas, monospace",
      fontSize: 12.5,
      lineHeight: 1.4,
      cursorBlink: true,
      convertEol: true,
      theme: {
        background: "#0f172a",
        foreground: "#e2e8f0",
        cursor: "#a78bfa",
        selectionBackground: "#33415580",
      },
    });

    const resizeTerminal = (sessionId: string) => {
      fitAddon.fit(); // fit to the available size

      const dims = fitAddon.proposeDimensions();
      if (dims && dims.cols > 0 && dims.rows > 0) {
        api.resizeTerminal(sessionId, dims.cols, dims.rows).catch((err) => console.error(err));
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (!sessionIdRef.current) {
        return;
      }

      fitAddon.fit(); // fit to the available size
      resizeTerminal(sessionIdRef.current);
    });

    // mount terminal
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit(); // fit to the available size
    terminal.focus();

    const connect = async () => {
      if (cancelled) {
        return;
      }

      try {
        const sessionId = await api.startTerminal(containerId);

        if (cancelled) {
          api.closeTerminal(sessionId).catch((err) => console.error(err));
          return;
        }

        sessionIdRef.current = sessionId;
        setStatus(TERMINAL_STATUS.CONNECTED);
        resizeTerminal(sessionIdRef.current);

        // Attach listeners
        onTerminalOutput = api.onTerminalOutput(sessionIdRef.current, (data) => {
          terminal.write(data);
        });

        onTerminalClosed = api.onTerminalClosed(sessionIdRef.current, () =>
          setStatus(TERMINAL_STATUS.CLOSED),
        );

        terminal.onData((data) => {
          api.sendTerminalInput(sessionId, data).catch((err) => {
            console.error(err);
          });
        });
      } catch (err) {
        if (cancelled) {
          return;
        }
        setStatus(TERMINAL_STATUS.ERROR);
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    connect();
    resizeObserver.observe(terminalRef.current);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();

      onTerminalOutput?.();
      onTerminalClosed?.();

      if (sessionIdRef.current) {
        api.closeTerminal(sessionIdRef.current).catch((err) => console.error(err));
      }

      terminal.dispose();
    };
  }, [containerId]);

  const statusLabel: Record<Status, string> = {
    connecting: "connecting…",
    connected: "bash/sh — live",
    closed: "session ended",
    error: "failed to connect",
  };

  const statusColor: Record<Status, string> = {
    connecting: "text-amber-400",
    connected: "text-emerald-400",
    closed: "text-slate-400",
    error: "text-rose-400",
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-[14px] font-semibold text-slate-900">
              {containerName.replace("/", "")}
            </div>
            <div
              className={`flex items-center gap-1.5 font-mono text-[11.5px] ${statusColor[status]}`}
            >
              <Circle size={7} className="fill-current" />
              {statusLabel[status] ?? ""}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={14} />
          </button>
        </div>

        {status === TERMINAL_STATUS.ERROR ? (
          <div className="flex-1 bg-slate-900 p-5 font-mono text-[12.5px] leading-relaxed text-rose-400">
            {error}
          </div>
        ) : (
          <div ref={terminalRef} className="min-h-0 flex-1 bg-slate-900 p-2"></div>
        )}
      </div>
    </div>
  );
};

export default TerminalDrawer;
