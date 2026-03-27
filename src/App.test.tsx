import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom/vitest';

describe("App tests", () => {
    test("component renders", () => {
        render(<App />)
        expect(screen.getByText(/Book Shop/i)).toBeInTheDocument();
    })
})