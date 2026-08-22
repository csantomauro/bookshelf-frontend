import { describe, test, expect } from 'vitest';
import { getValidationErrorMessage } from './auth';

describe("getValidationErrorMessage tests", () => {
  test("formats field errors from a 400 response", () => {
    const error = {
      response: {
        status: 400,
        data: { error: "Validation failed", fields: { publisher: "must not be blank" } },
      },
    };

    expect(getValidationErrorMessage(error)).toBe("publisher: must not be blank");
  });

  test("returns null for non-400 errors", () => {
    const error = { response: { status: 403, data: {} } };

    expect(getValidationErrorMessage(error)).toBeNull();
  });

  test("returns null when there's no response at all", () => {
    expect(getValidationErrorMessage(new Error("network error"))).toBeNull();
  });
});
