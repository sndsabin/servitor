import type { backend, docker } from "../wailsjs/go/models";
import { CONTAINER_STATE, CONTAINER_ACTION, PORT_STATUS, FILTER_STATE } from "./constants";

export type FilterState = (typeof FILTER_STATE)[keyof typeof FILTER_STATE]; // "all"| "running"| "stopped";
export type ContainerAction = (typeof CONTAINER_ACTION)[keyof typeof CONTAINER_ACTION]; // "stop"| "resume"| "delete"| "viewLogs";
export type ContainerState = (typeof CONTAINER_STATE)[keyof typeof CONTAINER_STATE]; // "running"| "exited"| "created"| "deleted";
export type PortStatus = typeof PORT_STATUS.CHECKING | boolean; // "checking"| boolean;

export type PortMapping = Record<string, Record<string, number>>;
export type EnvMapping = Record<string, string>;

export interface Container {
  id: string;
  name: string;
  serviceName: string;
  version: string;
  image: string;
  state: CONTAINER_STATE;
  ports: Port[];
  createdAt: string;
}

export interface Port {
  label: string;
  hostPort: number;
  containerPort: number;
}

export interface HandleContainerActionOptions {
  containerId: string;
  containerName?: string;
  action: CONTAINER_ACTION;
}

export type Service = backend.Service;
export type DockerStatus = docker.DockerStatus;
export type StartServiceRequest = backend.StartServiceRequest;
