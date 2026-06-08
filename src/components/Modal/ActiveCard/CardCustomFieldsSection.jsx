import React, { useState, useEffect, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useSelector } from 'react-redux'
import { selectCurrentActive } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'

const DEBOUNCE_MS = 500

function CardCustomFieldsSection({ onUpdateCardCustomFields }) {
  const board = useSelector(selectCurrentActive)
  const activeCard = useSelector(selectCurrentActiveCard)
  
  const boardFields = board?.customFields || []
  const cardValues = activeCard?.customFieldValues || []

  // Local state to allow instant typing without lag
  const [localValues, setLocalValues] = useState({})
  const debounceTimers = useRef({})

  // Sync local state when card data changes from outside (e.g. first load, switching cards)
  useEffect(() => {
    const valuesMap = {}
    cardValues.forEach(v => {
      valuesMap[v.customFieldId] = v.value
    })
    setLocalValues(valuesMap)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCard?._id])

  const getFieldValue = (fieldId) => {
    if (localValues[fieldId] !== undefined) return localValues[fieldId]
    const cardVal = cardValues.find(v => v.customFieldId === fieldId)
    return cardVal ? cardVal.value : ''
  }

  // Debounced API call for text/number/date
  const handleDebouncedChange = useCallback((fieldId, newValue) => {
    // Update local state immediately for responsive typing
    setLocalValues(prev => ({ ...prev, [fieldId]: newValue }))

    // Clear previous timer for this field
    if (debounceTimers.current[fieldId]) {
      clearTimeout(debounceTimers.current[fieldId])
    }

    // Set new timer — only call API after user stops typing
    debounceTimers.current[fieldId] = setTimeout(() => {
      const currentCardValues = activeCard?.customFieldValues || []
      const newValues = [...currentCardValues]
      const index = newValues.findIndex(v => v.customFieldId === fieldId)
      if (index > -1) {
        newValues[index] = { ...newValues[index], value: newValue }
      } else {
        newValues.push({ customFieldId: fieldId, value: newValue })
      }
      onUpdateCardCustomFields(newValues)
    }, DEBOUNCE_MS)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCard?._id, onUpdateCardCustomFields])

  // Instant API call for checkbox/dropdown (single-click actions)
  const handleInstantChange = useCallback((fieldId, newValue) => {
    setLocalValues(prev => ({ ...prev, [fieldId]: newValue }))

    const currentCardValues = activeCard?.customFieldValues || []
    const newValues = [...currentCardValues]
    const index = newValues.findIndex(v => v.customFieldId === fieldId)
    if (index > -1) {
      newValues[index] = { ...newValues[index], value: newValue }
    } else {
      newValues.push({ customFieldId: fieldId, value: newValue })
    }
    onUpdateCardCustomFields(newValues)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCard?._id, onUpdateCardCustomFields])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout)
    }
  }, [])

  if (boardFields.length === 0) return null

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Custom Fields</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {boardFields.map(field => {
          const value = getFieldValue(field._id)

          return (
            <Box key={field._id} sx={{ flex: '1 1 45%', minWidth: '200px' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                {field.name}
              </Typography>
              
              {field.type === 'text' && (
                <TextField 
                  fullWidth 
                  size="small" 
                  value={value} 
                  onChange={(e) => handleDebouncedChange(field._id, e.target.value)} 
                  placeholder={`Enter ${field.name}`}
                  sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f' }}
                />
              )}
              
              {field.type === 'number' && (
                <TextField 
                  fullWidth 
                  size="small" 
                  type="number"
                  value={value} 
                  onChange={(e) => handleDebouncedChange(field._id, e.target.value)} 
                  placeholder={`Enter number`}
                  sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f' }}
                />
              )}

              {field.type === 'date' && (
                <TextField 
                  fullWidth 
                  size="small" 
                  type="date"
                  value={value} 
                  onChange={(e) => handleDebouncedChange(field._id, e.target.value)} 
                  sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f' }}
                />
              )}
              
              {field.type === 'checkbox' && (
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={Boolean(value)} 
                      onChange={(e) => handleInstantChange(field._id, e.target.checked)} 
                      size="small"
                    />
                  } 
                  label={field.name} 
                />
              )}
              
              {field.type === 'dropdown' && (
                <Select 
                  fullWidth
                  size="small"
                  value={value} 
                  onChange={(e) => handleInstantChange(field._id, e.target.value)}
                  displayEmpty
                  sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f' }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {field.options?.map(opt => (
                    <MenuItem key={opt._id} value={opt._id}>{opt.text}</MenuItem>
                  ))}
                </Select>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default CardCustomFieldsSection
