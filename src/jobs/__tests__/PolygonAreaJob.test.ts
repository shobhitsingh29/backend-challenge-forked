import { PolygonAreaJob } from '../PolygonAreaJob';
import { Task } from '../../models/Task';

describe('PolygonAreaJob', () => {
    let job: PolygonAreaJob;

    beforeEach(() => {
        job = new PolygonAreaJob();
    });

    it('should calculate area for valid polygon', async () => {
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

        expect(result).toHaveProperty('areaInSquareMeters');
        expect(typeof result.areaInSquareMeters).toBe('number');
        expect(result.areaInSquareMeters).toBeGreaterThan(0);
    });

    it('should throw error for invalid GeoJSON', async () => {
        const task = {
            taskId: 'task-2',
            geoJson: JSON.stringify({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [-74.006, 40.7128]
                }
            })
        } as Task;

        await expect(job.run(task)).rejects.toThrow();
    });

    it('should throw error for malformed GeoJSON', async () => {
        const task = {
            taskId: 'task-3',
            geoJson: 'not valid json'
        } as Task;

        await expect(job.run(task)).rejects.toThrow();
    });

    it('should handle missing geometry field', async () => {
        const task = {
            taskId: 'task-4',
            geoJson: JSON.stringify({
                type: 'Feature'
            })
        } as Task;

        await expect(job.run(task)).rejects.toThrow();
    });
});
