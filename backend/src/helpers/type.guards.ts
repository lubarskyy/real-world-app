export const isObject = (value: any): value is object =>
  !!value && typeof value === 'object' && value.constructor === Object;

export const isString = (value: unknown): value is string => value && typeof value === 'string';
