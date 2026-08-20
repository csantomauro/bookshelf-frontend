import { afterEach, beforeEach, describe, test, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import LoadingState from './components/LoadingState';

describe("LoadingState tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("does not show the slow-server hint immediately", () => {
    render(<LoadingState />);
    expect(screen.queryByText(/Waking up the librarian/i)).not.toBeInTheDocument();
  });

  test("shows the slow-server hint after a few seconds", () => {
    render(<LoadingState />);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByText(/Waking up the librarian/i)).toBeInTheDocument();
  });
});
