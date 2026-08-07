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
  OPEN_TERMINAL = "openTerminal",
}

export enum FILTER_STATE {
  ALL = "all",
  RUNNING = "running",
  STOPPED = "stopped",
}

export enum TERMINAL_STATUS {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  CLOSED = "closed",
  ERROR = "error",
}

export const DOCKER_STATUS_EVENT = "docker:status";
export const TERMINAL_OUTPUT_EVENT = "terminal:output";
export const TERMINAL_CLOSED_EVENT = "terminal:closed";
