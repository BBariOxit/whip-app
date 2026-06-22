import { useState, useEffect } from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CloseIcon from '@mui/icons-material/Close'
import { getArchivedItemsAPI, restoreCardAPI, restoreColumnAPI, deleteCardAPI, deleteColumnDetailAPI } from '~/apis'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { fetchBoardDetailAPI } from '~/redux/activeBoard/activeBoardSlice'

function ArchivedItemsDrawer({ isOpen, onClose, boardId }) {
  const [activeTab, setActiveTab] = useState(0) // 0: Cards, 1: Columns
  const [archivedData, setArchivedData] = useState({ cards: [], columns: [] })
  const dispatch = useDispatch()
  const confirmAction = useConfirm()

  useEffect(() => {
    if (isOpen && boardId) {
      getArchivedItemsAPI(boardId)
        .then(res => setArchivedData(res))
        .catch(err => console.error(err))
    }
  }, [isOpen, boardId])

  const handleRestoreCard = async (card) => {
    try {
      await restoreCardAPI(card._id)
      setArchivedData(prev => ({
        ...prev,
        cards: prev.cards.filter(c => c._id !== card._id)
      }))
      // Fetch board again to show the restored card
      dispatch(fetchBoardDetailAPI(boardId))
      toast.success(`Card "${card.title}" has been restored!`)
    } catch (e) {
      toast.error('Failed to restore card')
    }
  }

  const handleHardDeleteCard = async (cardId) => {
    try {
      await confirmAction({
        title: 'Delete this card permanently?',
        description: 'This action cannot be undone. All checklists and comments will be lost.',
        confirmationText: 'Confirm Delete'
      })
      await deleteCardAPI(cardId)
      setArchivedData(prev => ({
        ...prev,
        cards: prev.cards.filter(c => c._id !== cardId)
      }))
      toast.success('Card deleted permanently!')
    } catch (e) {
      // User cancelled
    }
  }

  const handleRestoreColumn = async (column) => {
    try {
      await restoreColumnAPI(column._id)
      setArchivedData(prev => ({
        ...prev,
        columns: prev.columns.filter(c => c._id !== column._id)
      }))
      // Fetch board again to show the restored column
      dispatch(fetchBoardDetailAPI(boardId))
      toast.success(`Column "${column.title}" has been restored!`)
    } catch (e) {
      toast.error('Failed to restore column')
    }
  }

  const handleHardDeleteColumn = async (columnId) => {
    try {
      await confirmAction({
        title: 'Delete this column permanently?',
        description: 'This action cannot be undone. All cards inside this column will also be deleted.',
        confirmationText: 'Confirm Delete'
      })
      await deleteColumnDetailAPI(columnId)
      setArchivedData(prev => ({
        ...prev,
        columns: prev.columns.filter(c => c._id !== columnId)
      }))
      toast.success('Column deleted permanently!')
    } catch (e) {
      // User cancelled
    }
  }

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box sx={{ width: '380px', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#22272e' : '#fff', height: '100%', color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#333', p: 3, borderLeft: '1px solid #30363d' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Archive Manager</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 2 }}>
          <Tab label={`Cards (${archivedData.cards.length})`} />
          <Tab label={`Columns (${archivedData.columns.length})`} />
        </Tabs>

        {activeTab === 0 && (
          <List>
            {archivedData.cards.length === 0 ? (
              <Typography sx={{ fontSize: '13px', textAlign: 'center', mt: 4 }}>Kho lưu trữ thẻ trống rỗng.</Typography>
            ) : (
              archivedData.cards.map(card => (
                <ListItem key={card._id} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f5f5f5', mb: 1, borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <ListItemText primary={card.title} primaryTypographyProps={{ fontSize: '14px', fontWeight: 600 }} />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton title="Restore to Board" onClick={() => handleRestoreCard(card)} sx={{ color: '#58a6ff' }} size="small">
                      <SettingsBackupRestoreIcon fontSize="small" />
                    </IconButton>
                    <IconButton title="Delete Forever" onClick={() => handleHardDeleteCard(card._id)} sx={{ color: '#f85149' }} size="small">
                      <DeleteForeverIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        )}

        {activeTab === 1 && (
          <List>
            {archivedData.columns.length === 0 ? (
              <Typography sx={{ fontSize: '13px', textAlign: 'center', mt: 4 }}>Kho lưu trữ cột trống rỗng.</Typography>
            ) : (
              archivedData.columns.map(column => (
                <ListItem key={column._id} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f5f5f5', mb: 1, borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <ListItemText primary={column.title} primaryTypographyProps={{ fontSize: '14px', fontWeight: 600 }} />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton title="Restore to Board" onClick={() => handleRestoreColumn(column)} sx={{ color: '#58a6ff' }} size="small">
                      <SettingsBackupRestoreIcon fontSize="small" />
                    </IconButton>
                    <IconButton title="Delete Forever" onClick={() => handleHardDeleteColumn(column._id)} sx={{ color: '#f85149' }} size="small">
                      <DeleteForeverIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        )}
      </Box>
    </Drawer>
  )
}

export default ArchivedItemsDrawer
