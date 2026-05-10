import { Job } from './Job';
import { Task } from '../models/Task';
import { Result } from '../models/Result';
import { Workflow } from '../models/Workflow';
import { AppDataSource } from '../data-source';
import { logger } from '../utils/Logger';
import { In } from 'typeorm';

interface TaskResult {
    taskId: string;
    type: string;
    status: string;
    output: any;
}

export class ReportGenerationJob implements Job {
    async run(task: Task): Promise<{ workflowId: string; tasks: TaskResult[]; finalReport: string }> {
        const taskLogger = logger.withContext({ taskId: task.taskId, workflowId: task.workflow.workflowId });
        taskLogger.info('Generating report for workflow');

        const resultRepository = AppDataSource.getRepository(Result);
        const workflowRepository = AppDataSource.getRepository(Workflow);
        const taskResults: TaskResult[] = [];

        const workflow = await workflowRepository.findOne({
            where: { workflowId: task.workflow.workflowId },
            relations: ['tasks']
        });

        if (!workflow) {
            taskLogger.error('Workflow not found during report generation');
            throw new Error(`Workflow ${task.workflow.workflowId} not found`);
        }

        const workflowTasks = workflow.tasks || [];
        const sortedTasks = workflowTasks.sort((a, b) => a.stepNumber - b.stepNumber);

        const resultIds = sortedTasks
            .filter(t => t.resultId)
            .map(t => t.resultId!);

        const results = resultIds.length > 0
            ? await resultRepository.find({ where: { resultId: In(resultIds) } })
            : [];

        const resultMap = new Map(results.map(r => [r.resultId, r]));

        for (const workflowTask of sortedTasks) {
            let output = null;

            if (workflowTask.resultId) {
                const result = resultMap.get(workflowTask.resultId);
                if (result) {
                    try {
                        output = JSON.parse(result.data || '{}');
                    } catch (parseError) {
                        taskLogger.error(`Failed to parse result for task ${workflowTask.taskId}`, parseError);
                        output = null;
                    }
                }
            }

            taskResults.push({
                taskId: workflowTask.taskId,
                type: workflowTask.taskType,
                status: workflowTask.status,
                output
            });
        }

        const finalReport = `Workflow completed with ${taskResults.length} tasks. Results aggregated successfully.`;
        taskLogger.info('Report generation completed', { taskCount: taskResults.length });

        return {
            workflowId: task.workflow.workflowId,
            tasks: taskResults,
            finalReport
        };
    }
}
