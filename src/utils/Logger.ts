import { LOG_LEVEL } from '../constants';

interface LogContext {
    taskId?: string;
    workflowId?: string;
    jobType?: string;
    [key: string]: any;
}

export class Logger {
    private context: LogContext = {};

    constructor(context?: LogContext) {
        this.context = context || {};
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        const contextStr = Object.entries(this.context)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => `${k}=${v}`)
            .join(' ');
        const prefix = contextStr ? `[${contextStr}]` : '';
        return `${timestamp} [${level}] ${prefix} ${message}`;
    }

    debug(message: string, data?: any): void {
        const formatted = this.formatMessage(LOG_LEVEL.DEBUG, message);
        console.log(formatted, data || '');
    }

    info(message: string, data?: any): void {
        const formatted = this.formatMessage(LOG_LEVEL.INFO, message);
        console.log(formatted, data || '');
    }

    warn(message: string, data?: any): void {
        const formatted = this.formatMessage(LOG_LEVEL.WARN, message);
        console.warn(formatted, data || '');
    }

    error(message: string, error?: Error | unknown): void {
        const formatted = this.formatMessage(LOG_LEVEL.ERROR, message);
        if (error instanceof Error) {
            console.error(formatted, {
                message: error.message,
                stack: error.stack,
            });
        } else {
            console.error(formatted, error);
        }
    }

    withContext(context: LogContext): Logger {
        return new Logger({ ...this.context, ...context });
    }
}

export const logger = new Logger();
