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
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            backgroundImage: 'none'
          }
        }
      }}
    >
      <Box sx={{ width: 'auto', minWidth: 340, p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center', mb: 1.5, fontSize: '1.05rem', letterSpacing: '0.3px' }}>
          Date & Time
        </Typography>

        <Divider sx={{ mb: 2, opacity: 0.6 }} />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ 
            bgcolor: 'background.default', 
            borderRadius: 2, 
            p: 1, 
            mb: 2,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'center'
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
              sx={{
                '& .MuiPickersLayout-root': { minWidth: 'unset', bgcolor: 'transparent' },
                '& .MuiPickersLayout-contentWrapper': { bgcolor: 'transparent', width: 320 },
                '& .MuiTabs-root': { mb: 1, minHeight: '36px' },
                '& .MuiTab-root': { minHeight: '36px', textTransform: 'none', fontWeight: 600 },
                '& .MuiPickersCalendarHeader-root': { pt: 0, mt: 0 },
                '& .MuiPickersArrowSwitcher-root': { p: 0 },
                '& .MuiDayCalendar-header': { justifyContent: 'space-between', px: 1 },
                '& .MuiDayCalendar-weekContainer': { justifyContent: 'space-between', px: 1 },
                '& .MuiPickersDay-root': { fontSize: '0.875rem' },
                '& .MuiClock-root': { margin: '0 auto' }
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
              fontWeight: 600, 
              borderRadius: 2,
              py: 1,
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
              }
            }}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleRemove}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600, 
              borderRadius: 2,
              py: 1,
              borderWidth: '2px',
              transition: 'all 0.2s',
              '&:hover': {
                borderWidth: '2px',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                bgcolor: 'error.50'
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

