import { Feature, Polygon } from 'geojson';

export const validateUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};

export const validateGeoJSON = (geoJson: any): geoJson is Feature<Polygon> => {
    try {
        if (!geoJson || typeof geoJson !== 'object') {
            return false;
        }

        if (!geoJson.geometry || geoJson.geometry.type !== 'Polygon') {
            return false;
        }

        if (!Array.isArray(geoJson.geometry.coordinates) || geoJson.geometry.coordinates.length === 0) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
};

export const validateString = (value: any, minLength = 1, maxLength = 1000): value is string => {
    return typeof value === 'string' && value.length >= minLength && value.length <= maxLength;
};
