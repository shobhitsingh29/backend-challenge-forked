import { validateUUID, validateGeoJSON, validateString } from '../validators';

describe('Validators', () => {
    describe('validateUUID', () => {
        it('should validate correct UUIDs', () => {
            expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
            expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
        });

        it('should reject invalid UUIDs', () => {
            expect(validateUUID('invalid-uuid')).toBe(false);
            expect(validateUUID('550e8400-e29b-41d4-a716-44665544000')).toBe(false);
            expect(validateUUID('')).toBe(false);
            expect(validateUUID('550e8400e29b41d4a716446655440000')).toBe(false);
        });

        it('should be case insensitive', () => {
            expect(validateUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
        });
    });

    describe('validateGeoJSON', () => {
        it('should validate valid Polygon GeoJSON', () => {
            const validGeoJSON = {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[-74.006, 40.7128], [-74.005, 40.7128], [-74.005, 40.7138], [-74.006, 40.7138], [-74.006, 40.7128]]]
                }
            };
            expect(validateGeoJSON(validGeoJSON)).toBe(true);
        });

        it('should reject non-Polygon geometry', () => {
            const invalidGeoJSON = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [-74.006, 40.7128]
                }
            };
            expect(validateGeoJSON(invalidGeoJSON)).toBe(false);
        });

        it('should reject missing geometry', () => {
            const invalidGeoJSON = {
                type: 'Feature'
            };
            expect(validateGeoJSON(invalidGeoJSON)).toBe(false);
        });

        it('should reject empty coordinates', () => {
            const invalidGeoJSON = {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: []
                }
            };
            expect(validateGeoJSON(invalidGeoJSON)).toBe(false);
        });

        it('should reject null or undefined', () => {
            expect(validateGeoJSON(null)).toBe(false);
            expect(validateGeoJSON(undefined)).toBe(false);
        });

        it('should reject non-object values', () => {
            expect(validateGeoJSON('not an object')).toBe(false);
            expect(validateGeoJSON(123)).toBe(false);
        });
    });

    describe('validateString', () => {
        it('should validate strings within bounds', () => {
            expect(validateString('hello')).toBe(true);
            expect(validateString('a')).toBe(true);
            expect(validateString('x'.repeat(1000))).toBe(true);
        });

        it('should reject strings below minimum length', () => {
            expect(validateString('', 1)).toBe(false);
        });

        it('should reject strings above maximum length', () => {
            expect(validateString('x'.repeat(1001), 1, 1000)).toBe(false);
        });

        it('should respect custom min and max', () => {
            expect(validateString('ab', 3, 5)).toBe(false);
            expect(validateString('abcd', 3, 5)).toBe(true);
            expect(validateString('abcdef', 3, 5)).toBe(false);
        });

        it('should reject non-string values', () => {
            expect(validateString(123 as any)).toBe(false);
            expect(validateString(null as any)).toBe(false);
            expect(validateString(undefined as any)).toBe(false);
        });
    });
});
