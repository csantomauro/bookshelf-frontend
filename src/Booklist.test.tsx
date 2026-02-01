import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import Booklist from './components/Booklist';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({children } : { children: React.ReactNode }) => (
    <QueryClientProvider client = {
      queryClient}>{children}
    </QueryClientProvider>);

describe("Booklist tests", () => {
  test("component renders", () => {
    render(<Booklist />, { wrapper });
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  })

  test("Book are fetched", async () => {
    render(<Booklist />, { wrapper });
    await waitFor(() => screen.getByText(/New Book/i));
    expect(screen.getByText(/Ford/i)).toBeInTheDocument();
  })

  test("Open new book modal", async () => {
    render(<Booklist />, { wrapper });
    await waitFor(() => screen.getByText(/New Book/i));
    await userEvent.click(screen.getByText(/New Book/i));
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  })  
});