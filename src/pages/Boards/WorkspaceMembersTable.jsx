import { useState } from 'react'
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Avatar, Select, MenuItem, Chip, 
  IconButton, Menu, ListItemIcon, ListItemText 
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'

// TODO: Thay bằng dữ liệu thật từ API trả về sau này
const MOCK_MEMBERS = [
  { id: 1, name: 'Phan B', email: 'phanb@whip.com', role: 'Owner', status: 'Active', avatar: '' },
  { id: 2, name: 'Alex Manager', email: 'alex@whip.com', role: 'Admin', status: 'Active', avatar: '' },
  { id: 3, name: 'John Doe', email: 'john@whip.com', role: 'Member', status: 'Pending', avatar: '' },
]

export const WorkspaceMembersTable = ({ workspaceId }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  
  const handleOpenMenu = (e, user) => {
    setAnchorEl(e.currentTarget)
    setSelectedUser(user)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const handleKick = () => {
    // TODO: Gọi API kick user khỏi workspace
    console.log('Kicking user: ', selectedUser?.name)
    handleCloseMenu()
  }

  const handleChangeRole = (event, userId) => {
    // TODO: Gọi API đổi role
    console.log('Changing role for user', userId, 'to', event.target.value)
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
          {/* TABLE HEADER */}
          <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#21262d' : '#f6f8fa' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary', borderBottom: '1px solid #30363d' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary', borderBottom: '1px solid #30363d' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary', borderBottom: '1px solid #30363d' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary', borderBottom: '1px solid #30363d' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          
          {/* TABLE BODY */}
          <TableBody>
            {MOCK_MEMBERS.map((row) => (
              <TableRow
                key={row.id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 }, 
                  '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' } 
                }}
              >
                {/* CỘT USER */}
                <TableCell component="th" scope="row" sx={{ borderBottom: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={row.avatar} alt={row.name} sx={{ width: 40, height: 40 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{row.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* CỘT ROLE */}
                <TableCell sx={{ borderBottom: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }}>
                  <Select
                    value={row.role}
                    size="small"
                    disabled={row.role === 'Owner'} // Không được tự sửa role của Owner
                    onChange={(e) => handleChangeRole(e, row.id)}
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
                    {row.role === 'Owner' && <MenuItem value="Owner">Owner</MenuItem>}
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Member">Member</MenuItem>
                  </Select>
                </TableCell>

                {/* CỘT STATUS */}
                <TableCell sx={{ borderBottom: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }}>
                  <Chip 
                    label={row.status} 
                    size="small"
                    sx={{ 
                      bgcolor: row.status === 'Active' ? 'rgba(35, 134, 54, 0.15)' : 'rgba(210, 153, 34, 0.15)',
                      color: row.status === 'Active' ? '#3fb950' : '#d29922',
                      fontWeight: 600,
                      borderRadius: '12px',
                      height: 24,
                      fontSize: '0.75rem'
                    }} 
                  />
                </TableCell>

                {/* CỘT ACTIONS */}
                <TableCell align="right" sx={{ borderBottom: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }}>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleOpenMenu(e, row)}
                    disabled={row.role === 'Owner'} // Không được kick Owner
                    sx={{ color: 'text.secondary' }}
                  >
                    <MoreHorizIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ACTION MENU KHI BẤM 3 CHẤM */}
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
          <ListItemIcon sx={{ color: 'inherit' }}><PersonRemoveIcon fontSize="small" /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}>Remove from workspace</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}
