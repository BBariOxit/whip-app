import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material'
import { toast } from 'sonner'
import { updateWorkspaceAPI } from '~/apis'

export const RenameWorkspaceModal = ({ isOpen, onClose, currentWorkspace, onRenameSuccess }) => {
  const [newTitle, setNewTitle] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Mỗi khi mở Modal lên, nhét cái tên cũ vào ô Input
  useEffect(() => {
    if (currentWorkspace) {
      setNewTitle(currentWorkspace.title)
    }
  }, [currentWorkspace])

  const handleSave = async () => {
    if (!newTitle.trim() || newTitle === currentWorkspace.title) {
      onClose() // Đéo sửa gì hoặc gõ toàn dấu cách thì đóng luôn
      return
    }

    setIsUpdating(true)
    try {
      // 1. Gọi API UPDATE xuống Backend
      await updateWorkspaceAPI(currentWorkspace._id, { title: newTitle })
      
      toast.success('Workspace renamed successfully!')
      
      // 2. Bắn data lên component cha để cập nhật lại UI ngay lập tức
      onRenameSuccess(newTitle, currentWorkspace._id) 
      onClose()
    } catch (error) {
      toast.error('Error: ' + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      fullWidth 
      PaperProps={{ sx: { maxWidth: '400px' } }}
    >
      <DialogTitle sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#f6f8fa', color: (theme) => theme.palette.text.primary, fontWeight: 'bold' }}>
        Rename Workspace
      </DialogTitle>
      
      <DialogContent sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#f6f8fa', pt: 3 }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Workspace Name"
          variant="outlined"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          inputProps={{ maxLength: 30 }} 
          sx={{ mb: 2 }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }} 
        />
      </DialogContent>

      <DialogActions sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#f6f8fa', p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary' }} disabled={isUpdating}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!newTitle.trim() || isUpdating}
        >
          {isUpdating ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
