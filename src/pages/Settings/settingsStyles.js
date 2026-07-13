import { alpha } from '@mui/material/styles'

export const settingsFieldSx = (theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.035) : '#f8fafc',
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px !important',
      borderColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.14) : '#cbd5e1'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px !important',
      borderColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.28) : '#94a3b8'
    },
    '&.Mui-focused': {
      bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.045) : '#fff',
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px !important',
      borderColor: theme.palette.primary.main
    },
    '&.Mui-disabled': {
      bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.025) : '#eef2f7'
    }
  },
  '& .MuiInputLabel-root': {
    color: 'text.secondary',
    fontWeight: 600
  },
  '& .MuiFormHelperText-root': {
    mx: 0,
    mt: 1,
    color: 'text.secondary'
  }
})

export const settingsSelectSx = (theme) => ({
  minWidth: { xs: '100%', sm: 220 },
  bgcolor: theme.palette.mode === 'dark' ? '#161b22' : '#f8fafc',
  borderRadius: '8px',
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.14) : '#cbd5e1',
    borderWidth: '1px !important'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.28) : '#94a3b8',
    borderWidth: '1px !important'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: '1px !important'
  }
})
