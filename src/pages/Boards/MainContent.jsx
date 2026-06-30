import { useState } from 'react'
import { Box, Typography, Button, Pagination, PaginationItem, Tabs, Tab, TextField, Select, MenuItem, InputAdornment } from '@mui/material'
import ChecklistIcon from '@mui/icons-material/Checklist'
import DeleteIcon from '@mui/icons-material/Delete'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import AddIcon from '@mui/icons-material/Add'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { Link } from 'react-router-dom'
import { BoardCard } from './BoardCard'
import { TemplateCard } from './TemplateCard'
import PageLoadingSpinner from '~/components/Loading/pageLoadingSpinner'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { WorkspaceMembersTable } from './WorkspaceMembersTable'
import { InviteWorkspaceMemberModal } from '~/components/Modal/InviteWorkspaceMemberModal/InviteWorkspaceMemberModal'
import { useDebounce } from '~/customHooks/useDebounce'

export const MainContent = ({
  currentView,
  boards,
  isFetchingBoards,
  templates,
  totalBoards,
  page,
  isBulkMode,
  setIsBulkMode,
  selectedIds,
  setSelectedIds,
  handleSelectCard,
  handleBulkDelete,
  onBoardDeleted,
  onBoardUpdated,
  onOpenCreateBoard
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [refreshMembersKey, setRefreshMembersKey] = useState(0)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)


  const getTitle = () => {
    if (currentView.title) return currentView.title
    switch (currentView.type) {
      case 'home': return 'Home'
      case 'templates': return 'Templates'
      case 'personal': return 'Your Personal Boards'
      default: return 'Boards'
    }
  }

  return (
    <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', gap: 2, mb: currentView.type === 'workspace' ? 1 : 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: 'text.primary',
          display: 'inline-block',
          m: 0
        }}>
          {getTitle()}
        </Typography>
      </Box>

      {/* WORKSPACE TABS */}
      {currentView.type === 'workspace' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', borderBottom: 1, borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: '#58a6ff' } }}
            sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#8b949e' : 'text.secondary' }}
          >
            <Tab label="Boards" />
            <Tab label="Members" />
            <Tab label="Settings" />
          </Tabs>

          <Button 
            startIcon={<PersonAddIcon fontSize="small" />} 
            onClick={() => setIsInviteModalOpen(true)}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 500,
              fontSize: '14px',
              color: (theme) => theme.palette.mode === 'dark' ? '#8b949e' : 'text.secondary',
              bgcolor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              px: 1.5,
              height: '32px',
              '&:hover': { 
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#334155' : 'rgba(0,0,0,0.05)'
              }
            }}
          >
            Invite
          </Button>
        </Box>
      )}


      {/* BOARDS LIST (Personal or Workspace) */}
      {(currentView.type === 'personal' || (currentView.type === 'workspace' && activeTab === 0)) && (
        <>
          {/* SUB-TOOLBAR (Search, Filter, Select) */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: currentView.type === 'workspace' ? 2 : 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search boards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  width: '300px',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff', 
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    height: '36px',
                    '& fieldset': { 
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'divider',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': { 
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                      borderWidth: '2px'
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                      borderWidth: '2px'
                    },
                  }
                }}
              />
              <Select
                size="small"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ 
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff', 
                  minWidth: '150px',
                  height: '36px',
                  fontSize: '0.875rem',
                  '.MuiOutlinedInput-notchedOutline': { 
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'divider',
                    borderWidth: '2px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': { 
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                    borderWidth: '2px'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                    borderWidth: '2px'
                  },
                }}
              >
                <MenuItem value="recent">Most recent</MenuItem>
                <MenuItem value="a-z">Name A-Z</MenuItem>
                <MenuItem value="z-a">Name Z-A</MenuItem>
              </Select>

              {currentView.type !== 'templates' && currentView.type !== 'home' && boards?.length > 0 && (
                <Button 
                  variant={isBulkMode ? "contained" : "outlined"} 
                  color={isBulkMode ? "error" : "primary"}
                  size="small"
                  startIcon={isBulkMode ? <CloseIcon fontSize="small" /> : <ChecklistIcon fontSize="small" />}
                  onClick={() => {
                    setIsBulkMode(!isBulkMode)
                    setSelectedIds([])
                  }}
                  sx={{ 
                    borderRadius: '8px', 
                    textTransform: 'none',
                    fontWeight: 600,
                    height: '36px',
                    px: 2,
                    color: isBulkMode ? '#fff' : 'text.primary',
                    bgcolor: isBulkMode ? undefined : ((theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff'),
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'divider',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                      borderWidth: '2px',
                      bgcolor: isBulkMode ? undefined : ((theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff')
                    }
                  }}
                >
                  {isBulkMode ? "Cancel" : "Select"}
                </Button>
              )}
            </Box>
          </Box>

          {/* BULK ACTION BAR */}
          {isBulkMode && selectedIds.length > 0 && (
            <Box sx={{ p: 2, mb: 3, bgcolor: '#1f6feb', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{selectedIds.length} board(s) selected</Typography>
              <Box>
                <Button sx={{ color: '#fff', mr: 2, textTransform: 'none', fontWeight: 500, fontSize: '0.875rem' }}>Move to Workspace</Button>
                <Button 
                  color="error" 
                  variant="contained" 
                  size="small"
                  onClick={handleBulkDelete}
                  startIcon={<DeleteIcon fontSize="small" />}
                  sx={{ textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                >
                  Delete selected
                </Button>
              </Box>
            </Box>
          )}

          {isFetchingBoards ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
               <PageLoadingSpinner caption="Loading Boards..." />
            </Box>
          ) : (
            <>
              {boards?.length === 0 &&
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 10, 
                  px: 3,
                  borderRadius: '16px',
                  border: '1px dashed',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                }}>
                  <InboxOutlinedIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                    This workspace doesn't have any boards yet.
                  </Typography>
                  <Button 
                    onClick={onOpenCreateBoard}
                    variant="contained" 
                    size="large"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: '8px', textTransform: 'none', px: 4, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                  >
                    Create a new board
                  </Button>
                </Box>
              }

              {boards?.length > 0 &&
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: 2.5 
                }}>
                  {boards.map((b, index) =>
                    <BoardCard 
                      key={b._id} 
                      board={b} 
                      index={index}
                      onBoardDeleted={onBoardDeleted}
                      onBoardUpdated={onBoardUpdated}
                      isBulkMode={isBulkMode}
                      isSelected={selectedIds.includes(b._id)}
                      onSelect={() => handleSelectCard(b._id)}
                    />
                  )}
                </Box>
              }

              {(totalBoards > 0) &&
                <Box sx={{ 
                  mt: currentView.type === 'workspace' ? 3 : 6, 
                  mb: currentView.type === 'workspace' ? 4 : 6, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Pagination
                    size="large"
                    color="primary"
                    showFirstButton
                    showLastButton
                    count={Math.ceil(totalBoards / DEFAULT_ITEMS_PER_PAGE)}
                    page={page}
                    renderItem={(item) => (
                      <PaginationItem
                        component={Link}
                        to={`/boards?${new URLSearchParams({
                          ...(item.page !== DEFAULT_PAGE && { page: item.page }),
                          ...(currentView.type === 'workspace' && currentView.id && { workspaceId: currentView.id })
                        }).toString()}`}
                        {...item}
                        sx={{
                          borderRadius: '8px'
                        }}
                      />
                    )}
                  />
                </Box>
              }
            </>
          )}
        </>
      )}

      {/* MEMBERS LIST (Workspace Only) */}
      {currentView.type === 'workspace' && activeTab === 1 && (
        <WorkspaceMembersTable key={`members-${refreshMembersKey}`} workspaceId={currentView.id} />
      )}

      {/* SETTINGS (Workspace Only) */}
      {currentView.type === 'workspace' && activeTab === 2 && (
        <Box sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px dashed', borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" color="text.primary">Workspace Settings</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Update name, upload logo, or delete workspace.</Typography>
        </Box>
      )}

      {/* TEMPLATES LIST */}
      {currentView.type === 'templates' && (
        <>
          {!templates ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
               <PageLoadingSpinner caption="Loading Templates..." />
            </Box>
          ) : templates.length === 0 ? (
            <Typography>No templates available.</Typography>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: 2.5 
            }}>
              {templates.map((t, index) =>
                <TemplateCard 
                  key={t._id} 
                  template={t} 
                  index={index}
                />
              )}
            </Box>
          )}
        </>
      )}
      
      {/* HOME LIST */}
      {currentView.type === 'home' && (
        <Box>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            Welcome to the home dashboard! Select a section from the sidebar to begin.
          </Typography>
        </Box>
      )}

      <InviteWorkspaceMemberModal
        open={isInviteModalOpen}
        handleClose={() => setIsInviteModalOpen(false)}
        workspaceId={currentView.id}
        onMemberInvited={() => setRefreshMembersKey(prev => prev + 1)}
      />
    </Box>
  )
}
