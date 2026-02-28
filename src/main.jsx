// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import { Experimental_CssVarsProvider as CssVarsProvider, useColorScheme } from '@mui/material/styles'
import theme from '~/theme'

// cấu hình react toastify
import { ToastContainer } from 'react-toastify'

// cấu hình MUI-dialog
import { ConfirmProvider } from 'material-ui-confirm'

function Root() {
  const { mode, systemMode } = useColorScheme()
  const effectiveMode = mode === 'system' ? systemMode : mode
  const toastTheme = effectiveMode === 'light' ? 'light' : 'dark'

  return (
    <>
      <CssBaseline />
      <App />
      <ToastContainer theme={toastTheme} position="bottom-right" closeOnClick={true}/>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <CssVarsProvider theme={theme}>
    <ConfirmProvider defaultOptions={{
      dialogProps: {
        sx: {
          '& .MuiDialogActions-root': {
            mt: 0,
            pt: 0,
            mb: 1
          }
        },
        PaperProps: {
          sx: (theme) => ({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.background.paper,
            color: theme.palette.text.primary,
            backgroundImage: 'none'
          })
        }
      },
      buttonOrder: ['confirm', 'cancel'],
      allowClose: false,
      confirmationButtonProps: { color: 'primary', variant: 'outlined', border: '10px' },
      cancellationButtonProps: { color: 'inherit' }
    }}>
      <Root />
    </ConfirmProvider>
  </CssVarsProvider>
  // {/* </React.StrictMode> */}
)
