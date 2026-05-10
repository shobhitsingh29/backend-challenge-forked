import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { WorkflowFactory } from '../workflows/WorkflowFactory';
import { logger } from '../utils/Logger';
import { validateGeoJSON, validateString } from '../utils/validators';
import { HTTP_STATUS } from '../constants';
import path from 'path';

const router = Router();
const workflowFactory = new WorkflowFactory(AppDataSource);

router.post('/', async (req, res) => {
    const { clientId, geoJson } = req.body;

    if (!validateString(clientId, 1, 100)) {
        logger.warn('Invalid clientId', { clientId });
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid clientId' });
        return;
    }

    let parsedGeoJson: any = geoJson;
    if (typeof geoJson === 'string') {
        try {
            parsedGeoJson = JSON.parse(geoJson);
        } catch {
            logger.warn('Invalid GeoJSON JSON', { clientId });
            res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid GeoJSON format' });
            return;
        }
    }

    if (!validateGeoJSON(parsedGeoJson)) {
        logger.warn('Invalid GeoJSON', { clientId });
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'Invalid GeoJSON format' });
        return;
    }

    const workflowFile = path.join(__dirname, '../workflows/example_workflow.yml');

    try {
        const workflow = await workflowFactory.createWorkflowFromYAML(workflowFile, clientId, JSON.stringify(parsedGeoJson));
        logger.info('Workflow created', { workflowId: workflow.workflowId, clientId });

        res.status(HTTP_STATUS.ACCEPTED).json({
            workflowId: workflow.workflowId,
            message: 'Workflow created and tasks queued from YAML definition.'
        });
    } catch (error: any) {
        logger.error('Error creating workflow', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create workflow' });
    }
});

export default router;