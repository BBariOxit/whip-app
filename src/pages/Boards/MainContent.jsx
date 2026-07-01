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
  currentUser,
  workspaces,
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

  const getUserRole = () => {
    if (currentView.type === 'guest') return 'guest'
    if (currentView.type !== 'workspace' || !currentUser) return 'owner'
    const currentWorkspace = workspaces.find(w => w._id === currentView.id)
    if (!currentWorkspace) return 'member'
    const member = currentWorkspace.members?.find(m => m.userId === currentUser._id)
    return member ? member.role : 'member'
  }
  const userRole = getUserRole()
  const canManage = userRole === 'owner' || userRole === 'admin'

  return (
    <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', gap: 2, mb: currentView.type === 'workspace' ? 1 : 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          letterSpacing: '-0.5px',
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          {getTitle()}
        </Typography>
      </Box>

      {/* TABS (Chỉ hiển thị nếu là Workspace) */}
      {currentView.type === 'workspace' && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ minHeight: '40px' }}>
            <Tab label="BOARDS" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '14px', minHeight: '40px', py: 1 }} />
            <Tab label="MEMBERS" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '14px', minHeight: '40px', py: 1 }} />
            <Tab label="SETTINGS" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '14px', minHeight: '40px', py: 1 }} />
          </Tabs>
          {canManage && (
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => setIsInviteModalOpen(true)}
              sx={{ 
                mb: 1,
                color: 'text.primary',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff',
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'divider',
                borderWidth: '2px',
                '&:hover': { 
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)', 
                  borderWidth: '2px',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff'
                }
              }}
            >
              Invite
            </Button>
          )}
        </Box>
      )}

      {/* BOARDS LIST (Personal, Workspace, or Guest) */}
      {(currentView.type === 'personal' || currentView.type === 'guest' || (currentView.type === 'workspace' && activeTab === 0)) && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

              {currentView.type !== 'templates' && currentView.type !== 'home' && currentView.type !== 'guest' && boards?.length > 0 && canManage && (
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

          <Box sx={{ position: 'relative', minHeight: '200px' }}>
            {isFetchingBoards && (
              <Box sx={{ 
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)', 
                zIndex: 10,
                display: 'flex', justifyContent: 'center', pt: 8
              }}>
                <PageLoadingSpinner caption="Loading Boards..." />
              </Box>
            )}

            {boards?.length === 0 && !isFetchingBoards && (
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
                  {currentView.type === 'guest' 
                    ? "You don't have any boards shared with you as a guest yet." 
                    : (currentView.type === 'personal' 
                        ? "You don't have any personal boards yet." 
                        : "This workspace doesn't have any boards yet.")}
                </Typography>
                {currentView.type !== 'guest' && (
                  <Button 
                    onClick={onOpenCreateBoard}
                    variant="contained" 
                    size="large"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: '8px', textTransform: 'none', px: 4, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                  >
                    Create a new board
                  </Button>
                )}
              </Box>
            )}

            {boards?.length > 0 &&
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: 2.5,
                opacity: isFetchingBoards ? 0.5 : 1,
                transition: 'opacity 0.2s',
                pointerEvents: isFetchingBoards ? 'none' : 'auto'
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
                    canManage={canManage}
                    currentUser={currentUser}
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
                justifyContent: 'center',
                opacity: isFetchingBoards ? 0.5 : 1,
                pointerEvents: isFetchingBoards ? 'none' : 'auto'
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
          </Box>
        </Box>
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
