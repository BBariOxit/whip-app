import { experimental_extendTheme as extendTheme } from '@mui/material/styles'
import { cyan, deepOrange, orange, teal } from '@mui/material/colors'

// Create a theme instance.
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        // primary: {
        //   main: '#ff5252'
        // }
        primary: teal,
        secondary: deepOrange
      },
    },
    dark: {
      palette: {
        // primary: {
        //   main: '#000'
        // }
        primary: cyan,
        secondary: orange
      }
    }
  }
})

// ...other properties
export default theme