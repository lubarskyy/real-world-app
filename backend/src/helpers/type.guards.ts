export const isObject = (value: any): value is object =>
  !!value && typeof value === 'object' && value.constructor === Object;
