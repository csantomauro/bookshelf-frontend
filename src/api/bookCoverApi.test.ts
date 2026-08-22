import { describe, test, expect } from 'vitest';
import { buildCoverUrl } from './bookCoverApi';

describe("buildCoverUrl tests", () => {
  test("builds an Open Library cover URL from an ISBN", () => {
    expect(buildCoverUrl('9780441013593')).toBe(
      'https://covers.openlibrary.org/b/isbn/9780441013593-M.jpg'
    );
  });

  test("URL-encodes unusual ISBN input", () => {
    expect(buildCoverUrl('978 0441013593')).toBe(
      'https://covers.openlibrary.org/b/isbn/978%200441013593-M.jpg'
    );
  });
});
