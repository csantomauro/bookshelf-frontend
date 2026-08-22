// If the ISBN has no cover,
// Open Library serves a generic placeholder image instead of an error,
// so this never needs to be async or handle failure.
export const buildCoverUrl = (isbn: string): string =>
  `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-M.jpg`;
