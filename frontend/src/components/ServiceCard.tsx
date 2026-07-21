import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Play } from "lucide-react";

import PortField from "./inputs/PortField";
import EnvField from "./inputs/EnvField";
import { PortMapping, EnvMapping, StartServiceRequest, Service } from "../types";

interface Props {
  service: Service;
  onLaunch: (req: StartServiceRequest) => Promise<void>;
}

const ServiceCard = ({ service, onLaunch }: Props) => {
  const [version, setVersion] = useState(service.versions[0] ?? "");
  const [volumeName, setVolumeName] = useState(service.volume_name ?? "");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const getInitialValueForPortMapping = () => {
    let servicePorts: PortMapping = {};

    service.ports.forEach((port) => {
      servicePorts[port.label] = {
        hostPort: port.host_port,
        containerPort: port.container_port,
      };
    });

    return servicePorts;
  };

  const getIntialValueForEnvMapping = () => {
    let environments: EnvMapping = {};

    service.env?.forEach((env) => {
      environments[env.key] = env.default;
    });

    return environments;
  };

  const [portMapping, setPortMapping] = useState<PortMapping>(getInitialValueForPortMapping());
  const [envMapping, setEnvMapping] = useState<EnvMapping>(getIntialValueForEnvMapping());

  const handlePortChange = (key: string, hostPort: number) => {
    setPortMapping((prev) => ({
      ...prev,
      [key]: { ...prev[key], hostPort: hostPort },
    }));
  };

  const handleEnvChange = (key: string, value: string) => {
    setEnvMapping((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFormSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLaunching(true);
    const formData: StartServiceRequest = {
      name: service.name,
      image: service.image,
      version: version.trim(),
      port_mapping: portMapping,
      env_mapping: envMapping,
      volume_name: volumeName.trim(),
      volume_path: service.volume_path ?? "",
      command: service.command ?? [],
    };

    try {
      await onLaunch(formData);
    } finally {
      setIsLaunching(false);

      // restore to defaults
      setPortMapping(getInitialValueForPortMapping());
      setEnvMapping(getIntialValueForEnvMapping());
      setVolumeName(service.volume_name ?? "");
    }
  };

  const serviceLogoDirectory = "/service-logo";
  const serviceLogoPath = service.logo ? `${serviceLogoDirectory}/${service.logo}` : null;

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 font-mono text-sm font-bold text-slate-500">
          {serviceLogoPath ? (
            <img src={serviceLogoPath} alt={service.name} className="h-6 w-6 object-contain" />
          ) : (
            service.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="min-w-0 truncate text-[14px] font-semibold text-slate-900"
              title={service.name}
            >
              {service.name}
            </span>

            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-500">
              {service.category}
            </span>
          </div>

          <p className="mt-0.5 text-[12.5px] leading-snug text-slate-500">{service.description}</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor="version" className="mb-1 block text-[11px] font-medium text-slate-500">
              Version <span className="font-normal text-slate-400">(image tag)</span>
            </label>

            <input
              type="text"
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              title="Image tag"
              className="focus:border-accent-400 focus:ring-accent-100 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 font-mono text-[12px] text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2"
              required={true}
            />
          </div>

          <button
            type="submit"
            disabled={isLaunching}
            className="bg-accent-600 hover:bg-accent-700 flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLaunching ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            Launch
          </button>
        </div>

        {service.ports.length > 0 ||
        (service.env && service.env.length > 0) ||
        service.volume_name !== "" ? (
          <>
            <button
              type="button"
              onClick={() => {
                setIsExpanded((prev) => !prev);
              }}
              className="flex items-center gap-1 self-start text-[11.5px] font-medium text-slate-400 hover:text-slate-600"
            >
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {isExpanded ? "Hide config" : "Ports & Config"}
            </button>

            {isExpanded && (
              <div className="flex max-h-[180px] flex-col gap-2.5 overflow-y-auto border-t border-slate-100 pt-3 pr-2">
                {service.ports.map((port) => (
                  <PortField
                    key={port.label}
                    label={port.label}
                    containerPort={port.container_port}
                    defaultHostPort={
                      portMapping[port.label]["hostPort"] !== 0
                        ? portMapping[port.label]["hostPort"]
                        : port.host_port
                    }
                    onChange={handlePortChange}
                  />
                ))}

                {service.env?.map((env) => (
                  <EnvField
                    key={env.key}
                    envKey={env.key}
                    initialValue={envMapping[env.key] !== "" ? envMapping[env.key] : env.default}
                    description={env.description}
                    secret={env.secret}
                    required={env.required}
                    onChange={handleEnvChange}
                  />
                ))}

                {service.volume_name && (
                  <div className="flex items-center gap-2 text-[11.5px]">
                    <span title="Volume Name" className="w-28 shrink-0 text-slate-500">
                      Volume Name
                    </span>

                    <input
                      type="text"
                      placeholder={volumeName}
                      value={volumeName}
                      required={true}
                      onChange={(e) => setVolumeName(e.target.value)}
                      onBlur={(e) => {
                        if (volumeName === "") {
                          setVolumeName(service.volume_name ?? "");
                        }
                      }}
                      className="focus:border-accent-400 min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </form>
    </div>
  );
};

export default ServiceCard;
