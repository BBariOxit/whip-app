import React from 'react'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import FilterListIcon from '@mui/icons-material/FilterList'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import Divider from '@mui/material/Divider'

const scrollbarStyle = {
  '&::-webkit-scrollbar': { width: '6px' },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-thumb': { background: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#bdc3c7', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb:hover': { background: (theme) => theme.palette.mode === 'dark' ? '#8b949e' : '#95a5a6' }
}

function BoardFiltersPopover({ anchorEl, handleClose, board, filters, setFilters }) {
  const isOpen = Boolean(anchorEl)

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, searchKey: e.target.value }))
  }

  const handleToggleMember = (memberId) => {
    setFilters(prev => {
      const isSelected = prev.memberIds.includes(memberId)
      return {
        ...prev,
        memberIds: isSelected
          ? prev.memberIds.filter(id => id !== memberId)
          : [...prev.memberIds, memberId]
      }
    })
  }

  const handleToggleLabel = (labelId) => {
    setFilters(prev => {
      const isSelected = prev.labelIds.includes(labelId)
      return {
        ...prev,
        labelIds: isSelected
          ? prev.labelIds.filter(id => id !== labelId)
          : [...prev.labelIds, labelId]
      }
    })
  }

  const handleClearFilters = () => {
    setFilters({ searchKey: '', memberIds: [], labelIds: [] })
  }

  const activeFilterCount = (filters.searchKey ? 1 : 0) + filters.memberIds.length + filters.labelIds.length

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={handleClose}
      disableScrollLock={true}
      disableAutoFocus={true}
      disableEnforceFocus={true}
      transitionDuration={0}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      sx={{ mt: 1 }}
    >
      <Box sx={{ width: 320, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Filters</Typography>
          </Box>
          {activeFilterCount > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {activeFilterCount} active
            </Typography>
          )}
        </Box>

        {/* Keyword Search */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>Keyword</Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Enter a keyword..."
            value={filters.searchKey}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Divider />

        {/* Members */}
        {!!board?.FE_allUser?.length && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>Members</Typography>
            <Box sx={{ 
              display: 'flex', flexWrap: 'wrap', gap: 1,
              maxHeight: 120, overflowY: 'auto',
              ...scrollbarStyle 
            }}>
              {board.FE_allUser.map(user => {
                const isSelected = filters.memberIds.includes(user._id)
                return (
                  <Tooltip title={user.displayName} key={user._id}>
                    <Box
                      onClick={() => handleToggleMember(user._id)}
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease',
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'transparent',
                        '&:hover': {
                          borderColor: isSelected 
                            ? 'primary.main' 
                            : (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
                        }
                      }}
                    >
                      <Avatar src={user.avatar} sx={{ width: 30, height: 30 }} />
                      {isSelected && (
                        <Box sx={{
                          position: 'absolute', bottom: 0, right: 0,
                          bgcolor: 'primary.main', color: 'white',
                          borderRadius: '50%', width: 14, height: 14,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <CheckIcon sx={{ fontSize: 10 }} />
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                )
              })}
            </Box>
          </Box>
        )}

        {!!board?.FE_allUser?.length && <Divider />}

        {/* Labels */}
        {!!board?.labels?.length && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>Labels</Typography>
            <Box sx={{ 
              display: 'flex', flexDirection: 'column', gap: 0.5,
              maxHeight: 200, overflowY: 'auto',
              ...scrollbarStyle
            }}>
              {board.labels.map(label => {
                const isSelected = filters.labelIds.includes(label._id)
                return (
                  <Box
                    key={label._id}
                    onClick={() => handleToggleLabel(label._id)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      cursor: 'pointer',
                      borderRadius: 1,
                      px: 1, py: 0.5,
                      bgcolor: isSelected ? (theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') : 'transparent',
                      '&:hover': {
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <Box sx={{
                      width: 16, height: 16, borderRadius: '4px',
                      bgcolor: label.color, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isSelected && <CheckIcon sx={{ color: 'white', fontSize: 12, fontWeight: 'bold' }} />}
                    </Box>
                    <Typography variant="body2" sx={{
                      flex: 1,
                      color: isSelected ? 'text.primary' : 'text.secondary',
                      fontWeight: isSelected ? 600 : 400,
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      width: '100%'
                    }}>
                      {label.title}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </Box>
        )}

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            startIcon={<FilterAltOffIcon />}
            onClick={handleClearFilters}
            sx={{ 
              mt: 1, 
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#d0d7de',
              '&:hover': { 
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 0 1px rgba(255,255,255,0.3)' : '0 0 0 1px rgba(0,0,0,0.3)'
              } 
            }}
          >
            Clear all filters
          </Button>
        )}
      </Box>
    </Popover>
  )
}

export default BoardFiltersPopover
