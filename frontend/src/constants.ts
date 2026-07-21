export enum LOG_LEVEL {
  Info = "INFO",
  Debug = "DEBUG",
  Error = "ERROR",
}

export enum PORT_STATUS {
  CHECKING = "checking",
}

export enum CONTAINER_STATE {
  RUNNING = "running",
  EXITED = "exited",
  CREATED = "created",
  PAUSED = "paused",
}

export enum CONTAINER_ACTION {
  STOP = "stop",
  START = "start",
  DELETE = "delete",
  VIEW_LOGS = "viewLogs",
}

export enum FILTER_STATE {
  ALL = "all",
  RUNNING = "running",
  STOPPED = "stopped",
}

export const DOCKER_STATUS_EVENT = "docker:status";
