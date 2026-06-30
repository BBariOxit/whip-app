import { Box, Stack, Divider, Typography, Tooltip, IconButton } from '@mui/material'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import ListAltIcon from '@mui/icons-material/ListAlt'
import HomeIcon from '@mui/icons-material/Home'
import { styled } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'
import { WorkspaceSidebarList } from './WorkspaceSidebarList'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  padding: '10px 16px',
  borderRadius: '12px',
  color: theme.palette.text.primary,
  fontWeight: 500,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid transparent',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    transform: 'translateX(4px)'
  },
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    fontWeight: 'bold',
    border: '1px solid transparent',
    boxShadow: 'none'
  }
}))

export const Sidebar = ({ currentUser, currentView, handleViewChange, afterCreateNewBoard, workspaces, onOpenCreateWorkspace, onOpenDeleteWorkspace, onOpenRenameWorkspace }) => {
  return (
    <Box sx={{ 
      width: '280px', 
      flexShrink: 0, 
      borderRight: (theme) => `1px solid ${theme.palette.divider}`,
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* KHU VỰC 1: GLOBAL */}
      <Stack direction="column" spacing={1}>
        <SidebarItem
          className={currentView.type === 'home' ? 'active' : ''}
          onClick={() => handleViewChange({ type: 'home', id: null })}
        >
          <HomeIcon fontSize="small" />
          Home
        </SidebarItem>
        <SidebarItem
          className={currentView.type === 'templates' ? 'active' : ''}
          onClick={() => handleViewChange({ type: 'templates', id: null })}
        >
          <ListAltIcon fontSize="small" />
          Templates
        </SidebarItem>
      </Stack>

      <Divider sx={{ my: 1 }} />

      {/* KHU VỰC 2: PERSONAL */}
      <Stack direction="column" spacing={1}>
        <SidebarItem 
          className={currentView.type === 'personal' ? 'active' : ''}
          onClick={() => handleViewChange({ type: 'personal', id: null, title: 'Your Personal Boards' })}
        >
          <ViewColumnIcon fontSize="small" />
          Your Personal Boards
        </SidebarItem>
      </Stack>

      <Divider sx={{ my: 1 }} />

      {/* KHU VỰC 3: WORKSPACES */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pl: 1 }}>
          <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary' }}>Workspaces</Typography>
          <IconButton size="small" onClick={onOpenCreateWorkspace}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        <WorkspaceSidebarList 
          currentUser={currentUser}
          workspaces={workspaces}
          currentWorkspaceId={currentView.type === 'workspace' ? currentView.id : null}
          onSelectWorkspace={(id, title) => handleViewChange({ type: 'workspace', id, title })}
          onOpenCreateModal={onOpenCreateWorkspace}
          onOpenRenameModal={onOpenRenameWorkspace}
          onOpenDeleteModal={onOpenDeleteWorkspace}
        />
      </Box>

    </Box>
  )
}
