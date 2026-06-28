import { Box, Typography, Button, Pagination, PaginationItem } from '@mui/material'
import ChecklistIcon from '@mui/icons-material/Checklist'
import DeleteIcon from '@mui/icons-material/Delete'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import AddIcon from '@mui/icons-material/Add'
import { Link } from 'react-router-dom'
import { BoardCard } from './BoardCard'
import { TemplateCard } from './TemplateCard'
import PageLoadingSpinner from '~/components/Loading/pageLoadingSpinner'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

export const MainContent = ({
  currentView,
  boards,
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
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: 'text.primary',
          display: 'inline-block',
          m: 0
        }}>
          {getTitle()}
        </Typography>

        {currentView.type !== 'templates' && currentView.type !== 'home' && boards?.length > 0 && (
          <Button 
            variant="outlined"
            size="small"
            startIcon={isBulkMode ? undefined : <ChecklistIcon />}
            onClick={() => {
              setIsBulkMode(!isBulkMode)
              setSelectedIds([])
            }}
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              color: 'primary.main',
              borderColor: 'primary.main',
              borderWidth: '2px',
              '&:hover': { 
                borderColor: 'primary.dark', 
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                borderWidth: '2px'
              }
            }}
          >
            {isBulkMode ? "Cancel" : "Select"}
          </Button>
        )}

        {isBulkMode && selectedIds.length > 0 && (
          <Button 
            variant="contained" 
            color="error" 
            size="small"
            startIcon={<DeleteIcon />} 
            onClick={handleBulkDelete}
            sx={{ borderRadius: '8px', textTransform: 'none', ml: 'auto' }}
          >
            Delete {selectedIds.length} item(s)
          </Button>
        )}
      </Box>

      {/* BOARDS LIST (Personal or Workspace) */}
      {(currentView.type === 'personal' || currentView.type === 'workspace') && (
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
            <Box sx={{ my: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    to={`/boards${item.page === DEFAULT_PAGE ? '' : `?page=${item.page}`}`}
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
    </Box>
  )
}
