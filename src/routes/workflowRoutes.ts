import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Workflow } from '../models/Workflow';
import { TaskStatus } from '../workers/taskRunner';
import { logger } from '../utils/Logger';
import { validateUUID } from '../utils/validators';
import { WORKFLOW_STATUS, HTTP_STATUS } from '../constants';

const router = Router();

(router.get as any)('/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!validateUUID(id)) {
        logger.warn('Invalid UUID format', { workflowId: id });
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid workflow ID format' });
        return;
    }

    const workflowRepository = AppDataSource.getRepository(Workflow);

    try {
        const workflow = await workflowRepository.findOne({
            where: { workflowId: id },
            relations: ['tasks']
        });

        if (!workflow) {
            logger.warn('Workflow not found', { workflowId: id });
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Workflow not found' });
        }

        const completedTasks = workflow.tasks.filter(t => t.status === TaskStatus.Completed).length;
        const totalTasks = workflow.tasks.length;

        logger.info('Fetched workflow status', { workflowId: id, status: workflow.status, completedTasks, totalTasks });
        res.json({
            workflowId: workflow.workflowId,
            status: workflow.status,
            completedTasks,
            totalTasks
        });
    } catch (error: any) {
        logger.error('Error fetching workflow status', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch workflow status' });
    }
});

(router.get as any)('/:id/results', async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!validateUUID(id)) {
        logger.warn('Invalid UUID format', { workflowId: id });
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid workflow ID format' });
        return;
    }

    const workflowRepository = AppDataSource.getRepository(Workflow);

    try {
        const workflow = await workflowRepository.findOne({
            where: { workflowId: id }
        });

        if (!workflow) {
            logger.warn('Workflow not found', { workflowId: id });
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Workflow not found' });
        }

        if (workflow.status !== WORKFLOW_STATUS.COMPLETED) {
            logger.info('Workflow not yet completed', { workflowId: id, status: workflow.status });
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Workflow is not yet completed' });
        }

        let finalResult = null;
        if (workflow.finalResult) {
            try {
                finalResult = JSON.parse(workflow.finalResult);
            } catch (parseError) {
                logger.error('Failed to parse finalResult', parseError);
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Invalid workflow result data' });
            }
        }

        logger.info('Fetched workflow results', { workflowId: id });
        res.json({
            workflowId: workflow.workflowId,
            status: workflow.status,
            finalResult
        });
    } catch (error: any) {
        logger.error('Error fetching workflow results', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch workflow results' });
    }
});

export default router;
