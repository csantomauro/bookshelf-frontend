import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import BookCover from './BookCover';

describe("BookCover tests", () => {
  test("shows the placeholder when there is no cover URL", () => {
    render(<BookCover coverUrl={null} title="Dune" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('📚')).toBeInTheDocument();
  });

  test("shows the image when a cover URL is given", () => {
    render(<BookCover coverUrl="https://covers/dune.jpg" title="Dune" />);
    expect(screen.getByRole('img', { name: /cover of dune/i })).toHaveAttribute('src', 'https://covers/dune.jpg');
  });

  test("falls back to the placeholder if the image fails to load", () => {
    render(<BookCover coverUrl="https://covers/broken.jpg" title="Dune" />);
    const img = screen.getByRole('img', { name: /cover of dune/i });

    fireEvent.error(img);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('📚')).toBeInTheDocument();
  });
});
