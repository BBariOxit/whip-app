import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import LinearProgress from '@mui/material/LinearProgress'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'

/**
 * Component render toàn bộ checklists của 1 card.
 * Props:
 *  - checklists: mảng checklists từ activeCard
 *  - onUpdateChecklists: callback nhận mảng checklists mới (đã mutate)
 */
function CardChecklistSection({ checklists = [], onUpdateChecklists, isReadOnly }) {
  const [addingItemForChecklistId, setAddingItemForChecklistId] = useState(null)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [editingChecklistId, setEditingChecklistId] = useState(null)
  const [editingChecklistTitle, setEditingChecklistTitle] = useState('')
  const [editingItemId, setEditingItemId] = useState(null)
  const [editingItemTitle, setEditingItemTitle] = useState('')

  if (!checklists?.length) return null

  // Helper: tạo _id đơn giản
  const generateId = () => {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  // ===== TOGGLE ITEM =====
  const handleToggleItem = (checklistId, itemId) => {
    const newChecklists = checklists.map(cl => {
      if (cl._id !== checklistId) return cl
      return {
        ...cl,
        items: cl.items.map(item => {
          if (item._id !== itemId) return item
          return { ...item, isCompleted: !item.isCompleted }
        })
      }
    })
    onUpdateChecklists(newChecklists)
  }

  // ===== ADD ITEM =====
  const handleAddItem = (checklistId) => {
    const trimmed = newItemTitle.trim()
    if (!trimmed) return

    const newItem = {
      _id: generateId(),
      title: trimmed,
      isCompleted: false
    }
    const newChecklists = checklists.map(cl => {
      if (cl._id !== checklistId) return cl
      return { ...cl, items: [...cl.items, newItem] }
    })
    onUpdateChecklists(newChecklists)
    setNewItemTitle('')
  }

  // ===== DELETE ITEM =====
  const handleDeleteItem = (checklistId, itemId) => {
    const newChecklists = checklists.map(cl => {
      if (cl._id !== checklistId) return cl
      return { ...cl, items: cl.items.filter(item => item._id !== itemId) }
    })
    onUpdateChecklists(newChecklists)
  }

  // ===== DELETE CHECKLIST =====
  const handleDeleteChecklist = (checklistId) => {
    const newChecklists = checklists.filter(cl => cl._id !== checklistId)
    onUpdateChecklists(newChecklists)
  }

  // ===== EDIT CHECKLIST TITLE =====
  const handleSaveChecklistTitle = (checklistId) => {
    const trimmed = editingChecklistTitle.trim()
    if (!trimmed) {
      setEditingChecklistId(null)
      return
    }
    const newChecklists = checklists.map(cl => {
      if (cl._id !== checklistId) return cl
      return { ...cl, title: trimmed }
    })
    onUpdateChecklists(newChecklists)
    setEditingChecklistId(null)
  }

  // ===== EDIT ITEM TITLE =====
  const handleSaveItemTitle = (checklistId, itemId) => {
    const trimmed = editingItemTitle.trim()
    if (!trimmed) {
      setEditingItemId(null)
      return
    }
    const newChecklists = checklists.map(cl => {
      if (cl._id !== checklistId) return cl
      return {
        ...cl,
        items: cl.items.map(item => {
          if (item._id !== itemId) return item
          return { ...item, title: trimmed }
        })
      }
    })
    onUpdateChecklists(newChecklists)
    setEditingItemId(null)
  }

  return (
    <Box>
      {checklists.map(checklist => {
        const totalItems = checklist.items?.length || 0
        const completedItems = checklist.items?.filter(i => i.isCompleted).length || 0
        const progressPercentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)
        const isAllDone = progressPercentage === 100 && totalItems > 0

        return (
          <Box key={checklist._id} sx={{ mb: 3 }}>
            {/* ===== CHECKLIST HEADER ===== */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                <TaskAltOutlinedIcon />
                {editingChecklistId === checklist._id ? (
                  <TextField
                    size="small"
                    value={editingChecklistTitle}
                    onChange={(e) => setEditingChecklistTitle(e.target.value)}
                    onBlur={() => handleSaveChecklistTitle(checklist._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSaveChecklistTitle(checklist._id)
                      }
                      if (e.key === 'Escape') setEditingChecklistId(null)
                    }}
                    autoFocus
                    sx={{ flex: 1 }}
                  />
                ) : (
                  <Typography
                    variant="span"
                    sx={{
                      fontWeight: '600',
                      fontSize: '20px',
                      cursor: isReadOnly ? 'default' : 'pointer',
                      '&:hover': { opacity: isReadOnly ? 1 : 0.7 }
                    }}
                    onClick={() => {
                      if (!isReadOnly) {
                        setEditingChecklistId(checklist._id)
                        setEditingChecklistTitle(checklist.title)
                      }
                    }}
                  >
                    {checklist.title}
                  </Typography>
                )}
              </Box>
              {!isReadOnly && <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => handleDeleteChecklist(checklist._id)}
                sx={{
                  ml: 1,
                  minWidth: 'unset',
                  fontSize: '13px',
                  textTransform: 'none',
                  px: 1.5
                }}
              >
                Delete
              </Button>}
            </Box>

            {/* ===== PROGRESS BAR ===== */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, pl: '36px' }}>
              <Typography
                variant="body2"
                sx={{
                  minWidth: 32,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isAllDone ? 'success.main' : 'text.secondary'
                }}
              >
                {progressPercentage}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                color={isAllDone ? 'success' : 'primary'}
                sx={{
                  flexGrow: 1,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    transition: 'transform 0.4s ease, background-color 0.3s ease'
                  }
                }}
              />
            </Box>

            {/* ===== CHECKLIST ITEMS ===== */}
            <Box sx={{ pl: '36px' }}>
              {checklist.items?.map(item => (
                <Box
                  key={item._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.5,
                    py: 0.5,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
                    },
                    '&:hover .delete-item-btn': { opacity: 1 }
                  }}
                >
                  <Checkbox
                    disabled={isReadOnly}
                    checked={!!item.isCompleted}
                    onChange={() => handleToggleItem(checklist._id, item._id)}
                    size="small"
                    sx={{ p: 0.5, mt: '2px' }}
                  />
                  {editingItemId === item._id ? (
                    <TextField
                      size="small"
                      value={editingItemTitle}
                      onChange={(e) => setEditingItemTitle(e.target.value)}
                      onBlur={() => handleSaveItemTitle(checklist._id, item._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSaveItemTitle(checklist._id, item._id)
                        }
                        if (e.key === 'Escape') setEditingItemId(null)
                      }}
                      autoFocus
                      fullWidth
                      sx={{ flex: 1 }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        flex: 1,
                        pt: '5px',
                        fontSize: '14px',
                        cursor: isReadOnly ? 'default' : 'pointer',
                        textDecoration: item.isCompleted ? 'line-through' : 'none',
                        color: item.isCompleted ? 'text.disabled' : 'text.primary',
                        transition: 'all 0.2s ease',
                        wordBreak: 'break-word',
                        '&:hover': { opacity: isReadOnly ? 1 : 0.7 }
                      }}
                      onClick={() => {
                        if (!isReadOnly) {
                          setEditingItemId(item._id)
                          setEditingItemTitle(item.title)
                        }
                      }}
                    >
                      {item.title}
                    </Typography>
                  )}
                  {!isReadOnly && <IconButton
                    className="delete-item-btn"
                    size="small"
                    onClick={() => handleDeleteItem(checklist._id, item._id)}
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      mt: '2px',
                      color: 'text.secondary',
                      '&:hover': { color: 'error.main' }
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>}
                </Box>
              ))}

              {/* ===== ADD ITEM ===== */}
              <Collapse in={addingItemForChecklistId === checklist._id}>
                <Box sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add an item"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddItem(checklist._id)
                      }
                      if (e.key === 'Escape') {
                        setAddingItemForChecklistId(null)
                        setNewItemTitle('')
                      }
                    }}
                    autoFocus
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      onClick={() => handleAddItem(checklist._id)}
                      disabled={!newItemTitle.trim()}
                      sx={{ textTransform: 'none' }}
                    >
                      Add
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setAddingItemForChecklistId(null)
                        setNewItemTitle('')
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Collapse>

              {addingItemForChecklistId !== checklist._id && !isReadOnly && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setAddingItemForChecklistId(checklist._id)
                    setNewItemTitle('')
                  }}
                  sx={{
                    mt: 1,
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                    }
                  }}
                >
                  Add an item
                </Button>
              )}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export default CardChecklistSection
