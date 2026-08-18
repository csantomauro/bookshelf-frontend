import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from './App';

describe("Routing", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("unauthenticated visit to /books redirects to /login", () => {
    window.history.pushState({}, '', '/books');
    render(<App />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test("authenticated visit to /login redirects to /books", () => {
    sessionStorage.setItem("jwt", "test-token");
    sessionStorage.setItem("role", "USER");
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});
