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
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import Badge from '@mui/material/Badge'

import { getCardTemplatesAPI, deleteCardTemplateAPI, getColumnTemplatesAPI, deleteColumnTemplateAPI, useCardTemplateAPI, useColumnTemplateAPI } from '~/apis'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBoardDetailAPI, selectCurrentActive, updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { cloneDeep } from 'lodash-es'

function TemplateManagerDrawer({ isOpen, onClose, boardId, currentUser }) {
  const [activeTab, setActiveTab] = useState(0) // 0: Cards, 1: Columns
  const [templateData, setTemplateData] = useState({ cards: [], columns: [] })
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActive)
  const confirmAction = useConfirm()

  const isAdmin = board?.ownerIds?.includes(currentUser?._id)

  useEffect(() => {
    if (isOpen && boardId) {
      Promise.all([
        getCardTemplatesAPI(boardId),
        getColumnTemplatesAPI(boardId)
      ])
      .then(([cardsRes, columnsRes]) => {
        setTemplateData({ cards: cardsRes, columns: columnsRes })
      })
      .catch(err => console.error(err))
    }
  }, [isOpen, boardId])

  const handleDeleteCardTemplate = async (templateId) => {
    try {
      await confirmAction({
        title: 'Delete this card template?',
        description: 'This action cannot be undone.',
        confirmationText: 'Confirm Delete'
      })
      await deleteCardTemplateAPI(templateId)
      setTemplateData(prev => ({
        ...prev,
        cards: prev.cards.filter(c => c._id !== templateId)
      }))
      toast.success('Card template deleted!')
    } catch (e) {
      // User cancelled
    }
  }

  const handleDeleteColumnTemplate = async (templateId) => {
    try {
      await confirmAction({
        title: 'Delete this column template?',
        description: 'This action cannot be undone. Inner cards template will also be deleted.',
        confirmationText: 'Confirm Delete'
      })
      await deleteColumnTemplateAPI(templateId)
      setTemplateData(prev => ({
        ...prev,
        columns: prev.columns.filter(c => c._id !== templateId)
      }))
      toast.success('Column template deleted!')
    } catch (e) {
      // User cancelled
    }
  }

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box sx={{ width: '380px', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#22272e' : '#fff', height: '100%', color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#333', p: 3, borderLeft: '1px solid #30363d' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardCustomizeOutlinedIcon sx={{ color: '#2ea043' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Templates</Typography>
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 2 }}>
          <Tab label={`Cards (${templateData.cards.length})`} />
          <Tab label={`Columns (${templateData.columns.length})`} />
        </Tabs>

        {activeTab === 0 && (
          <List>
            {templateData.cards.length === 0 ? (
              <Typography sx={{ fontSize: '13px', textAlign: 'center', mt: 4, color: 'text.secondary' }}>Card template is empty.</Typography>
            ) : (
              templateData.cards.map(card => (
                <ListItem key={card._id} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f5f5f5', mb: 1, borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <ListItemText primary={card.title} primaryTypographyProps={{ fontSize: '14px', fontWeight: 600, noWrap: true }} />
                  {isAdmin ? (
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                      <IconButton title="Delete Template" onClick={() => handleDeleteCardTemplate(card._id)} sx={{ color: '#f85149' }} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography fontSize="12px" color="#768390" sx={{ ml: 1, whiteSpace: 'nowrap' }}>View only</Typography>
                  )}
                </ListItem>
              ))
            )}
          </List>
        )}

        {activeTab === 1 && (
          <List>
            {templateData.columns.length === 0 ? (
              <Typography sx={{ fontSize: '13px', textAlign: 'center', mt: 4, color: 'text.secondary' }}>Column template is empty.</Typography>
            ) : (
              templateData.columns.map(column => (
                <ListItem key={column._id} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f5f5f5', mb: 1, borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                    <ListItemText primary={column.title} primaryTypographyProps={{ fontSize: '14px', fontWeight: 600, noWrap: true }} />
                    <Box sx={{
                      bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '11px', fontWeight: 'bold',
                      height: '18px', minWidth: '18px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5
                    }} title={`${column.cards?.length} cards in template`}>
                      {column.cards?.length}
                    </Box>
                  </Box>
                  {isAdmin ? (
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                      <IconButton title="Delete Template" onClick={() => handleDeleteColumnTemplate(column._id)} sx={{ color: '#f85149' }} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Typography fontSize="12px" color="#768390" sx={{ ml: 1, whiteSpace: 'nowrap' }}>View only</Typography>
                  )}
                </ListItem>
              ))
            )}
          </List>
        )}
      </Box>
    </Drawer>
  )
}

export default TemplateManagerDrawer
