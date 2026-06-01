import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '50px'
const COLUMN_FOOTER_HEIGHT = '56px'

// Neo SaaS Theme Combo 13
const APP_COLORS = {
  light: {
    primary: '#3b82f6', // Blue 500 (softer blue)
    bgApp: '#f8fafc', // slate-50
    bgColumn: '#e2e8f0', // slate-200 for excellent contrast with white cards
    bgCard: '#ffffff',
    bgAppBar: '#ffffff',
    bgBoardBar: '#f8fafc',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    border: '#cbd5e1' // slate-300 for better visibility
  },
  dark: {
    primary: '#3b82f6', // Blue 500
    bgApp: '#0f1117',
    bgColumn: '#151b23',
    bgCard: '#1d2430',
    bgAppBar: '#0f1117',
    bgBoardBar: '#0f1117',
    textPrimary: '#e6edf3',
    textSecondary: '#9da7b3',
    border: 'rgba(255,255,255,0.06)'
  }
}

const theme = extendTheme({
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columnFooterHeight: COLUMN_FOOTER_HEIGHT
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: APP_COLORS.light.primary
        },
        background: {
          default: APP_COLORS.light.bgApp,
          paper: APP_COLORS.light.bgCard,
          column: APP_COLORS.light.bgColumn,
          appBar: APP_COLORS.light.bgAppBar,
          boardBar: APP_COLORS.light.bgBoardBar
        },
        text: {
          primary: APP_COLORS.light.textPrimary,
          secondary: APP_COLORS.light.textSecondary
        },
        divider: APP_COLORS.light.border
      }
    },
    dark: {
      palette: {
        primary: {
          main: APP_COLORS.dark.primary
        },
        background: {
          default: APP_COLORS.dark.bgApp,
          paper: APP_COLORS.dark.bgCard,
          column: APP_COLORS.dark.bgColumn,
          appBar: APP_COLORS.dark.bgAppBar,
          boardBar: APP_COLORS.dark.bgBoardBar
        },
        text: {
          primary: APP_COLORS.dark.textPrimary,
          secondary: APP_COLORS.dark.textSecondary
        },
        divider: APP_COLORS.dark.border
      }
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif'
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          fontFamily: 'Inter, sans-serif',
          ...(theme.palette.mode === 'light' && {
            backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            backgroundAttachment: 'fixed'
          }),
          ...(theme.palette.mode === 'dark' && {
            backgroundImage: 'radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 30%), linear-gradient(to bottom, #0f1117, #0f1117)',
            backgroundAttachment: 'fixed'
          }),
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
          },
          '*::-webkit-scrollbar-track': {
            margin: 2
          }
        }
      })
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderWidth: '0.5px',
          borderRadius: '10px',
          fontWeight: 600
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem' }
      }
    },
    MuiTypography: {
      styleOverrides: {
        '&.MuiTypography-body1': { fontSize: '0.875rem' }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '0.875rem',
          borderRadius: '10px',
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: '1px !important',
            borderColor: theme.palette.divider,
            transition: 'border-color 0.2s ease, border-width 0.2s ease'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px !important',
            borderColor: theme.palette.primary.main
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px !important',
            borderColor: theme.palette.primary.main
          }
        })
      }
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderRadius: '16px',
          overflow: 'hidden', // Ensures images don't spill over the rounded corners
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'light' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' // shadow-md
            : 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.palette.mode === 'light'
              ? '0 8px 20px rgba(15,23,42,0.08)'
              : '0 8px 20px rgba(0,0,0,0.4)',
            borderColor: theme.palette.mode === 'light' ? '#e7ebf0' : 'rgba(255,255,255,0.12)'
          }
        })
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
})

export default theme