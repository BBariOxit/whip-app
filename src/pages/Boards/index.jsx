import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/pageLoadingSpinner'
import Box from '@mui/material/Box'
import { useLocation, useSearchParams } from 'react-router-dom'
import { fetchBoardsAPI, fetchTemplatesAPI, bulkDeleteBoardsAPI, fetchWorkspacesAPI, deleteWorkspaceAPI } from '~/apis'
import { toast } from 'sonner'
import { useConfirm } from 'material-ui-confirm'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import { CreateWorkspaceModal } from '~/components/Modal/CreateWorkspaceModal/CreateWorkspaceModal'
import { DeleteWorkspaceModal } from '~/components/Modal/DeleteWorkspaceModal/DeleteWorkspaceModal'
import { RenameWorkspaceModal } from '~/components/Modal/RenameWorkspaceModal/RenameWorkspaceModal'
import CreateBoardModal from './create'

function Boards() {
  // Pagination and Location
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = new URLSearchParams(location.search)

  // Fetch workspaces before determining currentView if we need title, but for now we initialize from URL
  const initWorkspaceId = query.get('workspaceId')
  const [currentView, setCurrentView] = useState(() => {
    if (initWorkspaceId && initWorkspaceId !== 'null') {
      return { type: 'workspace', id: initWorkspaceId, title: 'Workspace Boards' }
    }
    return { type: 'personal', id: null, title: 'Your Personal Boards' }
  })

  // Boards & Workspace Data State
  const [boards, setBoards] = useState(null)
  const [totalBoards, setTotalBoards] = useState(null)
  const [templates, setTemplates] = useState(null)
  const [workspaces, setWorkspaces] = useState([])
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false)
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)
  const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] = useState(false)
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null)
  const [isRenameWorkspaceOpen, setIsRenameWorkspaceOpen] = useState(false)
  const [workspaceToRename, setWorkspaceToRename] = useState(null)

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
    fetchWorkspacesAPI().then(res => {
      setWorkspaces(res)
      // Update title if we initialized from URL
      if (currentView.type === 'workspace') {
        const wsp = res.find(w => w._id === currentView.id)
        if (wsp) setCurrentView(prev => ({ ...prev, title: wsp.title }))
      }
    })
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

  const handleDeleteWorkspace = async (workspaceId) => {
    await deleteWorkspaceAPI(workspaceId)
    setWorkspaces(workspaces.filter(w => w._id !== workspaceId))
    setIsDeleteWorkspaceOpen(false)
    setWorkspaceToDelete(null)
    if (currentView.type === 'workspace' && currentView.id === workspaceId) {
      setCurrentView({ type: 'home', id: null })
    }
  }

  const handleRenameSuccess = (newTitle, workspaceId) => {
    // Cập nhật lại mảng workspaces
    const updatedWorkspaces = workspaces.map(w => 
      w._id === workspaceId ? { ...w, title: newTitle } : w
    )
    setWorkspaces(updatedWorkspaces)

    // Nếu đang view workspace đó thì cập nhật luôn currentView.title
    if (currentView.type === 'workspace' && currentView.id === workspaceId) {
      setCurrentView({ ...currentView, title: newTitle })
    }
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
    if (currentView.type === 'personal' && updatedBoard.workspaceId) {
      setBoards(prev => prev.filter(b => b._id !== updatedBoard._id))
      setTotalBoards(prev => prev - 1)
    } else if (currentView.type === 'workspace' && updatedBoard.workspaceId !== currentView.id) {
      setBoards(prev => prev.filter(b => b._id !== updatedBoard._id))
      setTotalBoards(prev => prev - 1)
    } else {
      setBoards(prev => prev.map(b => b._id === updatedBoard._id ? updatedBoard : b))
    }
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

  const handleViewChange = (newView) => {
    setCurrentView(newView)
    
    // Tạo copy của params hiện tại để giữ lại (nếu có các param khác ngoài page)
    const newParams = new URLSearchParams(searchParams)

    if (newView.type === 'workspace') {
      newParams.set('workspaceId', newView.id)
      newParams.set('page', '1') // RESET PAGE NÈ ĐM!
    } else if (newView.type === 'personal') {
      newParams.delete('workspaceId')
      newParams.set('page', '1') // CŨNG PHẢI RESET PAGE!
    } else if (newView.type === 'home' || newView.type === 'templates') {
      newParams.delete('workspaceId')
      newParams.delete('page')
    }

    setSearchParams(newParams)
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
          handleViewChange={handleViewChange}
          afterCreateNewBoard={afterCreateNewBoard}
          workspaces={workspaces}
          onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
          onOpenRenameWorkspace={(wsp) => {
            setWorkspaceToRename(wsp)
            setIsRenameWorkspaceOpen(true)
          }}
          onOpenDeleteWorkspace={(wsp) => {
            setWorkspaceToDelete(wsp)
            setIsDeleteWorkspaceOpen(true)
          }}
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

      <DeleteWorkspaceModal
        isOpen={isDeleteWorkspaceOpen}
        handleClose={() => {
          setIsDeleteWorkspaceOpen(false)
          setWorkspaceToDelete(null)
        }}
        workspaceToDelete={workspaceToDelete}
        onSubmit={handleDeleteWorkspace}
      />

      <RenameWorkspaceModal
        isOpen={isRenameWorkspaceOpen}
        onClose={() => {
          setIsRenameWorkspaceOpen(false)
          setWorkspaceToRename(null)
        }}
        currentWorkspace={workspaceToRename}
        onRenameSuccess={handleRenameSuccess}
      />
    </Box>
  )
}

export default Boards
