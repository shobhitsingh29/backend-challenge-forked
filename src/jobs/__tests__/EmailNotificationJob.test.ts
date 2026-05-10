import { EmailNotificationJob } from '../EmailNotificationJob';
import { Task } from '../../models/Task';

describe('EmailNotificationJob', () => {
    let job: EmailNotificationJob;

    beforeEach(() => {
        job = new EmailNotificationJob();
    });

    it('should complete email notification', async () => {
        const task = {
            taskId: 'task-1'
        } as Task;

        const startTime = Date.now();
        await job.run(task);
        const endTime = Date.now();

        expect(endTime - startTime).toBeGreaterThanOrEqual(500);
    });

    it('should not throw errors', async () => {
        const task = {
            taskId: 'task-2'
        } as Task;

        await expect(job.run(task)).resolves.not.toThrow();
    });

    it('should handle multiple notifications', async () => {
        const task1 = { taskId: 'task-1' } as Task;
        const task2 = { taskId: 'task-2' } as Task;

        await expect(Promise.all([job.run(task1), job.run(task2)])).resolves.toStrictEqual([undefined, undefined]);
    });
});
