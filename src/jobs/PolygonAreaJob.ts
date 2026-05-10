import { Job } from './Job';
import { Task } from '../models/Task';
import { logger } from '../utils/Logger';
import area from '@turf/area';
import { Feature, Polygon } from 'geojson';

export class PolygonAreaJob implements Job {
    async run(task: Task): Promise<{ areaInSquareMeters: number }> {
        const taskLogger = logger.withContext({ taskId: task.taskId, jobType: 'polygonArea' });
        taskLogger.info('Calculating polygon area');

        try {
            const geometry: Feature<Polygon> = JSON.parse(task.geoJson);

            if (!geometry || !geometry.geometry || geometry.geometry.type !== 'Polygon') {
                throw new Error('Invalid GeoJSON: must be a Polygon feature');
            }

            const areaValue = area(geometry);
            taskLogger.info('Polygon area calculated', { areaInSquareMeters: areaValue });

            return { areaInSquareMeters: areaValue };
        } catch (error: any) {
            taskLogger.error('Error calculating polygon area', error);
            throw error;
        }
    }
}
