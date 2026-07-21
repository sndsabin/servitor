import { ScrollText, Play, Square, Trash2 } from "lucide-react";

import { Container, ContainerAction, HandleContainerActionOptions } from "../types";
import StatusIcon from "./StatusIcon";
import IconButton from "./IconButton";
import { CONTAINER_ACTION, CONTAINER_STATE } from "../constants";
import { useState } from "react";

interface Props {
  containers: Container[];
  onAction: ({ containerId, containerName, action }: HandleContainerActionOptions) => void;
}

const ContainerTable = ({ containers, onAction }: Props) => {
  if (containers.length === 0) {
    return (
      <div className="mb-8 rounded-xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
        <p className="text-[13px] text-slate-500">No containers found.</p>
      </div>
    );
  }

  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleToggleAction = async (containerId: string, action: ContainerAction) => {
    setActionInProgress(containerId);

    try {
      await onAction({ containerId: containerId, action: action });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 text-[14px] font-semibold text-slate-900">
        Containers
      </div>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] tracking-wide text-slate-400 uppercase">
            <th className="px-5 py-2.5 font-medium">Name</th>
            <th className="px-5 py-2.5 font-medium">ID</th>
            <th className="px-5 py-2.5 font-medium">Ports</th>
            <th className="px-5 py-2.5 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {containers.map((container) => {
            const isRunning = container.state === CONTAINER_STATE.RUNNING;

            return (
              <tr
                key={container.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <StatusIcon active={isRunning} />
                    <span className="font-medium text-slate-800">
                      {container.name.replace("/", "")}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-[12px] text-slate-400">
                  {container.id.slice(0, 12)}
                </td>
                <td className="px-5 py-3.5">
                  {container.ports?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {container.ports.map((port) => (
                        <span
                          key={port.containerPort}
                          className={`font-mono-text-[12px] font-medium ${isRunning ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {port.hostPort}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1.5">
                    <IconButton
                      title="Logs"
                      onClick={() =>
                        onAction({
                          containerId: container.id,
                          containerName: container.name,
                          action: CONTAINER_ACTION.VIEW_LOGS,
                        })
                      }
                    >
                      <ScrollText></ScrollText>
                    </IconButton>

                    <IconButton
                      title={isRunning ? "Stop" : "Start"}
                      disabled={actionInProgress === container.id}
                      onClick={() =>
                        isRunning
                          ? handleToggleAction(container.id, CONTAINER_ACTION.STOP)
                          : handleToggleAction(container.id, CONTAINER_ACTION.START)
                      }
                    >
                      {isRunning ? <Square size={13} /> : <Play size={13} />}
                    </IconButton>

                    <IconButton
                      title="Delete"
                      disabled={actionInProgress === container.id}
                      danger={true}
                      onClick={() =>
                        onAction({
                          containerId: container.id,
                          action: CONTAINER_ACTION.DELETE,
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ContainerTable;
