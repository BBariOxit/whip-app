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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { getArchivedItemsAPI, restoreCardAPI, restoreColumnAPI, deleteCardAPI, deleteColumnDetailAPI, createNewColumnAPI } from '~/apis'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBoardDetailAPI, selectCurrentActive } from '~/redux/activeBoard/activeBoardSlice'

function ArchivedItemsDrawer({ isOpen, onClose, boardId }) {
  const [activeTab, setActiveTab] = useState(0) // 0: Cards, 1: Columns
  const [archivedData, setArchivedData] = useState({ cards: [], columns: [] })
  const [orphanModalInfo, setOrphanModalInfo] = useState({ isOpen: false, card: null })
  const [selectedNewColumnId, setSelectedNewColumnId] = useState('CREATE_NEW')
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActive)
  const confirmAction = useConfirm()

  useEffect(() => {
    if (isOpen && boardId) {
      getArchivedItemsAPI(boardId)
        .then(res => setArchivedData(res))
        .catch(err => console.error(err))
    }
  }, [isOpen, boardId])

  const executeRestoreCard = async (cardId, newColumnId) => {
    try {
      let finalColumnId = newColumnId

      if (newColumnId === 'CREATE_NEW') {
        const createdColumn = await createNewColumnAPI({
          boardId: board._id,
          title: 'New Column'
        })
        finalColumnId = createdColumn._id
      }

      await restoreCardAPI(cardId, { newColumnId: finalColumnId })
      
      setArchivedData(prev => ({
        ...prev,
        cards: prev.cards.filter(c => c._id !== cardId)
      }))
      
      dispatch(fetchBoardDetailAPI(boardId))
      toast.success('Card has been restored!')
      setOrphanModalInfo({ isOpen: false, card: null })
    } catch (e) {
      toast.error('Failed to restore card')
    }
  }

  const handleRestoreCard = async (card) => {
    // Check if the card's parent column is also archived
    const isParentColumnArchived = archivedData.columns.some(col => col._id === card.columnId)

    if (isParentColumnArchived) {
      toast.error(`Cannot restore this card because its parent column is currently archived. Please restore the column first!`)
      return
    }

    const isParentAlive = board.columns.some(c => c._id === card.columnId)

    if (isParentAlive) {
      executeRestoreCard(card._id, null)
    } else {
      setOrphanModalInfo({ isOpen: true, card: card })
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
              <Typography sx={{ fontSize: '13px', textAlign: 'center', mt: 4 }}>Card archive is empty.</Typography>
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
              <Typography sx={{ fontSize: '13px', textAlign: 'center', mt: 4 }}>Column archive is empty.</Typography>
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

      {/* Orphaned Card Rescue Modal */}
      <Dialog 
        open={orphanModalInfo.isOpen} 
        onClose={() => setOrphanModalInfo({ isOpen: false, card: null })}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#22272e' : 'background.paper',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'text.primary', 
          fontWeight: 'bold',
          pb: 1 
        }}>
          Original column deleted
        </DialogTitle>
        
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ color: 'text.secondary', mb: 2.5, fontSize: '14px' }}>
            Card <b>{orphanModalInfo.card?.title}</b> needs a new home. Where would you like to restore it to?
          </Box>
          
          <Select
            fullWidth
            size="small"
            value={selectedNewColumnId}
            onChange={(e) => setSelectedNewColumnId(e.target.value)}
            MenuProps={{
              anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
              transformOrigin: { vertical: 'top', horizontal: 'left' }
            }}
            sx={{ 
              borderRadius: '6px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#f3f4f6'
            }}
          >
            <MenuItem value="CREATE_NEW" sx={{ color: 'primary.main', fontWeight: 600 }}>
              + Create new column
            </MenuItem>
            
            {board?.columns?.map(col => (
              <MenuItem key={col._id} value={col._id}>
                {col.title}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOrphanModalInfo({ isOpen: false, card: null })}
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            disableElevation
            onClick={() => executeRestoreCard(orphanModalInfo.card._id, selectedNewColumnId)}
            sx={{ 
              bgcolor: 'primary.main', 
              fontWeight: 600,
              borderRadius: '6px'
            }}
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  )
}

export default ArchivedItemsDrawer
