import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import Box from '@mui/material/Box'
import { useLocation, useSearchParams } from 'react-router-dom'
import { fetchBoardsAPI, fetchTemplatesAPI, bulkDeleteBoardsAPI, fetchWorkspacesAPI, deleteWorkspaceAPI } from '~/apis'
import { toast } from 'sonner'
import { useConfirm } from 'material-ui-confirm'
import { Sidebar } from './Sidebar'
import { MainContent } from './MainContent'
import { CreateWorkspaceModal } from '~/components/Modal/CreateWorkspaceModal/CreateWorkspaceModal'
import { RenameWorkspaceModal } from '~/components/Modal/RenameWorkspaceModal/RenameWorkspaceModal'
import CreateBoardModal from './create'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

function Boards() {
  const currentUser = useSelector(selectCurrentUser)
  // Pagination and Location
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = new URLSearchParams(location.search)

  // Fetch workspaces before determining currentView if we need title, but for now we initialize from URL
  const initWorkspaceId = query.get('workspaceId')
  const [currentView, setCurrentView] = useState(() => {
    if (initWorkspaceId && initWorkspaceId !== 'null' && initWorkspaceId !== 'guest') {
      return { type: 'workspace', id: initWorkspaceId, title: 'Workspace Boards' }
    } else if (initWorkspaceId === 'guest') {
      return { type: 'guest', id: null, title: 'Shared With Me' }
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
  const [isRenameWorkspaceOpen, setIsRenameWorkspaceOpen] = useState(false)
  const [workspaceToRename, setWorkspaceToRename] = useState(null)

  const page = parseInt(query.get('page') || '1', 10)

  // Bulk Edit State
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const confirmAction = useConfirm()

  const [isFetchingBoards, setIsFetchingBoards] = useState(false)

  const updateStateData = (res) => {
    setBoards(res.boards || [])
    setTotalBoards(res.totalBoards || 0)
  }

  // Fetch Workspaces on Mount
  useEffect(() => {
    fetchWorkspacesAPI().then(res => {
      setWorkspaces(res)
      if (currentView.type === 'workspace') {
        const wsp = res.find(w => w._id === currentView.id)
        if (wsp) setCurrentView(prev => ({ ...prev, title: wsp.title }))
      }
    })
  }, [])

  // Fetch Boards when switching to personal or workspace or changing page
  useEffect(() => {
    if (currentView.type === 'personal' || currentView.type === 'workspace' || currentView.type === 'guest') {
      const searchParams = new URLSearchParams()
      if (page && page > 1) searchParams.set('page', page)
      if (currentView.type === 'workspace' && currentView.id) {
        searchParams.set('workspaceId', currentView.id)
      } else if (currentView.type === 'personal') {
        searchParams.set('workspaceId', 'null')
      } else if (currentView.type === 'guest') {
        searchParams.set('workspaceId', 'guest')
      }
      
      setIsFetchingBoards(true)
      fetchBoardsAPI(`?${searchParams.toString()}`)
        .then(res => {
          updateStateData(res)
        })
        .finally(() => {
          setIsFetchingBoards(false)
        })
    }
  }, [page, currentView.type, currentView.id])

  // Fetch Templates when switching to templates view
  useEffect(() => {
    if (currentView.type === 'templates' && !templates) {
      fetchTemplatesAPI().then(res => setTemplates(res))
    }
  }, [currentView, templates])

  const afterCreateNewBoard = () => {
    if (currentView.type === 'personal' || currentView.type === 'workspace' || currentView.type === 'guest') {
      const searchParams = new URLSearchParams()
      if (page && page > 1) searchParams.set('page', page)
      if (currentView.type === 'workspace' && currentView.id) {
        searchParams.set('workspaceId', currentView.id)
      } else if (currentView.type === 'personal') {
        searchParams.set('workspaceId', 'null')
      } else if (currentView.type === 'guest') {
        searchParams.set('workspaceId', 'guest')
      }
      fetchBoardsAPI(`?${searchParams.toString()}`).then(updateStateData)
    } else {
      setCurrentView({ type: 'personal', id: null, title: 'Your Personal Boards' })
    }
  }

  const handleWorkspaceCreated = (newWorkspace) => {
    setWorkspaces([newWorkspace, ...workspaces])
    setCurrentView({ type: 'workspace', id: newWorkspace._id, title: newWorkspace.title })
  }

  const handleConfirmDeleteWorkspace = (workspace) => {
    confirmAction({
      title: 'Delete Workspace',
      description: `You are about to permanently delete the workspace "${workspace.title}". Type "DELETE ${workspace.title}" to confirm.`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel',
      confirmationKeyword: `DELETE ${workspace.title}`,
      buttonOrder: ['confirm', 'cancel'],
      confirmationButtonProps: { color: 'error', variant: 'contained' },
      dialogProps: { maxWidth: 'xs' },
      confirmationKeywordTextFieldProps: {
        autoFocus: true,
        variant: 'outlined',
        size: 'small',
        placeholder: `DELETE ${workspace.title}`,
        sx: { 
          mt: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' },
            '&:hover fieldset': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }
          }
        }
      }
    }).then(async () => {
      await deleteWorkspaceAPI(workspace._id)
      setWorkspaces(prev => prev.filter(w => w._id !== workspace._id))
      if (currentView.type === 'workspace' && currentView.id === workspace._id) {
        setCurrentView({ type: 'home', id: null })
      }
      toast.success('Workspace deleted successfully!')
    }).catch(() => {})
  }

  const handleLeaveWorkspace = async (workspaceId) => {
    setWorkspaces(workspaces.filter(w => w._id !== workspaceId))
    if (currentView.type === 'workspace' && currentView.id === workspaceId) {
      setCurrentView({ type: 'home', id: null })
    }
  }

  const handleRenameSuccess = (newTitle, workspaceId) => {
    const updatedWorkspaces = workspaces.map(w => 
      w._id === workspaceId ? { ...w, title: newTitle } : w
    )
    setWorkspaces(updatedWorkspaces)

    if (currentView.type === 'workspace' && currentView.id === workspaceId) {
      setCurrentView({ ...currentView, title: newTitle })
    }
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
    } else if (currentView.type === 'guest') {
      setBoards(prev => prev.map(b => b._id === updatedBoard._id ? updatedBoard : b))
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

    confirmAction({
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
    setBoards(null)
    setTotalBoards(null)
    setCurrentView(newView)
    
    // Tạo copy của params hiện tại để giữ lại (nếu có các param khác ngoài page)
    const newParams = new URLSearchParams(searchParams)

    if (newView.type === 'workspace') {
      newParams.set('workspaceId', newView.id)
      newParams.set('page', '1') // RESET PAGE NÈ ĐM!
    } else if (newView.type === 'personal') {
      newParams.set('workspaceId', 'null')
      newParams.set('page', '1') // CŨNG PHẢI RESET PAGE!
    } else if (newView.type === 'guest') {
      newParams.set('workspaceId', 'guest')
      newParams.set('page', '1')
    } else if (newView.type === 'home' || newView.type === 'templates') {
      newParams.delete('workspaceId')
      newParams.delete('page')
    }

    setSearchParams(newParams)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      {/* APP BAR HEADER */}
      <AppBar onOpenCreateBoard={() => setIsCreateBoardOpen(true)} />
      
      {/* APP SHELL LAYOUT */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* SIDEBAR */}
        <Sidebar 
          currentUser={currentUser}
          currentView={currentView}
          handleViewChange={handleViewChange}
          afterCreateNewBoard={afterCreateNewBoard}
          workspaces={workspaces}
          onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
          onOpenRenameWorkspace={(wsp) => {
            setWorkspaceToRename(wsp)
            setIsRenameWorkspaceOpen(true)
          }}
          onOpenDeleteWorkspace={handleConfirmDeleteWorkspace}
        />

        {/* MAIN CONTENT */}
        <MainContent 
          currentUser={currentUser}
          currentView={currentView}
          workspaces={workspaces}
          onOpenCreateBoard={() => setIsCreateBoardOpen(true)}
          boards={boards}
          isFetchingBoards={isFetchingBoards}
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
          onOpenDeleteWorkspace={handleConfirmDeleteWorkspace}
          onLeaveWorkspace={handleLeaveWorkspace}
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
