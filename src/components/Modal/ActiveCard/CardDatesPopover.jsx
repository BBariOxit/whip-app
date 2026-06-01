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
    >
      <Box sx={{ width: 340, p: 2 }}>
        <Typography sx={{ fontWeight: 600, textAlign: 'center', mb: 1 }}>
          Dates
        </Typography>

        <Divider sx={{ mb: 1 }} />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              '& .MuiPickersLayout-root': { minWidth: 'unset' },
              '& .MuiDateCalendar-root': { width: '100%' },
              width: '100%',
              minWidth: 'unset'
            }}
          />
        </LocalizationProvider>

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSave}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={handleRemove}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Remove
          </Button>
        </Stack>
      </Box>
    </Popover>
  )
}

export default CardDatesPopover
