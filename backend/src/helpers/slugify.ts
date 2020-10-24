export const slugify = (value: string): string => {
  return value.trim().toLowerCase().replace(/ /g, '-');
};
