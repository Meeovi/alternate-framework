export type ErrorParams = {
  status?: number;
  statusText?: string;
  message?: string;
  statusMessage?: string;
  fatal?: boolean;
}

export type UseHandleError = (error?: unknown) => void;
