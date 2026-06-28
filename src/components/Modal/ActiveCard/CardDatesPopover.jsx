import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { StaticDateTimePicker } from '@mui/x-date-pickers/StaticDateTimePicker'
import dayjs from 'dayjs'

function CardDatesPopover({ anchorEl, handleClose, activeCard, onUpdateCardDates }) {
  // Lấy ngày cũ nếu có, không thì mặc định là ngày hôm nay
  const [selectedDate, setSelectedDate] = useState(
    activeCard?.dueDate ? dayjs(activeCard.dueDate) : dayjs()
  )

  const open = Boolean(anchorEl)
  const id = open ? 'dates-popover' : undefined

  const handleSave = () => {
    const timestamp = selectedDate.valueOf() // Chuyển sang timestamp (ms)
    onUpdateCardDates({
      dueDate: timestamp,
      dueComplete: false // Mới chọn ngày thì mặc định chưa xong
    })
    handleClose()
  }

  const handleRemove = () => {
    onUpdateCardDates({ dueDate: null, dueComplete: false })
    handleClose()
  }

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      disableScrollLock={true}
      disableAutoFocus={true}
      disableEnforceFocus={true}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid #373e47' : 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            borderRadius: '8px',
            mt: 1,
            overflow: 'hidden'
          }
        }
      }}
    >
      <Box sx={{ width: 'auto', minWidth: 320, p: 1.5 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            mb: 1.5
          }}>
            <StaticDateTimePicker
              value={selectedDate}
              onChange={(newValue) => {
                if (newValue) setSelectedDate(newValue)
              }}
              slotProps={{
                actionBar: { sx: { display: 'none' } }, // Ẩn action bar mặc định
                toolbar: { sx: { display: 'none' } } // Ẩn toolbar mặc định
              }}
              orientation="portrait"
              sx={{
                '& .MuiPickersLayout-root': { bgcolor: 'transparent' },
                '& .MuiPickersLayout-contentWrapper': { bgcolor: 'transparent' },
                '& .MuiTabs-root': { mb: 1, minHeight: '36px' },
                '& .MuiTab-root': { minHeight: '36px', textTransform: 'none', fontWeight: 600 },
                '& .MuiPickersCalendarHeader-root': { pt: 0, mt: 0 },
                '& .MuiPickersArrowSwitcher-root': { display: 'none' },
                '& .MuiDayCalendar-header': { justifyContent: 'space-between', px: 1 },
                '& .MuiDayCalendar-weekContainer': { justifyContent: 'space-between', px: 1 },
                '& .MuiPickersDay-root': { fontSize: '0.875rem' }
              }}
            />
          </Box>
        </LocalizationProvider>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSave}
            disableElevation
            sx={{ 
              textTransform: 'none', 
              fontWeight: 500, 
              borderRadius: 1,
              py: 0.5,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleRemove}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 500, 
              borderRadius: 1,
              py: 0.5,
              color: 'text.primary',
              borderColor: (theme) => theme.palette.mode === 'dark' ? '#373e47' : '#d0d7de',
              '&:hover': {
                color: 'error.main',
                borderColor: 'error.main',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'error.50'
              }
            }}
          >
            Remove
          </Button>
        </Stack>
      </Box>
    </Popover>
  )
}

export default CardDatesPopover

