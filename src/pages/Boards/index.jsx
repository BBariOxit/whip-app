import { useState, useEffect, useRef } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import Box from '@mui/material/Box'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useDebounce } from '~/customHooks/useDebounce'
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
  const initView = query.get('view')
  const [currentView, setCurrentView] = useState(() => {
    // Cho phép deep-link tới gallery templates (dùng bởi shortcut Templates trên navbar + giữ được khi refresh)
    if (initView === 'templates') {
      return { type: 'templates', id: null, title: 'Templates' }
    }
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

  // Tìm kiếm + sắp xếp board (server-side, áp cho toàn bộ board chứ không chỉ trang hiện tại)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Bulk Edit State
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const confirmAction = useConfirm()

  const [isFetchingBoards, setIsFetchingBoards] = useState(false)

  const updateStateData = (res) => {
    setBoards(res.boards || [])
    setTotalBoards(res.totalBoards || 0)
  }

  // Nguồn DUY NHẤT dựng query cho fetchBoardsAPI: page + view + tìm kiếm + sắp xếp
  const buildBoardsQuery = () => {
    const params = new URLSearchParams()
    if (page && page > 1) params.set('page', page)
    if (currentView.type === 'workspace' && currentView.id) {
      params.set('workspaceId', currentView.id)
    } else if (currentView.type === 'personal') {
      params.set('workspaceId', 'null')
    } else if (currentView.type === 'guest') {
      params.set('workspaceId', 'guest')
    }
    const term = debouncedSearchTerm.trim()
    if (term) params.set('q[title]', term)
    if (sortBy) params.set('sort', sortBy)
    return `?${params.toString()}`
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

  // Fetch Boards khi đổi view / trang / tìm kiếm / sắp xếp
  useEffect(() => {
    if (currentView.type === 'personal' || currentView.type === 'workspace' || currentView.type === 'guest') {
      setIsFetchingBoards(true)
      fetchBoardsAPI(buildBoardsQuery())
        .then(updateStateData)
        .finally(() => setIsFetchingBoards(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, currentView.type, currentView.id, debouncedSearchTerm, sortBy])

  // Đổi tìm kiếm hoặc sắp xếp -> quay về trang 1 (bỏ qua lần mount đầu để giữ deep-link)
  const isFirstQueryChange = useRef(true)
  useEffect(() => {
    if (isFirstQueryChange.current) {
      isFirstQueryChange.current = false
      return
    }
    if (page !== 1) {
      const p = new URLSearchParams(searchParams)
      p.set('page', '1')
      setSearchParams(p)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, sortBy])

  // Đồng bộ view từ URL: khi điều hướng tới /boards?view=templates từ nơi khác (vd shortcut Templates
  // trên navbar) mà trang Boards đã mount sẵn, React Router không remount nên phải tự chuyển view.
  useEffect(() => {
    if (query.get('view') === 'templates' && currentView.type !== 'templates') {
      setCurrentView({ type: 'templates', id: null, title: 'Templates' })
    }
  }, [location.search, currentView.type])

  // Fetch Templates when switching to templates view
  useEffect(() => {
    if (currentView.type === 'templates' && !templates) {
      fetchTemplatesAPI().then(res => setTemplates(res))
    }
  }, [currentView, templates])

  const afterCreateNewBoard = () => {
    if (currentView.type === 'personal' || currentView.type === 'workspace' || currentView.type === 'guest') {
      fetchBoardsAPI(buildBoardsQuery()).then(updateStateData)
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

  // Cập nhật workspace sau khi lưu ở tab Settings (title/description/...)
  const handleWorkspaceUpdated = (updated) => {
    setWorkspaces(prev => prev.map(w => w._id === updated._id ? { ...w, ...updated } : w))
    if (currentView.type === 'workspace' && currentView.id === updated._id && updated.title) {
      setCurrentView(prev => ({ ...prev, title: updated.title }))
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
        fetchBoardsAPI(buildBoardsQuery()).then(updateStateData)
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
      newParams.delete('view')
    } else if (newView.type === 'personal') {
      newParams.set('workspaceId', 'null')
      newParams.set('page', '1') // CŨNG PHẢI RESET PAGE!
      newParams.delete('view')
    } else if (newView.type === 'guest') {
      newParams.set('workspaceId', 'guest')
      newParams.set('page', '1')
      newParams.delete('view')
    } else if (newView.type === 'templates') {
      newParams.delete('workspaceId')
      newParams.delete('page')
      newParams.set('view', 'templates')
    } else if (newView.type === 'home') {
      newParams.delete('workspaceId')
      newParams.delete('page')
      newParams.delete('view')
    }

    setSearchParams(newParams)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      {/* APP BAR HEADER */}
      <AppBar
        onOpenCreateBoard={() => setIsCreateBoardOpen(true)}
        onOpenCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
      />
      
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
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          handleSelectCard={handleSelectCard}
          handleBulkDelete={handleBulkDelete}
          onBoardDeleted={onBoardDeleted}
          onBoardUpdated={onBoardUpdated}
          onOpenDeleteWorkspace={handleConfirmDeleteWorkspace}
          onLeaveWorkspace={handleLeaveWorkspace}
          onWorkspaceUpdated={handleWorkspaceUpdated}
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
