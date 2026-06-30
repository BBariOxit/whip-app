import { useState, useEffect } from 'react'
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Avatar, Select, MenuItem, Chip, 
  IconButton, Menu, ListItemIcon, ListItemText, CircularProgress
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { 
  getWorkspaceMembersAPI, 
  removeWorkspaceMemberAPI, 
  updateWorkspaceMemberRoleAPI,
  getWorkspaceDetailsAPI
} from '~/apis'
import { getMyWorkspaceRole, canManageMember, canChangeRole } from '~/utils/workspaceRbac'

export const WorkspaceMembersTable = ({ workspaceId }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [workspaceInfo, setWorkspaceInfo] = useState(null)
  
  const currentUser = useSelector(selectCurrentUser)

  const fetchMembers = async () => {
    try {
      setLoading(true)
      // Fetch both details to get current user's role and members list
      const wsDetails = await getWorkspaceDetailsAPI(workspaceId)
      setWorkspaceInfo(wsDetails)
      setMembers(wsDetails.members || [])
    } catch (error) {
      // error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (workspaceId) {
      fetchMembers()
    }
  }, [workspaceId])

  const myRole = getMyWorkspaceRole(workspaceInfo, currentUser?._id)

  const handleOpenMenu = (e, user) => {
    setAnchorEl(e.currentTarget)
    setSelectedUser(user)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const handleKick = async () => {
    if (!selectedUser) return
    try {
      await removeWorkspaceMemberAPI(workspaceId, selectedUser.userId)
      // Remove from list locally
      setMembers(prev => prev.filter(m => m.userId !== selectedUser.userId))
    } catch (error) {
      // error handled
    } finally {
      handleCloseMenu()
    }
  }

  const handleChangeRole = async (event, userId) => {
    const newRole = event.target.value
    try {
      await updateWorkspaceMemberRoleAPI(workspaceId, userId, { role: newRole })
      // Update locally
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole } : m))
    } catch (error) {
      // error handled
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      <TableContainer 
        component={Paper} 
        sx={{ 
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff', 
          border: '1px solid', 
          borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de', 
          borderRadius: 2, 
          boxShadow: 'none' 
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="members table">
          <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#21262d' : '#f6f8fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary', borderBottom: '1px solid #30363d' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary', borderBottom: '1px solid #30363d' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary', borderBottom: '1px solid #30363d' }}>Joined At</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary', borderBottom: '1px solid #30363d' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {members.map((row) => {
              // Using our RBAC helpers to determine what the current user can do to this row
              const canEditRole = canChangeRole(myRole, row.role, currentUser._id, row.userId)
              const canKick = canManageMember(myRole, row.role, currentUser._id, row.userId)

              return (
                <TableRow
                  key={row.userId}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 }, 
                    '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } 
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ borderBottom: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={row.avatar} alt={row.displayName} sx={{ width: 40, height: 40 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{row.displayName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ borderBottom: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }}>
                    <Select
                      value={row.role === 'owner' ? 'Owner' : row.role === 'admin' ? 'Admin' : 'Member'}
                      size="small"
                      disabled={!canEditRole}
                      onChange={(e) => handleChangeRole(e, row.userId)}
                      sx={{
                        minWidth: 120,
                        height: 36,
                        borderRadius: 2,
                        fontSize: '0.875rem',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#58a6ff' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#58a6ff' },
                        '&.Mui-disabled': { opacity: 0.7 }
                      }}
                    >
                      {row.role === 'owner' && <MenuItem value="Owner">Owner</MenuItem>}
                      {row.role !== 'owner' && <MenuItem value="admin">Admin</MenuItem>}
                      {row.role !== 'owner' && <MenuItem value="member">Member</MenuItem>}
                    </Select>
                  </TableCell>

                  <TableCell sx={{ borderBottom: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de', color: 'text.secondary', fontSize: '0.875rem' }}>
                    {new Date(row.joinedAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell align="right" sx={{ borderBottom: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }}>
                    {canKick && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleOpenMenu(e, row)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        disableScrollLock={true}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f242c' : '#fff',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid #30363d' : '1px solid #d0d7de',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            mt: 1
          }
        }}
      >
        <MenuItem onClick={handleKick} sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(248, 81, 73, 0.1)' } }}>
          <ListItemIcon sx={{ color: 'inherit' }}><PersonRemoveIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>Remove from workspace</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}
