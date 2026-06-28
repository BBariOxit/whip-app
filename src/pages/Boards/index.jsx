import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/pageLoadingSpinner'
import Box from '@mui/material/Box'
import { useLocation } from 'react-router-dom'
import { fetchBoardsAPI, fetchTemplatesAPI, bulkDeleteBoardsAPI, fetchWorkspacesAPI } from '~/apis'
import { toast } from 'sonner'
import { useConfirm } from 'material-ui-confirm'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import { CreateWorkspaceModal } from '~/components/Modal/CreateWorkspaceModal/CreateWorkspaceModal'
import CreateBoardModal from './create'

function Boards() {
  // Navigation State
  // Default to null, will fetch workspaces first and set default
  const [currentView, setCurrentView] = useState({ type: 'personal', id: null, title: 'Your Personal Boards' })

  // Boards & Workspace Data State
  const [boards, setBoards] = useState(null)
  const [totalBoards, setTotalBoards] = useState(null)
  const [templates, setTemplates] = useState(null)
  const [workspaces, setWorkspaces] = useState([])
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false)
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)

  // Pagination
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const page = parseInt(query.get('page') || '1', 10)

  // Bulk Edit State
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const confirmBulkDelete = useConfirm()

  const updateStateData = (res) => {
    setBoards(res.boards || [])
    setTotalBoards(res.totalBoards || 0)
  }

  // Fetch Workspaces on Mount
  useEffect(() => {
    fetchWorkspacesAPI().then(res => setWorkspaces(res))
  }, [])

  // Fetch Boards when switching to personal or workspace
  useEffect(() => {
    if (currentView.type === 'personal' || currentView.type === 'workspace') {
      const searchParams = new URLSearchParams(location.search)
      searchParams.set('workspaceId', currentView.id)
      fetchBoardsAPI(`?${searchParams.toString()}`).then(updateStateData)
    }
  }, [location.search, currentView])

  // Fetch Templates when switching to templates view
  useEffect(() => {
    if (currentView.type === 'templates' && !templates) {
      fetchTemplatesAPI().then(res => setTemplates(res))
    }
  }, [currentView, templates])

  const afterCreateNewBoard = () => {
    if (currentView.type === 'personal' || currentView.type === 'workspace') {
      const searchParams = new URLSearchParams(location.search)
      searchParams.set('workspaceId', currentView.id)
      fetchBoardsAPI(`?${searchParams.toString()}`).then(updateStateData)
    } else {
      setCurrentView({ type: 'personal', id: null, title: 'Your Personal Boards' })
    }
  }

  const handleWorkspaceCreated = (newWorkspace) => {
    setWorkspaces([newWorkspace, ...workspaces])
    setCurrentView({ type: 'workspace', id: newWorkspace._id, title: newWorkspace.title })
  }

  // Show loading spinner if fetching boards for the first time
  if ((currentView.type === 'personal' || currentView.type === 'workspace') && !boards) {
    return <PageLoadingSpinner caption="Loading Boards..." />
  }

  const onBoardDeleted = (deletedBoardId) => {
    setBoards(prev => prev.filter(b => b._id !== deletedBoardId))
    setTotalBoards(prev => prev - 1)
  }

  const onBoardUpdated = (updatedBoard) => {
    setBoards(prev => prev.map(b => b._id === updatedBoard._id ? updatedBoard : b))
  }

  const handleSelectCard = (boardId) => {
    if (selectedIds.includes(boardId)) {
      setSelectedIds(selectedIds.filter(id => id !== boardId))
    } else {
      setSelectedIds([...selectedIds, boardId])
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return

    confirmBulkDelete({
      title: 'Bulk Delete Boards?',
      description: `You are about to permanently delete ${selectedIds.length} board(s) and all their associated data. This action cannot be undone. Are you sure?`,
      confirmationText: 'Delete selected',
      confirmationButtonProps: { color: 'error', variant: 'contained' },
      cancellationText: 'Cancel'
    }).then(async () => {
      try {
        await bulkDeleteBoardsAPI(selectedIds)
        toast.success(`Successfully deleted ${selectedIds.length} boards!`)
        setSelectedIds([])
        setIsBulkMode(false)
        fetchBoardsAPI(location.search).then(updateStateData)
      } catch (error) {
        toast.error('Failed to bulk delete boards!')
      }
    }).catch(() => {})
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* APP BAR HEADER */}
      <AppBar onOpenCreateBoard={() => setIsCreateBoardOpen(true)} />
      
      {/* APP SHELL LAYOUT */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* SIDEBAR */}
        <Sidebar 
          currentView={currentView}
          setCurrentView={setCurrentView}
          afterCreateNewBoard={afterCreateNewBoard}
          workspaces={workspaces}
          onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
        />

        {/* MAIN CONTENT */}
        <MainContent 
          currentView={currentView}
          onOpenCreateBoard={() => setIsCreateBoardOpen(true)}
          boards={boards}
          templates={templates}
          totalBoards={totalBoards}
          page={page}
          isBulkMode={isBulkMode}
          setIsBulkMode={setIsBulkMode}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          handleSelectCard={handleSelectCard}
          handleBulkDelete={handleBulkDelete}
          onBoardDeleted={onBoardDeleted}
          onBoardUpdated={onBoardUpdated}
        />
      </Box>

      {/* MODALS */}
      <CreateWorkspaceModal 
        open={isCreateWorkspaceOpen} 
        handleClose={() => setIsCreateWorkspaceOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
      
      <CreateBoardModal 
        isOpen={isCreateBoardOpen} 
        handleClose={() => setIsCreateBoardOpen(false)} 
        afterCreateNewBoard={afterCreateNewBoard} 
        currentWorkspaceId={currentView.type === 'workspace' ? currentView.id : null} 
      />
    </Box>
  )
}

export default Boards
