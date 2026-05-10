import { Repository, In } from 'typeorm';
import { Task } from '../models/Task';
import { getJobForTaskType } from '../jobs/JobFactory';
import {WorkflowStatus} from "../workflows/WorkflowFactory";
import {Workflow} from "../models/Workflow";
import {Result} from "../models/Result";
import { logger } from '../utils/Logger';
import { TASK_STATUS, WORKFLOW_STATUS } from '../constants';

export enum TaskStatus {
    Queued = 'queued',
    InProgress = 'in_progress',
    Completed = 'completed',
    Failed = 'failed'
}

export class TaskRunner {
    constructor(
        private taskRepository: Repository<Task>,
    ) {}

    /**
     * Runs the appropriate job based on the task's type, managing the task's status.
     * @param task - The task entity that determines which job to run.
     * @throws If the job fails, it rethrows the error.
     */
    async run(task: Task): Promise<void> {
        const taskLogger = logger.withContext({ taskId: task.taskId, jobType: task.taskType });

        task.status = TaskStatus.InProgress;
        task.progress = 'starting job...';
        await this.taskRepository.save(task);
        const job = getJobForTaskType(task.taskType);

        try {
            taskLogger.info('Starting job');
            const resultRepository = this.taskRepository.manager.getRepository(Result);
            const taskResult = await job.run(task);
            taskLogger.info('Job completed successfully');
            const result = new Result();
            result.taskId = task.taskId!;
            result.data = JSON.stringify(taskResult || {});
            await resultRepository.save(result);
            task.resultId = result.resultId!;
            task.status = TaskStatus.Completed;
            task.progress = null;
            await this.taskRepository.save(task);

        } catch (error: any) {
            taskLogger.error('Error running job', error);

            task.status = TaskStatus.Failed;
            task.progress = null;
            await this.taskRepository.save(task);

            throw error;
        }

        const workflowRepository = this.taskRepository.manager.getRepository(Workflow);
        if (!task.workflow || !task.workflow.workflowId) {
            taskLogger.error('Task has no associated workflow');
            return;
        }

        const currentWorkflow = await workflowRepository.findOne({ where: { workflowId: task.workflow.workflowId }, relations: ['tasks'] });

        if (!currentWorkflow) {
            taskLogger.error('Workflow not found for task completion', { workflowId: task.workflow.workflowId });
            return;
        }

        if (currentWorkflow) {
            const allCompleted = currentWorkflow.tasks.every(t => t.status === TaskStatus.Completed);
            const anyFailed = currentWorkflow.tasks.some(t => t.status === TaskStatus.Failed);

            if (anyFailed) {
                currentWorkflow.status = WorkflowStatus.Failed;
            } else if (allCompleted) {
                currentWorkflow.status = WorkflowStatus.Completed;
            } else {
                currentWorkflow.status = WorkflowStatus.InProgress;
            }

            taskLogger.info('Updated workflow status', { workflowId: currentWorkflow.workflowId, status: currentWorkflow.status });

            if (currentWorkflow.status === WorkflowStatus.Completed || currentWorkflow.status === WorkflowStatus.Failed) {
                const resultRepository = this.taskRepository.manager.getRepository(Result);
                const resultIds = currentWorkflow.tasks
                    .filter(t => t.resultId)
                    .map(t => t.resultId!);

                const results = resultIds.length > 0
                    ? await resultRepository.find({ where: { resultId: In(resultIds) } })
                    : [];

                const resultMap = new Map(results.map(r => [r.resultId, r]));
                const taskResults: any[] = [];

                for (const wfTask of currentWorkflow.tasks) {
                    let output = null;
                    if (wfTask.resultId) {
                        const result = resultMap.get(wfTask.resultId);
                        if (result) {
                            output = JSON.parse(result.data || '{}');
                        }
                    }

                    taskResults.push({
                        taskId: wfTask.taskId,
                        type: wfTask.taskType,
                        status: wfTask.status,
                        result: output
                    });
                }

                const finalResult = {
                    workflowId: currentWorkflow.workflowId,
                    status: currentWorkflow.status,
                    completedAt: new Date().toISOString(),
                    tasks: taskResults
                };

                currentWorkflow.finalResult = JSON.stringify(finalResult);
            }

            await workflowRepository.save(currentWorkflow);
        }
    }
}