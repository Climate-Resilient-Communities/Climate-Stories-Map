/**
 * Utility functions to transform between different case styles (snake_case, camelCase)
 */

/**
 * Converts a snake_case string to camelCase
 * @param str The snake_case string to convert
 * @returns The camelCase version of the input string
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

/**
 * Transforms an object's keys from snake_case to camelCase recursively
 * @param obj The object to transform
 * @returns A new object with all keys transformed to camelCase
 */
export const transformKeysToCamel = <T extends object>(obj: T): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        return transformKeysToCamel(item);
      }
      return item;
    });
  }
  
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    if(key === '_id') {
      return result[key] = obj[key as keyof T];
    }
    const camelKey = snakeToCamel(key);
    const value = obj[key as keyof T];
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[camelKey] = transformKeysToCamel(value);
    } else if (Array.isArray(value)) {
      result[camelKey] = value.map(item => {
        if (typeof item === 'object' && item !== null) {
          return transformKeysToCamel(item);
        }
        return item;
      });
    } else {
      result[camelKey] = value;
    }
  });
  
  return result;
};