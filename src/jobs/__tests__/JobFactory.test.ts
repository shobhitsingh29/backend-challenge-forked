import { getJobForTaskType } from '../JobFactory';
import { DataAnalysisJob } from '../DataAnalysisJob';
import { PolygonAreaJob } from '../PolygonAreaJob';
import { EmailNotificationJob } from '../EmailNotificationJob';
import { ReportGenerationJob } from '../ReportGenerationJob';

describe('JobFactory', () => {
    it('should return DataAnalysisJob for "analysis" type', () => {
        const job = getJobForTaskType('analysis');
        expect(job).toBeInstanceOf(DataAnalysisJob);
    });

    it('should return PolygonAreaJob for "polygonArea" type', () => {
        const job = getJobForTaskType('polygonArea');
        expect(job).toBeInstanceOf(PolygonAreaJob);
    });

    it('should return EmailNotificationJob for "notification" type', () => {
        const job = getJobForTaskType('notification');
        expect(job).toBeInstanceOf(EmailNotificationJob);
    });

    it('should return ReportGenerationJob for "report" type', () => {
        const job = getJobForTaskType('report');
        expect(job).toBeInstanceOf(ReportGenerationJob);
    });

    it('should throw error for unknown task type', () => {
        expect(() => getJobForTaskType('unknownType')).toThrow();
    });

    it('should throw error for empty task type', () => {
        expect(() => getJobForTaskType('')).toThrow();
    });

    it('should throw error for null task type', () => {
        expect(() => getJobForTaskType(null as any)).toThrow();
    });

    it('should create new instance for each call', () => {
        const job1 = getJobForTaskType('analysis');
        const job2 = getJobForTaskType('analysis');
        expect(job1).not.toBe(job2);
    });
});
