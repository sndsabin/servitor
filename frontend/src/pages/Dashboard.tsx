import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Check, Filter, Plus } from "lucide-react";

import { Container, FilterState, ContainerState, HandleContainerActionOptions } from "../types";
import { api } from "../api";
import { getGreetingText } from "../utils";
import Greeting from "../components/Greeting";
import LogsDrawer from "../components/LogsDrawer";
import Pagination from "../components/Pagination";
import ContainerTable from "../components/ContainerTable";
import { CONTAINER_ACTION, CONTAINER_STATE, FILTER_STATE } from "../constants";

const PAGE_SIZE = 10;

type OutletContext = {
  setError: (message: string) => void;
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterState>(FILTER_STATE.ALL);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [containers, setContainers] = useState<Container[]>([]);
  const [containerLogs, setContainerLogs] = useState("");
  const [showLogsDrawerFor, setShowLogsDrawerFor] = useState<Record<string, string>>({});

  const { setError } = useOutletContext<OutletContext>();

  const states: FilterState[] = Object.values(FILTER_STATE);

  const handleContainerStateChange = (containerId: string, newState: ContainerState) => {
    const updatedContainers = containers.map((container) => {
      if (container.id === containerId) {
        return { ...container, state: newState };
      }

      return container;
    });

    setContainers(updatedContainers);
  };

  const handleContainerDelete = (containerId: string) => {
    const updatedContainers = containers.filter((container) => {
      return container.id !== containerId;
    });

    setContainers(updatedContainers);
  };

  const fetchContainerLogs = async (containerId: string) => {
    if (containerId) {
      try {
        setContainerLogs("fetching logs...");
        const logs = await api.getContainerLogs(containerId);
        setContainerLogs(logs);
      } catch (err) {
        setContainerLogs(`Something went wrong when fetching the logs ${err}`);
      }
    }
  };

  const handleContainerAction = async ({
    containerId,
    containerName,
    action,
  }: HandleContainerActionOptions) => {
    try {
      switch (action) {
        case CONTAINER_ACTION.STOP:
          await api.stopContainer(containerId);
          handleContainerStateChange(containerId, CONTAINER_STATE.PAUSED);
          break;
        case CONTAINER_ACTION.START:
          await api.startContainer(containerId);
          handleContainerStateChange(containerId, CONTAINER_STATE.RUNNING);
          break;
        case CONTAINER_ACTION.DELETE:
          await api.deleteContainer(containerId);
          handleContainerDelete(containerId);
          break;
        case CONTAINER_ACTION.VIEW_LOGS:
          await fetchContainerLogs(containerId);

          if (containerName) {
            setShowLogsDrawerFor({
              containerId: containerId,
              containerName: containerName,
            });
          }
          break;
        default:
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // Memoize the filtered container list to avoid recalculating the list
  // unless the filter or the container value changes.
  const filteredContainerList = useMemo(() => {
    switch (filter) {
      case "running":
        return containers.filter((container) => container.state === CONTAINER_STATE.RUNNING);
      case "stopped":
        return containers.filter((container) => container.state !== CONTAINER_STATE.RUNNING);
      default:
        return containers;
    }
  }, [filter, containers]);

  const pagedContainerList = filteredContainerList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    api
      .getAllContainers()
      .then((containers) => {
        setContainers(containers ?? []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  return (
    <>
      <Greeting
        greeting={getGreetingText()}
        message="Pick a service, launch a container, get back to building."
      />

      <div className="mb-4 flex items-center justify-end gap-2.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <Filter size={15} />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 z-10 mt-1.5 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {states.map((filterState) => (
                <button
                  type="button"
                  key={filterState}
                  onClick={() => {
                    setFilter(filterState);
                    setPage(1);
                    setIsFilterOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[12.5px] text-slate-600 capitalize hover:bg-slate-50"
                >
                  {filterState}
                  {filter === filterState && <Check size={13} className="text-accent-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/catalog")}
          className="bg-accent-600 hover:bg-accent-700 flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
        >
          <Plus size={15} />
          New
        </button>
      </div>

      <ContainerTable containers={pagedContainerList} onAction={handleContainerAction} />
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={filteredContainerList.length}
        onPageChange={setPage}
      />

      {Object.keys(showLogsDrawerFor).length > 0 && (
        <LogsDrawer
          containerName={showLogsDrawerFor["containerName"] ?? ""}
          logs={containerLogs}
          onLogReload={() => fetchContainerLogs(showLogsDrawerFor["containerId"] ?? "")}
          onClose={() => setShowLogsDrawerFor({})}
        />
      )}
    </>
  );
};

export default Dashboard;
