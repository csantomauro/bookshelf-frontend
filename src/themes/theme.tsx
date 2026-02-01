import { createTheme } from '@mui/material/styles';

const theme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#0956af' },    // your requested blue
      secondary: { main: '#af6209' },  // brown accent
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1E1E1E' : '#fff',
      },
      text: {
        primary: darkMode ? '#e0e0e0' : '#1e1e1e',
        secondary: darkMode ? '#b0b0b0' : '#555',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      button: { textTransform: 'none' },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 500,
          },
          containedPrimary: {
            backgroundColor: darkMode ? '#0d73d3' : '#0956af', // slightly lighter blue in dark mode
            color: '#fff',
            '&:hover': {
              backgroundColor: darkMode ? '#0f7ae0' : '#0a4a8d',
            },
          },
          outlinedSecondary: {
            color: darkMode ? '#e0e0e0' : '#1e1e1e',
            borderColor: darkMode ? '#555' : '#af6209',
            '&:hover': {
              backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(175,98,9,0.08)',
              borderColor: darkMode ? '#888' : '#af6209',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            padding: '16px',
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            justifyContent: 'flex-end',
            gap: '8px',
          },
        },
      },
    },
  });

export default theme;
