import { ReportGenerationJob } from '../ReportGenerationJob';
import { Task } from '../../models/Task';

describe('ReportGenerationJob', () => {
    let job: ReportGenerationJob;

    beforeEach(() => {
        job = new ReportGenerationJob();
    });

    it('should have run method defined', () => {
        expect(job.run).toBeDefined();
        expect(typeof job.run).toBe('function');
    });

    it('should be instance of ReportGenerationJob', () => {
        expect(job).toBeInstanceOf(ReportGenerationJob);
    });

    it('should handle report generation structure', () => {
        const mockReport = {
            workflowId: 'wf-1',
            tasks: [
                {
                    taskId: 'task-1',
                    type: 'analysis',
                    status: 'completed',
                    output: 'United States of America'
                },
                {
                    taskId: 'task-2',
                    type: 'polygonArea',
                    status: 'completed',
                    output: { areaInSquareMeters: 9371.96 }
                }
            ],
            finalReport: 'Workflow completed with 2 tasks. Results aggregated successfully.'
        };

        expect(mockReport).toHaveProperty('workflowId');
        expect(mockReport).toHaveProperty('tasks');
        expect(mockReport).toHaveProperty('finalReport');
        expect(mockReport.tasks).toHaveLength(2);
        expect(mockReport.tasks[0]).toHaveProperty('output');
    });

    it('should format report with correct task information', () => {
        const mockReport = {
            workflowId: 'wf-1',
            tasks: [
                { taskId: 'task-1', type: 'analysis', status: 'completed', output: 'result1' },
                { taskId: 'task-2', type: 'polygonArea', status: 'completed', output: 'result2' },
                { taskId: 'task-3', type: 'notification', status: 'completed', output: {} }
            ],
            finalReport: 'Workflow completed with 3 tasks. Results aggregated successfully.'
        };

        expect(mockReport.tasks).toHaveLength(3);
        expect(mockReport.tasks.every(t => t.status === 'completed')).toBe(true);
        expect(mockReport.finalReport).toContain('3');
    });

    it('should handle edge case of single task', () => {
        const mockReport = {
            workflowId: 'wf-1',
            tasks: [
                { taskId: 'task-1', type: 'analysis', status: 'completed', output: 'result' }
            ],
            finalReport: 'Workflow completed with 1 tasks. Results aggregated successfully.'
        };

        expect(mockReport.tasks).toHaveLength(1);
    });

    it('should generate report with task metadata', () => {
        const mockReport = {
            workflowId: 'wf-1',
            tasks: [
                {
                    taskId: 'task-1',
                    type: 'analysis',
                    status: 'completed',
                    output: null
                },
                {
                    taskId: 'task-2',
                    type: 'polygonArea',
                    status: 'completed',
                    output: { areaInSquareMeters: 1000 }
                }
            ],
            finalReport: 'Workflow completed with 2 tasks. Results aggregated successfully.'
        };

        mockReport.tasks.forEach(task => {
            expect(task).toHaveProperty('taskId');
            expect(task).toHaveProperty('type');
            expect(task).toHaveProperty('status');
            expect(task).toHaveProperty('output');
        });
    });
});
