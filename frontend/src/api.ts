import * as AppBindings from "../wailsjs/go/backend/App";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import type { docker } from "../wailsjs/go/models";

import { Container, DockerStatus, Port } from "./types";
import { CONTAINER_STATE, DOCKER_STATUS_EVENT } from "./constants";

const mapPorts = (port: docker.PortSpec): Port => {
  return {
    label: port.Label,
    hostPort: port.HostPort,
    containerPort: port.ContainerPort,
  };
};

const mapContainer = (container: docker.Container): Container => {
  return {
    id: container.id,
    name: container.name,
    serviceName: container.service_name,
    version: container.version,
    image: container.image,
    state: container.state as CONTAINER_STATE,
    ports: container.ports?.map(mapPorts),
    createdAt: container.created_at,
  };
};

export const api = {
  log: AppBindings.Log,
  isPortAvailable: AppBindings.IsPortAvailable,

  getAppInfo: AppBindings.GetAppInfo,
  getServiceCatalog: AppBindings.GetServiceCatalog,

  getDockerStatus: AppBindings.GetDockerStatus,
  onDockerStatusUpdate: (handler: (dockerStatus: DockerStatus) => void) => {
    EventsOn(DOCKER_STATUS_EVENT, handler);

    // cleanup
    return () => {
      EventsOff(DOCKER_STATUS_EVENT);
    };
  },

  launchContainer: AppBindings.LaunchContainer,
  startContainer: AppBindings.StartContainer,
  stopContainer: AppBindings.StopContainer,
  deleteContainer: AppBindings.DeleteContainer,
  findContainer: AppBindings.FindContainer,
  restartContainer: AppBindings.RestartContainer,
  getContainerLogs: AppBindings.GetContainerLogs,

  getAllContainers: async (): Promise<Container[]> => {
    const containers = await AppBindings.ListAllContainer();

    return containers ? containers.map(mapContainer) : [];
  },
};
