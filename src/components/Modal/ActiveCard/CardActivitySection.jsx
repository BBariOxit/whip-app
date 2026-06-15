import { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Icons cho system log
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LabelIcon from '@mui/icons-material/Label'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import ImageIcon from '@mui/icons-material/Image'
import EventIcon from '@mui/icons-material/Event'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'

import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { getCardActivitiesAPI, getCardCommentsAPI, createCommentAPI } from '~/apis'
import { socketIoInstance } from '~/socketClient'
import CommentItem from './CommentItem'

const ITEMS_PER_PAGE = 10

// Map actionType sang icon tương ứng
const ACTION_TYPE_ICONS = {
  'UPDATE_DATE': AccessTimeIcon,
  'SET_DATE': EventIcon,
  'ADD_LABEL': LabelIcon,
  'REMOVE_LABEL': LabelIcon,
  'ADD_MEMBER': PersonAddIcon,
  'REMOVE_MEMBER': PersonRemoveIcon,
  'UPDATE_COVER': ImageIcon
}

function CardActivitySection({ cardId }) {
  const currentUser = useSelector(selectCurrentUser)
  
  const [activities, setActivities] = useState([])
  const [totalActivities, setTotalActivities] = useState(0)
  
  const [comments, setComments] = useState([])
  const [totalComments, setTotalComments] = useState(0)
  
  const [showDetails, setShowDetails] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  // Fetch data page 1 (reset) — dùng khi mở modal hoặc khi có action mới
  const fetchFirstPage = useCallback(async () => {
    if (!cardId) return
    try {
      setLoading(true)
      const [actResult, cmtResult] = await Promise.all([
        getCardActivitiesAPI(cardId, 1, ITEMS_PER_PAGE),
        getCardCommentsAPI(cardId, 1, ITEMS_PER_PAGE)
      ])
      setActivities(actResult.activities || [])
      setTotalActivities(actResult.total || 0)
      
      setComments(cmtResult.comments || [])
      setTotalComments(cmtResult.total || 0)
      
      setPage(1)
    } catch (error) {
      console.error('Failed to fetch activities/comments:', error)
    } finally {
      setLoading(false)
    }
  }, [cardId])

  // Fetch thêm data (Load More) — NỐI MẢNG
  const fetchMoreData = async () => {
    if (!cardId || loading) return
    try {
      setLoading(true)
      const nextPage = page + 1
      const hasMoreActivities = activities.length < totalActivities
      const hasMoreComments = comments.length < totalComments
      
      const [actResult, cmtResult] = await Promise.all([
        hasMoreActivities ? getCardActivitiesAPI(cardId, nextPage, ITEMS_PER_PAGE) : Promise.resolve({ activities: [], total: totalActivities }),
        hasMoreComments ? getCardCommentsAPI(cardId, nextPage, ITEMS_PER_PAGE) : Promise.resolve({ comments: [], total: totalComments })
      ])
      
      if (hasMoreActivities) {
        setActivities(prev => [...prev, ...(actResult.activities || [])])
        setTotalActivities(actResult.total || 0)
      }
      
      if (hasMoreComments) {
        setComments(prev => [...prev, ...(cmtResult.comments || [])])
        setTotalComments(cmtResult.total || 0)
      }
      
      setPage(nextPage)
    } catch (error) {
      console.error('Failed to load more data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch page 1 khi mount
  useEffect(() => {
    fetchFirstPage()
  }, [fetchFirstPage])

  // ===== SOCKET.IO REAL-TIME =====
  // Join/Leave Room + Lắng nghe 3 events: new, update, delete comment
  useEffect(() => {
    if (!cardId) return

    // 1. Mở modal → join phòng của Card này
    socketIoInstance.emit('FE_JOIN_CARD', cardId)

    // 2. Lắng nghe comment mới từ user khác
    const onNewComment = (newComment) => {
      // Check trùng _id để tránh user gửi bị double render (HTTP response + socket)
      setComments(prev => {
        const alreadyExists = prev.some(c => c._id === newComment._id)
        if (alreadyExists) return prev
        return [newComment, ...prev]
      })
      setTotalComments(prev => prev + 1)
    }

    // 3. Lắng nghe comment được chỉnh sửa
    const onCommentUpdated = (updatedComment) => {
      setComments(prev => prev.map(c =>
        c._id === updatedComment._id
          ? { ...c, content: updatedComment.content, updatedAt: updatedComment.updatedAt }
          : c
      ))
    }

    // 4. Lắng nghe comment bị xóa
    const onCommentDeleted = ({ commentId, parentId }) => {
      if (parentId) {
        // Là reply bị xóa → giảm replyCount của comment gốc, không cần xóa khỏi comments list (replies quản lý riêng trong CommentItem)
        setComments(prev => prev.map(c =>
          c._id === parentId
            ? { ...c, replyCount: Math.max(0, (c.replyCount || 0) - 1) }
            : c
        ))
      } else {
        // Là comment gốc bị xóa → filter bỏ khỏi mảng
        setComments(prev => prev.filter(c => c._id !== commentId))
      }
      setTotalComments(prev => Math.max(0, prev - 1))
    }

    socketIoInstance.on('BE_NEW_COMMENT', onNewComment)
    socketIoInstance.on('BE_COMMENT_UPDATED', onCommentUpdated)
    socketIoInstance.on('BE_COMMENT_DELETED', onCommentDeleted)

    // 5. Cleanup: đóng modal → rời phòng, hủy lắng nghe
    return () => {
      socketIoInstance.emit('FE_LEAVE_CARD', cardId)
      socketIoInstance.off('BE_NEW_COMMENT', onNewComment)
      socketIoInstance.off('BE_COMMENT_UPDATED', onCommentUpdated)
      socketIoInstance.off('BE_COMMENT_DELETED', onCommentDeleted)
    }
  }, [cardId])

  // Còn data để load không?
  const hasMore = (activities.length < totalActivities) || (comments.length < totalComments)

  const handleAddCardComment = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!event.target?.value.trim()) return

      const content = event.target.value.trim()
      try {
        await createCommentAPI({ cardId, content, parentId: null })
        event.target.value = ''
        fetchFirstPage()
      } catch (error) {
        console.error('Lỗi khi đăng comment:', error)
      }
    }
  }

  /**
   * Merge comments + activities thành 1 mảng chung, sort theo thời gian (mới nhất trước).
   */
  const mergedFeed = (() => {
    const normalizedComments = comments.map((comment) => ({
      ...comment,
      _type: 'COMMENT',
      _timestamp: comment.createdAt,
      _key: `comment-${comment._id}`
    }))

    const normalizedActivities = activities.map((activity) => ({
      ...activity,
      _type: activity.actionType,
      _timestamp: activity.createdAt,
      _key: `activity-${activity._id}`
    }))

    return [...normalizedComments, ...normalizedActivities].sort((a, b) => {
      return new Date(b._timestamp) - new Date(a._timestamp)
    })
  })()

  // Render một dòng System Log (nhỏ gọn, nhạt màu)
  const renderSystemLog = (item) => {
    const IconComponent = ACTION_TYPE_ICONS[item._type] || AccessTimeIcon
    return (
      <Box
        key={item._key}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0.5,
          mb: 1,
          pl: '45px'
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
          <IconComponent sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {item.userDisplayName}
            </Box>
            {' '}{item.content}
            {item.metadata?.newDate && ` thành ${dayjs(item.metadata.newDate).format('DD/MM/YYYY')}`}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px', fontStyle: 'italic' }}>
            {' · '}{dayjs(item._timestamp).fromNow()}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header và Nút Toggle Show/Hide Details */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DvrOutlinedIcon />
          <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Activity</Typography>
        </Box>
        {totalActivities > 0 && (
          <Button
            size="small"
            variant="text"
            onClick={() => setShowDetails(!showDetails)}
            sx={{
              textTransform: 'none',
              fontSize: '12px',
              color: 'text.secondary',
              '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f' }
            }}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        )}
      </Box>

      {/* Xử lý thêm comment vào Card */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar
          sx={{ width: 36, height: 36, cursor: 'pointer' }}
          alt="User"
          src={currentUser?.avatar}
        />
        <TextField
          fullWidth
          placeholder="Write a comment..."
          type="text"
          variant="outlined"
          multiline
          onKeyDown={handleAddCardComment}
        />
      </Box>

      {/* Khu vực Activity cuộn được - fix chiều cao tránh Card dài vô tận */}
      <Box sx={{
        maxHeight: '400px',
        overflowY: 'auto',
        pr: 0.5,
        // Custom scrollbar cho đẹp
        '&::-webkit-scrollbar': { width: '6px' },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#555' : '#c1c1c1',
          borderRadius: '3px'
        }
      }}>
        {/* Hiển thị merged feed */}
        {mergedFeed.length === 0 && !loading &&
          <Typography sx={{ pl: '45px', fontSize: '14px', fontWeight: '500', color: '#b1b1b1' }}>No activity found!</Typography>
        }
        
        {mergedFeed.map((item) => {
          if (item._type === 'COMMENT') {
            return <CommentItem key={item._key} rootComment={item} cardId={cardId} currentUser={currentUser} onNewCommentRefetch={fetchFirstPage} />
          }
          if (!showDetails) return null
          return renderSystemLog(item)
        })}

        {/* Nút Load More */}
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 1 }}>
            <Button
              size="small"
              variant="text"
              onClick={fetchMoreData}
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontSize: '13px',
                color: 'text.secondary',
                '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f' }
              }}
            >
              {loading ? (
                <CircularProgress size={16} sx={{ mr: 1 }} />
              ) : null}
              {loading ? 'Đang tải...' : 'Xem thêm hoạt động'}
            </Button>
          </Box>
        )}

        {/* Loading indicator khi fetch lần đầu */}
        {loading && activities.length === 0 && comments.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CardActivitySection
