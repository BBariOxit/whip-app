import {
  useColorScheme
} from '@mui/material/styles'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'

function ModeSelect() {
  const { mode, setMode } = useColorScheme()
  const handleChange = (event) => {
    // setAge(event.target.value)
    const selectedMode = event.target.value
    setMode(selectedMode)
  }

  return (
    <Box>
      <FormControl size='small' sx={{ minWidth: 120 }}>
        <InputLabel
          id= "label-select-dark-light-mode"
          sx={{
            color: '#B6C2CF',
            '&.Mui-focused': { color: '#B6C2CF' }
          }}
        >mode</InputLabel>
        <Select
          labelId="label-select-dark-light-mode"
          id="select-dark-light-mode"
          value={mode}
          label="mode"
          onChange={handleChange}
          sx={{
            color: '#B6C2CF',
            '.MuiOutlinedInput-notchedOutline': { color: '#B6C2CF' },
            '&:hover .MuiOutlinedInput-notchedOutline': { color: '#B6C2CF' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { color: '#B6C2CF' },
            '.MuiSvgIcon-root': { color: '#B6C2CF' }
          }}
        >
          <MenuItem value="light">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LightModeIcon fontSize='small'/> Light
            </Box>
          </MenuItem>
          <MenuItem value="dark">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DarkModeOutlinedIcon fontSize='small'/> Dark
            </Box>
          </MenuItem>
          <MenuItem value="system">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsBrightnessIcon fontSize='small'/> System
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default ModeSelect