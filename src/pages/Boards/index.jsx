import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/pageLoadingSpinner'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
// Grid: https://mui.com/material-ui/react-grid2/#whats-changed
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import ListAltIcon from '@mui/icons-material/ListAlt'
import HomeIcon from '@mui/icons-material/Home'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { Link, useLocation } from 'react-router-dom'
import CardActionArea from '@mui/material/CardActionArea'
import SidebarCreateBoardModal from './create'
import { fetchBoardsAPI, fetchTemplatesAPI } from '~/apis'
import { BoardCard } from './BoardCard'
import { TemplateCard } from './TemplateCard'
import { API_ROOT, DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

import { styled } from '@mui/material/styles'
const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : 'transparent',
  padding: '10px 16px',
  borderRadius: '12px',
  color: theme.palette.text.primary,
  fontWeight: 500,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid transparent',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    transform: 'translateX(4px)'
  },
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
    fontWeight: 600,
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'}`,
    boxShadow: theme.palette.mode === 'dark' ? 'inset 4px 0 0 #3b82f6' : 'inset 4px 0 0 #2563eb'
  }
}))

const GRADIENTS = [
  'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)', // Pastel Pink
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // Purple to Pink
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', // Mint to Blue
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', // Orange to Purple
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // Lavender to Blue
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Bright Blue
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green to Teal
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink to Yellow
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Deep Teal to Purple
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'  // Very Light Mint to Pink
]

function Boards() {
  // Số lượng bản ghi boards hiển thị tối đa trên 1 page tùy dự án (thường sẽ là 12 cái)
  const [boards, setBoards] = useState(null)
  // Tổng toàn bộ số lượng bản ghi boards có trong Database mà phía BE trả về để FE dùng tính toán phân trang
  const [totalBoards, setTotalBoards] = useState(null)

  // Xử lý phân trang từ url với MUI: https://mui.com/material-ui/react-pagination/#router-integration
  const location = useLocation()
  /**
   * Parse chuỗi string search trong location về đối tượng URLSearchParams trong JavaScript
   * https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams
   */
  const query = new URLSearchParams(location.search)
  /**
   * Lấy giá trị page từ query, default sẽ là 1 nếu không tồn tại page từ url.
   * Nhắc lại kiến thức cơ bản hàm parseInt cần tham số thứ 2 là Hệ thập phân (hệ đếm cơ số 10) để đảm bảo chuẩn số cho phân trang
   */
  const page = parseInt(query.get('page') || '1', 10)

  // Tab State
  const [activeTab, setActiveTab] = useState('boards') // 'boards' or 'templates'
  const [templates, setTemplates] = useState(null)

  const updateStateData = (res) => {
    setBoards(res.boards || [])
    setTotalBoards(res.totalBoards || 0)
  }

  useEffect(() => {
    // // Fake tạm 16 cái item thay cho boards
    // // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    // setBoards([...Array(16)].map((_, i) => i))
    // // Fake tạm giả sử trong Database trả về có tổng 100 bản ghi boards
    // setTotalBoards(100)

    // console.log(location.search)
    // Mỗi khi cái url thay đổi ví dụ như chúng ta chuyển trang, thì cái location.search 
    // lấy từ hook useLocation của react-router-dom cũng thay đổi theo, đồng nghĩa hàm useEffect sẽ chạy lại và fetch lại API 
    // theo đúng page mới vì cái location.search đã nằm trong dependencies của useEffect

    // Gọi API lấy danh sách boards ở đây...
    if (activeTab === 'boards') {
      fetchBoardsAPI(location.search).then(updateStateData)
    }
  }, [location.search, activeTab])

  useEffect(() => {
    if (activeTab === 'templates' && !templates) {
      fetchTemplatesAPI().then(res => setTemplates(res))
    }
  }, [activeTab])

  const afterCreateNewBoard = () => {
    // fetch lai danh sach board trong useEffect
    fetchBoardsAPI(location.search).then(updateStateData)
  }

  // Lúc chưa tồn tại boards > đang chờ gọi api thì hiện loading
  if (!boards) {
    return <PageLoadingSpinner caption="Loading Boards..." />
  }

  const onBoardDeleted = (deletedBoardId) => {
    // Update state to remove deleted board without refetching
    setBoards(prev => prev.filter(b => b._id !== deletedBoardId))
    setTotalBoards(prev => prev - 1)
  }

  const onBoardUpdated = (updatedBoard) => {
    // Update state with edited title
    setBoards(prev => prev.map(b => b._id === updatedBoard._id ? updatedBoard : b))
  }

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />
      <Box sx={{ paddingX: 2, my: 4 }}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={3} md={2}>
            <Stack direction="column" spacing={1}>
              <SidebarItem 
                className={activeTab === 'boards' ? 'active' : ''}
                onClick={() => setActiveTab('boards')}
              >
                <ViewColumnIcon fontSize="small" />
                Boards
              </SidebarItem>
              <SidebarItem
                className={activeTab === 'templates' ? 'active' : ''}
                onClick={() => setActiveTab('templates')}
              >
                <ListAltIcon fontSize="small" />
                Templates
              </SidebarItem>
              <SidebarItem>
                <HomeIcon fontSize="small" />
                Home
              </SidebarItem>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Stack direction="column" spacing={1}>
              <SidebarCreateBoardModal afterCreateNewBoard={afterCreateNewBoard} />
            </Stack>
          </Grid>

          <Grid xs={12} sm={9} md={10}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              mb: 3, 
              color: 'text.primary',
              display: 'inline-block'
            }}>
              {activeTab === 'boards' ? 'Your boards' : 'Templates'}
            </Typography>

            {/* TAB BOARDS */}
            {activeTab === 'boards' && (
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
                    <ViewColumnIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                      No boards found
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', mb: 3 }}>
                      Create a new board to get started with your projects.
                    </Typography>
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
                            borderRadius: '8px',
                            '&.Mui-selected': {
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: '#fff',
                              fontWeight: 'bold',
                              boxShadow: '0 4px 10px rgba(59,130,246,0.3)',
                              border: 'none',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </Box>
                }
              </>
            )}

            {/* TAB TEMPLATES */}
            {activeTab === 'templates' && (
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

          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default Boards
