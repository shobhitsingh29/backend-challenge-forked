import { Job } from './Job';
import { Task } from '../models/Task';
import { logger } from '../utils/Logger';

export class EmailNotificationJob implements Job {
    async run(task: Task): Promise<void> {
        const taskLogger = logger.withContext({ taskId: task.taskId, jobType: 'notification' });
        taskLogger.info('Sending email notification');

        await new Promise(resolve => setTimeout(resolve, 500));

        taskLogger.info('Email notification sent');
    }
}