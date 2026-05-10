export const TASK_POLLING_INTERVAL_MS = 5000;
export const JOB_TIMEOUT_MS = 30000;

export const TASK_STATUS = {
    QUEUED: 'queued',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed',
} as const;

export const WORKFLOW_STATUS = {
    INITIAL: 'initial',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed',
} as const;

export const HTTP_STATUS = {
    OK: 200,
    ACCEPTED: 202,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const LOG_LEVEL = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
} as const;
