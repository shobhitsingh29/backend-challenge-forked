import { TASK_POLLING_INTERVAL_MS, TASK_STATUS, WORKFLOW_STATUS, HTTP_STATUS, LOG_LEVEL } from '../index';

describe('Constants', () => {
    describe('TASK_POLLING_INTERVAL_MS', () => {
        it('should be a positive number', () => {
            expect(typeof TASK_POLLING_INTERVAL_MS).toBe('number');
            expect(TASK_POLLING_INTERVAL_MS).toBeGreaterThan(0);
        });

        it('should be set to 5000ms', () => {
            expect(TASK_POLLING_INTERVAL_MS).toBe(5000);
        });
    });

    describe('TASK_STATUS', () => {
        it('should have all required statuses', () => {
            expect(TASK_STATUS).toHaveProperty('QUEUED');
            expect(TASK_STATUS).toHaveProperty('IN_PROGRESS');
            expect(TASK_STATUS).toHaveProperty('COMPLETED');
            expect(TASK_STATUS).toHaveProperty('FAILED');
        });

        it('should have correct status values', () => {
            expect(TASK_STATUS.QUEUED).toBe('queued');
            expect(TASK_STATUS.IN_PROGRESS).toBe('in_progress');
            expect(TASK_STATUS.COMPLETED).toBe('completed');
            expect(TASK_STATUS.FAILED).toBe('failed');
        });
    });

    describe('WORKFLOW_STATUS', () => {
        it('should have all required statuses', () => {
            expect(WORKFLOW_STATUS).toHaveProperty('INITIAL');
            expect(WORKFLOW_STATUS).toHaveProperty('IN_PROGRESS');
            expect(WORKFLOW_STATUS).toHaveProperty('COMPLETED');
            expect(WORKFLOW_STATUS).toHaveProperty('FAILED');
        });

        it('should have correct status values', () => {
            expect(WORKFLOW_STATUS.INITIAL).toBe('initial');
            expect(WORKFLOW_STATUS.IN_PROGRESS).toBe('in_progress');
            expect(WORKFLOW_STATUS.COMPLETED).toBe('completed');
            expect(WORKFLOW_STATUS.FAILED).toBe('failed');
        });
    });

    describe('HTTP_STATUS', () => {
        it('should have all required status codes', () => {
            expect(HTTP_STATUS).toHaveProperty('OK');
            expect(HTTP_STATUS).toHaveProperty('ACCEPTED');
            expect(HTTP_STATUS).toHaveProperty('BAD_REQUEST');
            expect(HTTP_STATUS).toHaveProperty('NOT_FOUND');
            expect(HTTP_STATUS).toHaveProperty('INTERNAL_SERVER_ERROR');
        });

        it('should have correct HTTP status codes', () => {
            expect(HTTP_STATUS.OK).toBe(200);
            expect(HTTP_STATUS.ACCEPTED).toBe(202);
            expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
            expect(HTTP_STATUS.NOT_FOUND).toBe(404);
            expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
        });
    });

    describe('LOG_LEVEL', () => {
        it('should have all required log levels', () => {
            expect(LOG_LEVEL).toHaveProperty('DEBUG');
            expect(LOG_LEVEL).toHaveProperty('INFO');
            expect(LOG_LEVEL).toHaveProperty('WARN');
            expect(LOG_LEVEL).toHaveProperty('ERROR');
        });

        it('should have correct log level values', () => {
            expect(LOG_LEVEL.DEBUG).toBe('DEBUG');
            expect(LOG_LEVEL.INFO).toBe('INFO');
            expect(LOG_LEVEL.WARN).toBe('WARN');
            expect(LOG_LEVEL.ERROR).toBe('ERROR');
        });
    });
});
