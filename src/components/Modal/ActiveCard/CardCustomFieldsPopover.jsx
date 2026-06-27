import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentActive, addNewCustomField, updateCustomFieldOptimistic, deleteCustomFieldOptimistic } from '~/redux/activeBoard/activeBoardSlice'
import { createCustomFieldAPI, updateCustomFieldAPI, deleteCustomFieldAPI } from '~/apis'
import { toast } from 'sonner'
import { useConfirm } from 'material-ui-confirm'

function CardCustomFieldsPopover({ anchorEl, handleClose }) {
  const dispatch = useDispatch()
  const confirm = useConfirm()
  const board = useSelector(selectCurrentActive)
  const customFields = board?.customFields || []

  const [viewMode, setViewMode] = useState('LIST') // 'LIST', 'CREATE', 'EDIT'
  const [editingFieldId, setEditingFieldId] = useState(null)
  
  const [name, setName] = useState('')
  const [type, setType] = useState('text')
  const [options, setOptions] = useState([])
  const [showOnFront, setShowOnFront] = useState(false)

  const resetForm = () => {
    setName('')
    setType('text')
    setOptions([])
    setShowOnFront(false)
  }

  const handleOpenCreate = () => {
    resetForm()
    setViewMode('CREATE')
  }

  const handleOpenEdit = (field) => {
    setEditingFieldId(field._id)
    setName(field.name)
    setType(field.type)
    setOptions(field.options || [])
    setShowOnFront(field.showOnFront || false)
    setViewMode('EDIT')
  }

  const handleAddOption = () => {
    setOptions([...options, {
      _id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      text: ''
    }])
  }

  const handleOptionChange = (id, newText) => {
    setOptions(options.map(opt => opt._id === id ? { ...opt, text: newText } : opt))
  }

  const handleRemoveOption = (id) => {
    setOptions(options.filter(opt => opt._id !== id))
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Field name is required')
      return
    }

    if (type === 'dropdown' && options.length === 0) {
      toast.error('Dropdown requires at least one option')
      return
    }

    const fieldData = {
      name: name.trim(),
      type,
      options: type === 'dropdown' ? options.filter(o => o.text.trim() !== '') : [],
      showOnFront
    }

    try {
      if (viewMode === 'CREATE') {
        const createdField = await createCustomFieldAPI(board._id, fieldData)
        dispatch(addNewCustomField(createdField))
      } else if (viewMode === 'EDIT') {
        // Can only update name, options, and showOnFront for now, changing type is complex
        const updateData = { name: fieldData.name, options: fieldData.options, showOnFront: fieldData.showOnFront }
        await updateCustomFieldAPI(board._id, editingFieldId, updateData)
        dispatch(updateCustomFieldOptimistic({ _id: editingFieldId, ...updateData }))
      }
      setViewMode('LIST')
      resetForm()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleDelete = () => {
    confirm({
      title: 'Delete Custom Field?',
      description: 'Are you sure you want to delete this custom field? This will remove all values from all cards.',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel',
      confirmationButtonProps: { color: 'error', variant: 'outlined' }
    }).then(async () => {
      try {
        await deleteCustomFieldAPI(board._id, editingFieldId)
        dispatch(deleteCustomFieldOptimistic(editingFieldId))
        setViewMode('LIST')
      } catch (error) {
        // Handled
      }
    }).catch(() => {})
  }

  const open = Boolean(anchorEl)
  const id = open ? 'custom-fields-popover' : undefined

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={() => {
        handleClose()
        setViewMode('LIST')
      }}
      disableScrollLock={true}
      disableAutoFocus={true}
      disableEnforceFocus={true}
      transitionDuration={0}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      PaperProps={{
        sx: {
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
          border: (theme) => theme.palette.mode === 'dark' ? '1px solid #373e47' : 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          borderRadius: '8px',
          mt: 1
        }
      }}
    >
      <Box sx={{ width: 280, p: 2 }}>
        {viewMode !== 'LIST' ? (
          <>
            <Typography sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
              {viewMode === 'CREATE' ? 'Create Custom Field' : 'Edit Custom Field'}
            </Typography>
            
            <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 600 }}>Field Name</Typography>
            <TextField
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { 
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    transition: 'none !important' 
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#579DFF' : '#0c66e4',
                    borderWidth: '2px'
                  }
                }
              }}
            />

            <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 600 }}>Type</Typography>
            <Select
              fullWidth
              size="small"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={viewMode === 'EDIT'} // Cannot change type once created
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-notchedOutline': { 
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  transition: 'none !important' 
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#579DFF' : '#0c66e4',
                  borderWidth: '2px !important'
                }
              }}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
              <MenuItem value="dropdown">Dropdown</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>

            {type === 'dropdown' && (
              <Box sx={{ mb: 2, p: 1.5, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#f4f5f7', borderRadius: 1 }}>
                <Typography sx={{ mb: 1, fontSize: 13, fontWeight: 600 }}>Dropdown Options</Typography>
                <Stack spacing={1}>
                  {options.map((opt, index) => (
                    <Box key={opt._id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={`Option ${index + 1}`}
                        value={opt.text}
                        onChange={(e) => handleOptionChange(opt._id, e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { 
                              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                              transition: 'none !important' 
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: (theme) => theme.palette.mode === 'dark' ? '#579DFF' : '#0c66e4',
                              borderWidth: '2px'
                            }
                          }
                        }}
                      />
                      <IconButton size="small" color="error" onClick={() => handleRemoveOption(opt._id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    size="small"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddOption}
                    sx={{ justifyContent: 'flex-start', mt: 1 }}
                  >
                    Add Option
                  </Button>
                </Stack>
              </Box>
            )}

            <FormControlLabel 
              control={<Checkbox checked={showOnFront} onChange={(e) => setShowOnFront(e.target.checked)} size="small" />} 
              label={<Typography sx={{ fontSize: 13, fontWeight: 500 }}>Show on front of card</Typography>} 
              sx={{ mb: 2 }}
            />

            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="primary" fullWidth onClick={handleSave}>
                Save
              </Button>
              {viewMode === 'EDIT' && (
                <Button variant="contained" color="error" fullWidth onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </Stack>
            <Button 
              variant="outlined" 
              color="inherit" 
              fullWidth 
              onClick={() => setViewMode('LIST')} 
              sx={{ 
                mt: 1,
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#d0d7de',
                '&:hover': { 
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 0 1px rgba(255,255,255,0.3)' : '0 0 0 1px rgba(0,0,0,0.3)'
                }
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Typography sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>Custom Fields</Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {customFields.length === 0 ? (
                <Typography sx={{ fontSize: 14, color: 'text.secondary', textAlign: 'center', my: 2 }}>
                  No custom fields yet.
                </Typography>
              ) : (
                customFields.map(field => (
                  <Box key={field._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
                        flex: 1,
                        minHeight: 32,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.5,
                        fontWeight: 500
                      }}
                    >
                      <AutoFixHighOutlinedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" sx={{ wordBreak: 'break-word', fontWeight: 600 }}>{field.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>{field.type}</Typography>
                      </Box>
                    </Box>
                    <Box onClick={() => handleOpenEdit(field)} sx={{
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      p: 1, borderRadius: 1, '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300] }
                    }}>
                      <EditOutlinedIcon fontSize="small" />
                    </Box>
                  </Box>
                ))
              )}
            </Stack>
            <Button variant="contained" color="inherit" fullWidth onClick={handleOpenCreate} sx={{ boxShadow: 'none' }}>
              Create a new field
            </Button>
          </>
        )}
      </Box>
    </Popover>
  )
}

export default CardCustomFieldsPopover
