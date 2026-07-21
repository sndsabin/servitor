import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import ErrorAlert from "./components/ErrorAlert";
import { api } from "./api";
import { DockerStatus } from "./types";

const App = () => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dockerStatus, setDockerStatus] = useState<DockerStatus | null>(null);

  useEffect(() => {
    // fetch docker status
    api.getDockerStatus().then((dockerStatusInfo) => {
      setDockerStatus(dockerStatusInfo);
    });

    // subscribe to docker status change
    const handler = (dockerStatusInfo: DockerStatus) => {
      setDockerStatus(dockerStatusInfo);
    };

    return api.onDockerStatusUpdate(handler);
  }, []);

  useEffect(() => {
    dockerStatus?.error
      ? setError(
          `Docker isn't reachable (${dockerStatus.error}). Make sure Docker Desktop / the daemon is running.`,
        )
      : setError("");
  }, [dockerStatus]);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar dockerStatus={dockerStatus} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header query={query} onQueryChange={setQuery} />

        <main className="flex-1 overflow-auto px-8 py-7">
          {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

          <Outlet context={{ query, setError }} />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;
