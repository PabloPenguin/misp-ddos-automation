import { createTheme } from '@mui/material/styles';

// Black and Yellow Cybersecurity Theme
export const blackYellowTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFD700', // Bright Gold/Yellow
      dark: '#FFA000', // Darker Yellow
      light: '#FFFF8D', // Light Yellow
      contrastText: '#000000', // Black text on yellow
    },
    secondary: {
      main: '#FFAB00', // Amber Yellow
      dark: '#FF8F00', // Dark Amber
      light: '#FFE082', // Light Amber
      contrastText: '#000000',
    },
    background: {
      default: '#0A0A0A', // Near black
      paper: '#1A1A1A', // Dark gray for cards
    },
    text: {
      primary: '#FFFFFF', // White primary text
      secondary: '#E0E0E0', // Light gray secondary text
    },
    error: {
      main: '#FF4444', // Bright red for errors
      dark: '#CC0000',
      light: '#FF7777',
    },
    warning: {
      main: '#FF9800', // Orange for warnings
      dark: '#F57C00',
      light: '#FFB74D',
    },
    info: {
      main: '#2196F3', // Blue for info
      dark: '#1976D2',
      light: '#64B5F6',
    },
    success: {
      main: '#4CAF50', // Green for success
      dark: '#388E3C',
      light: '#81C784',
    },
    divider: '#333333', // Dark gray dividers
  },
  typography: {
    fontFamily: '"Roboto Mono", "Roboto", monospace',
    h1: {
      fontWeight: 700,
      color: '#FFD700',
    },
    h2: {
      fontWeight: 600,
      color: '#FFD700',
    },
    h3: {
      fontWeight: 600,
      color: '#FFD700',
    },
    h4: {
      fontWeight: 600,
      color: '#FFD700',
    },
    h5: {
      fontWeight: 500,
      color: '#FFD700',
    },
    h6: {
      fontWeight: 500,
      color: '#FFD700',
    },
    body1: {
      color: '#FFFFFF',
    },
    body2: {
      color: '#E0E0E0',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0A0A0A',
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255, 215, 0, 0.03) 0%, transparent 50%)
          `,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          border: '1px solid #333333',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#FFD700',
            boxShadow: '0 8px 32px rgba(255, 215, 0, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          border: '1px solid #333333',
          borderRadius: '12px',
          '&.MuiPaper-elevation1': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s ease',
        },
        contained: {
          backgroundColor: '#FFD700',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#FFA000',
            boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#FFD700',
          color: '#FFD700',
          '&:hover': {
            borderColor: '#FFA000',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#FFD700',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            color: '#FFA000',
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#2A2A2A',
          color: '#FFD700',
          border: '1px solid #FFD700',
          '&.MuiChip-filled': {
            backgroundColor: '#FFD700',
            color: '#000000',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid',
        },
        standardInfo: {
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderColor: '#2196F3',
          color: '#FFFFFF',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderColor: '#FF9800',
          color: '#FFFFFF',
        },
        standardError: {
          backgroundColor: 'rgba(255, 68, 68, 0.1)',
          borderColor: '#FF4444',
          color: '#FFFFFF',
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderColor: '#4CAF50',
          color: '#FFFFFF',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#333333',
          borderRadius: '4px',
        },
        bar: {
          backgroundColor: '#FFD700',
          borderRadius: '4px',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#FFD700',
            '& + .MuiSwitch-track': {
              backgroundColor: '#FFD700',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          borderBottom: '1px solid #333333',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1A1A',
          borderRight: '1px solid #333333',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 215, 0, 0.2)',
            borderRight: '3px solid #FFD700',
            '&:hover': {
              backgroundColor: 'rgba(255, 215, 0, 0.3)',
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#2A2A2A',
            color: '#FFD700',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 215, 0, 0.05)',
          },
        },
      },
    },
  },
});

// Chart.js theme configuration
export const chartTheme = {
  backgroundColor: 'rgba(255, 215, 0, 0.1)',
  borderColor: '#FFD700',
  pointBackgroundColor: '#FFD700',
  pointBorderColor: '#FFA000',
  gridColor: '#333333',
  textColor: '#FFFFFF',
  colors: {
    primary: '#FFD700',
    secondary: '#FFA000',
    tertiary: '#FFAB00',
    quaternary: '#FFE082',
    accent: '#FF9800',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#FF4444',
    info: '#2196F3',
  },
  gradients: {
    yellow: ['#FFD700', '#FFAB00'],
    gold: ['#FFA000', '#FF8F00'],
    amber: ['#FFAB00', '#FF6F00'],
  },
};

export default blackYellowTheme;