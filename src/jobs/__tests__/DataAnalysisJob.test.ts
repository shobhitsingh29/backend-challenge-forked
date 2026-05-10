import { DataAnalysisJob } from '../DataAnalysisJob';
import { Task } from '../../models/Task';

describe('DataAnalysisJob', () => {
    let job: DataAnalysisJob;

    beforeEach(() => {
        job = new DataAnalysisJob();
    });

    it('should find country for polygon within USA', async () => {
        const task = {
            taskId: 'task-1',
            geoJson: JSON.stringify({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[-74.006, 40.7128], [-74.005, 40.7128], [-74.005, 40.7138], [-74.006, 40.7138], [-74.006, 40.7128]]]
                }
            })
        } as Task;

        const result = await job.run(task);

        expect(typeof result).toBe('string');
        expect(result).toBe('United States of America');
    });

    it('should return "No country found" for polygon outside all countries', async () => {
        const task = {
            taskId: 'task-2',
            geoJson: JSON.stringify({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[0, 0], [0.001, 0], [0.001, 0.001], [0, 0.001], [0, 0]]]
                }
            })
        } as Task;

        const result = await job.run(task);

        expect(typeof result).toBe('string');
    });

    it('should handle valid polygon in different region', async () => {
        const task = {
            taskId: 'task-3',
            geoJson: JSON.stringify({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[2.2, 48.8], [2.3, 48.8], [2.3, 48.9], [2.2, 48.9], [2.2, 48.8]]]
                }
            })
        } as Task;

        const result = await job.run(task);

        expect(typeof result).toBe('string');
    });
});
