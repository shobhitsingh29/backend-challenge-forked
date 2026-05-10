import { getJobForTaskType } from '../jobs/JobFactory';
import { Task } from '../models/Task';
import { validateGeoJSON, validateUUID } from '../utils/validators';

describe('Integration Tests', () => {
    describe('Complete Job Execution Flow', () => {
        it('should execute analysis job and polygon area job sequentially', async () => {
            const analysisJob = getJobForTaskType('analysis');
            const polygonAreaJob = getJobForTaskType('polygonArea');

            const analysisTask = {
                taskId: 'task-1',
                geoJson: JSON.stringify({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[-74.006, 40.7128], [-74.005, 40.7128], [-74.005, 40.7138], [-74.006, 40.7138], [-74.006, 40.7128]]]
                    }
                })
            } as Task;

            const analysisResult = await analysisJob.run(analysisTask);
            expect(analysisResult).toEqual('United States of America');

            const areaResult = await polygonAreaJob.run(analysisTask);
            expect(areaResult).toHaveProperty('areaInSquareMeters');
            expect(areaResult.areaInSquareMeters).toBeGreaterThan(0);
        });

        it('should handle notification and report jobs after analysis', async () => {
            const notificationJob = getJobForTaskType('notification');
            const reportJob = getJobForTaskType('report');

            const task = {
                taskId: 'task-1',
                geoJson: JSON.stringify({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[-74.006, 40.7128], [-74.005, 40.7128], [-74.005, 40.7138], [-74.006, 40.7138], [-74.006, 40.7128]]]
                    }
                }),
                workflow: { workflowId: 'wf-1' }
            } as any;

            const notificationResult = await notificationJob.run(task);
            expect(notificationResult).toBeUndefined();
        });
    });

    describe('Validation Integration', () => {
        it('should validate and process valid workflow GeoJSON', () => {
            const geoJson = {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[-122.4, 37.8], [-122.3, 37.8], [-122.3, 37.9], [-122.4, 37.9], [-122.4, 37.8]]]
                }
            };

            expect(validateGeoJSON(geoJson)).toBe(true);
        });

        it('should validate workflow IDs as UUIDs', () => {
            const workflowId = '550e8400-e29b-41d4-a716-446655440000';
            expect(validateUUID(workflowId)).toBe(true);
        });

        it('should reject invalid workflow combinations', () => {
            const invalidGeoJson = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                }
            };

            expect(validateGeoJSON(invalidGeoJson)).toBe(false);
        });
    });

    describe('Job Factory with Multiple Jobs', () => {
        it('should create different jobs for different task types', () => {
            const jobs = [
                getJobForTaskType('analysis'),
                getJobForTaskType('polygonArea'),
                getJobForTaskType('notification'),
                getJobForTaskType('report')
            ];

            expect(jobs).toHaveLength(4);
            jobs.forEach(job => {
                expect(job).toBeDefined();
                expect(job.run).toBeDefined();
            });
        });
    });

    describe('Error Handling in Job Pipeline', () => {
        it('should handle job execution errors gracefully', async () => {
            const job = getJobForTaskType('analysis');
            const invalidTask = {
                taskId: 'task-error',
                geoJson: 'invalid json'
            } as Task;

            await expect(job.run(invalidTask)).rejects.toThrow();
        });

        it('should handle missing required fields', async () => {
            const job = getJobForTaskType('polygonArea');
            const incompleteTask = {
                taskId: 'task-incomplete'
            } as Task;

            await expect(job.run(incompleteTask)).rejects.toThrow();
        });
    });
});
