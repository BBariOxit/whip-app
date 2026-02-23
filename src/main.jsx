// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '~/App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import { Experimental_CssVarsProvider as CssVarsProvider, useColorScheme } from '@mui/material/styles'
import theme from '~/theme'

// cấu hình react toastify
import { ToastContainer } from 'react-toastify'

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
    <Root />
  </CssVarsProvider>
  // {/* </React.StrictMode> */}
)
