import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { api } from "../api";
import Logo from "../components/Logo";

type OutletContext = {
  setError: (message: string) => void;
};

const About = () => {
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const { setError } = useOutletContext<OutletContext>();

  useEffect(() => {
    api
      .getAppInfo()
      .then((info) => {
        setName(info.name);
        setVersion(info.version);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center px-4 pt-6 pb-4 text-center">
        <div className="relative mb-2 flex h-24 w-24 items-center justify-center">
          <Logo className="h-24" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">{name}</h1>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-medium text-slate-500">
          <span className="font-mono">v{version}</span>
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
          {name} makes it simple to run the services your projects depend on. Spin up MySQL,
          MariaDB, PostgreSQL, Redis, RabbitMQ, and other common development dependencies as
          containers, choose the version you need, and start building.
        </p>
      </div>
    </div>
  );
};

export default About;
