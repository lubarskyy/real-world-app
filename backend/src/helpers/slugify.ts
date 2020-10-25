// TODO: remove special characters
// TODO: add unique identifier suffix
export const slugify = (value: string): string => {
  return value.trim().toLowerCase().replace(/ /g, '-');
};
