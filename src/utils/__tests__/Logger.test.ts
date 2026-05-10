import { logger } from '../Logger';

describe('Logger', () => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    let capturedOutput: string[] = [];

    beforeEach(() => {
        capturedOutput = [];
        console.log = jest.fn((output) => {
            capturedOutput.push(output);
        });
        console.warn = jest.fn((output) => {
            capturedOutput.push(output);
        });
        console.error = jest.fn((output) => {
            capturedOutput.push(output);
        });
    });

    afterEach(() => {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
    });

    describe('info', () => {
        it('should log info messages with timestamp', () => {
            logger.info('Test info message');
            expect(capturedOutput.length).toBeGreaterThan(0);
            expect(capturedOutput[0]).toContain('[INFO]');
            expect(capturedOutput[0]).toContain('Test info message');
        });

        it('should include context in log message', () => {
            const contextLogger = logger.withContext({ taskId: 'test-123', jobType: 'analysis' });
            contextLogger.info('Task started');
            expect(capturedOutput[0]).toContain('taskId');
            expect(capturedOutput[0]).toContain('test-123');
        });
    });

    describe('withContext', () => {
        it('should create logger with context', () => {
            const contextLogger = logger.withContext({ workflowId: 'wf-456' });
            expect(contextLogger).toBeDefined();
        });

        it('should preserve context in multiple calls', () => {
            const contextLogger = logger.withContext({ userId: 'user-789' });
            contextLogger.info('First message');
            contextLogger.info('Second message');
            expect(capturedOutput.length).toBe(2);
            expect(capturedOutput[0]).toContain('userId');
            expect(capturedOutput[1]).toContain('userId');
        });
    });

    describe('error', () => {
        it('should log error messages', () => {
            const error = new Error('Test error');
            logger.error('An error occurred', error);
            expect(capturedOutput[0]).toContain('[ERROR]');
            expect(capturedOutput[0]).toContain('An error occurred');
        });
    });

    describe('warn', () => {
        it('should log warning messages', () => {
            logger.warn('A warning', { code: 'WARN_001' });
            expect(capturedOutput[0]).toContain('[WARN]');
            expect(capturedOutput[0]).toContain('A warning');
        });
    });
});
