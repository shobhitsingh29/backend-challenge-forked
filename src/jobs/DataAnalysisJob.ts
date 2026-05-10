import { Job } from './Job';
import { Task } from '../models/Task';
import { logger } from '../utils/Logger';
import booleanWithin from '@turf/boolean-within';
import { Feature, Polygon } from 'geojson';
import countryMapping from '../data/world_data.json';

export class DataAnalysisJob implements Job {
    async run(task: Task): Promise<string> {
        const taskLogger = logger.withContext({ taskId: task.taskId, jobType: 'analysis' });
        taskLogger.info('Running data analysis');

        const inputGeometry: Feature<Polygon> = JSON.parse(task.geoJson);

        for (const countryFeature of countryMapping.features) {
            if (countryFeature.geometry.type === 'Polygon' || countryFeature.geometry.type === 'MultiPolygon') {
                const isWithin = booleanWithin(inputGeometry, countryFeature as Feature<Polygon>);
                if (isWithin) {
                    const countryName = countryFeature.properties?.name || 'Unknown';
                    taskLogger.info('Polygon found within country', { country: countryName });
                    return countryName;
                }
            }
        }
        taskLogger.info('No country found for polygon');
        return 'No country found';
    }
}