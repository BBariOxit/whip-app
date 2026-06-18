// import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from '~/App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { Experimental_CssVarsProvider as CssVarsProvider, useColorScheme } from '@mui/material/styles'
import theme from '~/theme'

// cấu hình react toastify
import { ToastContainer } from 'react-toastify'

// cấu hình MUI-dialog
import { ConfirmProvider } from 'material-ui-confirm'

// redux
import { store } from '~/redux/store'
import { Provider } from 'react-redux'

// cấu hình react router dom  với browser router
import { BrowserRouter } from 'react-router-dom'

// Cấu hình Redux-Persist
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
const persistor = persistStore(store)

// Kỹ thuật inject store vào file authorizeAxios
import { injectStore } from '~/utils/authorizeAxios'
injectStore(store)
 
// Cấu hình Socket-io phía client tại đây và export ra biến socketIoInstance
// https://socket.io/how-to-use-with-react
import { io } from 'socket.io-client'
import { API_ROOT } from '~/utils/constants'
export const socketIoInstance = io(API_ROOT)

function Root() {
  const { mode, systemMode } = useColorScheme()
  const effectiveMode = mode === 'system' ? systemMode : mode
  const toastTheme = effectiveMode === 'light' ? 'light' : 'dark'

  return (
    <>
      <GlobalStyles styles={{ a: { textDecoration: 'none' } }} />
      <CssBaseline />
      <App />
      <ToastContainer theme={toastTheme} position="bottom-right" closeOnClick={true}/>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <BrowserRouter>
        <CssVarsProvider theme={theme}>
          <ConfirmProvider 
            defaultOptions={{
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
            }}
          >
            <Root />
          </ConfirmProvider>
        </CssVarsProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
  </GoogleOAuthProvider>
)