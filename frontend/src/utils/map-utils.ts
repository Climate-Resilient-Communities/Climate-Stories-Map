import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, Feature, MultiPolygon, Polygon } from '@turf/helpers';

export function isPointInPolygon(coordinates: [number, number], geoJSON: any): boolean {
    try {
        if (!Array.isArray(coordinates) || coordinates.length !== 2 || 
            typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
            throw new Error('Invalid coordinates format');
        }
        
        if (!geoJSON || !geoJSON.features || !Array.isArray(geoJSON.features) || 
            geoJSON.features.length === 0 || !geoJSON.features[0].geometry) {
            throw new Error('Invalid geoJSON format');
        }
        
        const pt = point(coordinates);
        const polygons = geoJSON.features[0].geometry;
        return booleanPointInPolygon(pt, polygons as Feature<Polygon | MultiPolygon>);
    } catch (error) {
        console.error('Error checking if point is in polygon:', error);
        return false;
    }
}