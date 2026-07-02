import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Button, Pagination, PaginationItem, Tabs, Tab, TextField, Select, MenuItem, InputAdornment, Skeleton } from '@mui/material'
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
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
import { WorkspaceMembersTable } from './WorkspaceMembersTable'
import { InviteWorkspaceMemberModal } from '~/components/Modal/InviteWorkspaceMemberModal/InviteWorkspaceMemberModal'
import { useDebounce } from '~/customHooks/useDebounce'
import { useConfirm } from 'material-ui-confirm'
import { leaveWorkspaceAPI } from '~/apis'
import { toast } from 'sonner'

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
  onOpenCreateBoard,
  onOpenDeleteWorkspace,
  onLeaveWorkspace
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [refreshMembersKey, setRefreshMembersKey] = useState(0)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const confirm = useConfirm()
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    setActiveTab(0)
  }, [currentView.id])


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
  const currentWorkspace = workspaces.find(w => w._id === currentView.id)

  const handleLeaveWorkspace = () => {
    confirm({
      title: 'Leave Workspace',
      description: `You are about to leave the workspace "${currentWorkspace?.title}". Type "LEAVE ${currentWorkspace?.title}" to confirm.`,
      confirmationText: 'Confirm Leave',
      cancellationText: 'Cancel',
      confirmationKeyword: `LEAVE ${currentWorkspace?.title}`,
      buttonOrder: ['confirm', 'cancel'],
      confirmationButtonProps: { color: 'error', variant: 'contained' },
      dialogProps: { maxWidth: 'xs' },
      confirmationKeywordTextFieldProps: {
        autoFocus: true,
        variant: 'outlined',
        size: 'small',
        placeholder: `LEAVE ${currentWorkspace?.title}`,
        sx: { 
          mt: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
            },
            '&:hover fieldset': {
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      }
    }).then(async () => {
      try {
        await leaveWorkspaceAPI(currentWorkspace._id)
        toast.success('Left workspace successfully!')
        onLeaveWorkspace(currentWorkspace._id)
      } catch (error) {
        toast.error('Failed to leave workspace!')
      }
    }).catch(() => {})
  }

  return (
    <Box ref={scrollContainerRef} sx={{ flex: 1, p: 4, overflowY: 'auto', scrollBehavior: 'smooth' }}>
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
              boards?.length === 0 ? null : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2.5 }}>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={180} sx={{ borderRadius: '16px', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                  ))}
                </Box>
              )
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

            {boards?.length > 0 && !isFetchingBoards &&
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
                    canManage={canManage}
                    currentUser={currentUser}
                  />
                )}
              </Box>
            }

            {(totalBoards > 0) && !isFetchingBoards &&
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
        <Box sx={{ display: 'flex', gap: 4, width: '100%', scrollBehavior: 'smooth' }}>
          {/* Settings Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>

          {/* ═══════════ 1. GENERAL ═══════════ */}
          <Box id="settings-general" sx={{ 
            p: 3, borderRadius: 2, border: '1px solid', 
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>General</Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              {/* Left: Form inputs */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Workspace Name</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    defaultValue={currentWorkspace?.title || ''}
                    placeholder="My Workspace"
                    disabled={!canManage}
                    sx={{
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#f8fafc',
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Description</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    defaultValue={currentWorkspace?.description || ''}
                    placeholder="Describe what this workspace is for..."
                    disabled={!canManage}
                    sx={{
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#f8fafc',
                    }}
                  />
                </Box>
                {canManage && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" size="small" sx={{ px: 3, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>
              {/* Right: Logo/Avatar Upload */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, minWidth: '140px' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Logo</Typography>
                <Box sx={{
                  width: 100, height: 100, borderRadius: '16px',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#21262d' : '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                  cursor: canManage ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  '&:hover': canManage ? {
                    borderColor: 'primary.main',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                  } : {},
                  overflow: 'hidden'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.secondary', userSelect: 'none' }}>
                    {currentWorkspace?.title?.charAt(0)?.toUpperCase() || 'W'}
                  </Typography>
                </Box>
                {canManage && (
                  <Button variant="outlined" size="small" sx={{ fontSize: '12px', px: 2 }}>
                    Upload
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* ═══════════ 2. ACCESS & SECURITY ═══════════ */}
          <Box id="settings-access" sx={{ 
            p: 3, borderRadius: 2, border: '1px solid', 
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>Access & Security</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Workspace Visibility */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2.5, borderBottom: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>Workspace Visibility</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                    Control whether this workspace can be discovered by others.
                  </Typography>
                </Box>
                <Select
                  size="small"
                  defaultValue="private"
                  disabled={!canManage}
                  sx={{ 
                    minWidth: 150, 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#f8fafc',
                  }}
                >
                  <MenuItem value="private">Private</MenuItem>
                  <MenuItem value="public">Public</MenuItem>
                </Select>
              </Box>
              {/* Invite Permissions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>Invite Permissions</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                    Choose who can invite new members to this workspace.
                  </Typography>
                </Box>
                <Select
                  size="small"
                  defaultValue="admin"
                  disabled={!canManage}
                  sx={{ 
                    minWidth: 200,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#f8fafc',
                  }}
                >
                  <MenuItem value="admin">Owner & Admin only</MenuItem>
                  <MenuItem value="all">All members</MenuItem>
                </Select>
              </Box>
            </Box>
          </Box>

          {/* ═══════════ 3. BILLING & PLAN ═══════════ */}
          <Box id="settings-billing" sx={{ 
            p: 3, borderRadius: 2, border: '1px solid', 
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>Billing & Plan</Typography>
            <Box sx={{ 
              p: 3, borderRadius: 2,
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#f8fafc',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>Free Plan</Typography>
                  <Box sx={{ 
                    px: 1, py: 0.25, borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)',
                    color: 'primary.main',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    Current
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Up to 10 boards · 5 members · 100MB storage
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                sx={{ 
                  px: 3, fontWeight: 700, boxShadow: 'none', 
                  bgcolor: '#3b82f6',
                  '&:hover': { bgcolor: '#2563eb', boxShadow: 'none' }
                }}
              >
                Upgrade to PRO
              </Button>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1.5, fontStyle: 'italic', textAlign: 'center' }}>
              Pro plan with unlimited boards, members, and advanced features — Coming Soon
            </Typography>
          </Box>

          {/* ═══════════ 4. DATA MANAGEMENT ═══════════ */}
          <Box id="settings-data" sx={{ 
            p: 3, borderRadius: 2, border: '1px solid', 
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>Data Management</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>Export Workspace Data</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                  Download all boards, cards, and members as a JSON file for backup or migration.
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small"
                disabled={!canManage}
                sx={{ px: 3, fontWeight: 600 }}
              >
                Export Data
              </Button>
            </Box>
          </Box>

          {/* ═══════════ 5. DANGER ZONE ═══════════ */}
          <Box id="settings-danger" sx={{ 
            p: 3, borderRadius: 2, border: '1px solid', 
            borderColor: '#f85149',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(248, 81, 73, 0.05)' : '#fff8f8',
            display: 'flex', flexDirection: 'column', gap: 2
          }}>
            <Typography variant="h6" sx={{ color: '#f85149', fontWeight: 'bold' }}>Danger Zone</Typography>
            
            {/* Leave Workspace */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>Leave this workspace</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {userRole === 'owner' ? 'You cannot leave the workspace because you are the owner.' : 'You will lose access to all boards in this workspace.'}
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleLeaveWorkspace}
                disabled={userRole === 'owner'}
                sx={{ fontWeight: 'bold' }}
              >
                Leave Workspace
              </Button>
            </Box>

            {/* Delete Workspace */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>Delete this workspace</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {userRole === 'owner' ? 'Once you delete a workspace, there is no going back. Please be certain.' : 'Only the owner can delete this workspace.'}
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => onOpenDeleteWorkspace(currentWorkspace)}
                disabled={userRole !== 'owner'}
                sx={{ fontWeight: 'bold' }}
              >
                Delete Workspace
              </Button>
            </Box>
          </Box>
          </Box>

          {/* Navigation Menu */}
          <Box sx={{ 
            width: '180px', flexShrink: 0, 
            position: 'sticky', top: '0rem', alignSelf: 'flex-start',
            display: 'flex', flexDirection: 'column', gap: 0.5,
          }}>
            {[
              { id: 'settings-general', label: 'General' },
              { id: 'settings-access', label: 'Access & Security' },
              { id: 'settings-billing', label: 'Billing & Plan' },
              { id: 'settings-data', label: 'Data Management' },
              { id: 'settings-danger', label: 'Danger Zone' }
            ].map((item) => (
              <Box
                key={item.id}
                component="a"
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                sx={{
                  px: 1.5, py: 0.75, borderRadius: '6px', cursor: 'pointer',
                  textDecoration: 'none',
                  fontSize: '13px', fontWeight: 500,
                  color: item.id === 'settings-danger' ? '#f85149' : 'text.secondary',
                  transition: 'all 0.15s',
                  '&:hover': {
                    color: item.id === 'settings-danger' ? '#f85149' : 'text.primary',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  }
                }}
              >
                {item.label}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* TEMPLATES LIST */}
      {currentView.type === 'templates' && (
        <>
          {!templates ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2.5 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={180} sx={{ borderRadius: '16px', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
              ))}
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
