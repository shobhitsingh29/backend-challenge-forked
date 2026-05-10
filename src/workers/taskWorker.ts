import {AppDataSource} from '../data-source';
import {Task} from '../models/Task';
import {TaskRunner, TaskStatus} from './taskRunner';
import { logger } from '../utils/Logger';
import { TASK_POLLING_INTERVAL_MS, TASK_STATUS } from '../constants';
import { In } from 'typeorm';

export function taskWorker(): Promise<void> {
    const taskRepository = AppDataSource.getRepository(Task);
    const taskRunner = new TaskRunner(taskRepository);

    logger.info('Task worker started');

    const startWorker = async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                const queuedTasks = await taskRepository.find({
                    where: { status: TaskStatus.Queued },
                    relations: ['workflow']
                });

                let taskToExecute: Task | null = null;

                if (queuedTasks.length > 0) {
                    const dependencyIds = queuedTasks
                        .filter(t => t.dependsOnTaskId)
                        .map(t => t.dependsOnTaskId!);

                    const dependencyTasks = dependencyIds.length > 0
                        ? await taskRepository.find({ where: { taskId: In(dependencyIds) } })
                        : [];

                    const dependencyMap = new Map(dependencyTasks.map(t => [t.taskId, t]));

                    for (const task of queuedTasks) {
                        if (task.dependsOnTaskId) {
                            const dependencyTask = dependencyMap.get(task.dependsOnTaskId);
                            if (!dependencyTask) {
                                task.status = TaskStatus.Failed;
                                task.progress = null;
                                await taskRepository.save(task);
                                logger.error('Task marked as failed - dependency task not found', { taskId: task.taskId, dependsOnTaskId: task.dependsOnTaskId });
                            } else if (dependencyTask.status === TaskStatus.Failed) {
                                task.status = TaskStatus.Failed;
                                task.progress = null;
                                await taskRepository.save(task);
                                logger.info('Task marked as failed due to failed dependency', { taskId: task.taskId, dependsOnTaskId: task.dependsOnTaskId });
                            } else if (dependencyTask.status === TaskStatus.Completed) {
                                taskToExecute = task;
                                break;
                            }
                        } else {
                            taskToExecute = task;
                            break;
                        }
                    }
                }

                if (taskToExecute) {
                    try {
                        logger.info('Executing task', { taskId: taskToExecute.taskId, taskType: taskToExecute.taskType });
                        await taskRunner.run(taskToExecute);
                    } catch (error) {
                        logger.error('Task execution failed', error);
                    }
                }

                await new Promise(resolve => setTimeout(resolve, TASK_POLLING_INTERVAL_MS));
            } catch (error) {
                logger.error('Error in task worker loop', error);
                await new Promise(resolve => setTimeout(resolve, TASK_POLLING_INTERVAL_MS));
            }
        }
    };

    return startWorker();
}