// TODO: remove special characters
const collection = 'abcdefghijklmnopqrstuvwxyz1234567890';

export const slugify = (value: string): string => {
  const uniqueIdentifier = '-xxxxxx'.replace(/[x]/g, () => {
    const randomIndex = Math.round(Math.random() * (collection.length - 1));
    return collection[randomIndex];
  });

  return value.trim().toLowerCase().replace(/ /g, '-').concat(uniqueIdentifier);
};
