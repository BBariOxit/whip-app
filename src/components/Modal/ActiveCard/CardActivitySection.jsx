import { useState, useEffect, useCallback, useRef } from 'react'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
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
import { getCardActivitiesAPI } from '~/apis'

const ACTIVITIES_PER_PAGE = 10

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

function CardActivitySection({ cardComments = [], onAddCardComment, cardId }) {
  const currentUser = useSelector(selectCurrentUser)
  const [activities, setActivities] = useState([])
  const [showDetails, setShowDetails] = useState(false)
  const [page, setPage] = useState(1)
  const [totalActivities, setTotalActivities] = useState(0)
  const [loading, setLoading] = useState(false)

  // Dùng ref để track cardComments length trước đó, tránh re-fetch loop
  const prevCommentsLengthRef = useRef(cardComments.length)

  // Fetch activities page 1 (reset) — dùng khi mở modal hoặc khi có action mới
  const fetchFirstPage = useCallback(async () => {
    if (!cardId) return
    try {
      setLoading(true)
      const result = await getCardActivitiesAPI(cardId, 1, ACTIVITIES_PER_PAGE)
      setActivities(result.activities || [])
      setTotalActivities(result.total || 0)
      setPage(1)
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }, [cardId])

  // Fetch thêm activities (Load More) — NỐI MẢNG
  const fetchMoreActivities = async () => {
    if (!cardId || loading) return
    try {
      setLoading(true)
      const nextPage = page + 1
      const result = await getCardActivitiesAPI(cardId, nextPage, ACTIVITIES_PER_PAGE)
      // Nối đít vào mảng hiện tại
      setActivities(prev => [...prev, ...(result.activities || [])])
      setTotalActivities(result.total || 0)
      setPage(nextPage)
    } catch (error) {
      console.error('Failed to load more activities:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch page 1 khi mount
  useEffect(() => {
    fetchFirstPage()
  }, [fetchFirstPage])

  // Re-fetch page 1 khi cardComments thay đổi (có action mới từ Redux)
  useEffect(() => {
    if (prevCommentsLengthRef.current !== cardComments.length) {
      prevCommentsLengthRef.current = cardComments.length
      fetchFirstPage()
    }
  }, [cardComments, fetchFirstPage])

  // Còn data để load không?
  const hasMore = activities.length < totalActivities

  const handleAddCardComment = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!event.target?.value) return

      const commentToAdd = {
        userAvatar: currentUser?.avatar,
        userDisplayName: currentUser?.displayName,
        content: event.target.value.trim()
      }

      onAddCardComment(commentToAdd).then(() => {
        event.target.value = ''
        fetchFirstPage()
      })
    }
  }

  /**
   * Merge comments + activities thành 1 mảng chung, sort theo thời gian (mới nhất trước).
   */
  const mergedFeed = (() => {
    const normalizedComments = cardComments.map((comment, index) => ({
      ...comment,
      _type: 'COMMENT',
      _timestamp: comment.commentedAt,
      _key: `comment-${index}`
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

  // Render một Comment (UI bubble to)
  const renderComment = (item) => {
    return (
      <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 1.5 }} key={item._key}>
        <Tooltip title={item.userDisplayName}>
          <Avatar
            sx={{ width: 36, height: 36, cursor: 'pointer' }}
            alt={item.userDisplayName}
            src={item.userAvatar}
          />
        </Tooltip>
        <Box sx={{ width: 'inherit' }}>
          <Typography variant="span" sx={{ fontWeight: 'bold', mr: 1 }}>
            {item.userDisplayName}
          </Typography>

          <Typography variant="span" sx={{ fontSize: '12px' }}>
            {dayjs(item._timestamp).format('llll')}
          </Typography>

          <Box sx={{
            display: 'block',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : 'white',
            p: '8px 12px',
            mt: '4px',
            border: '0.5px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            wordBreak: 'break-word',
            boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)'
          }}>
            {item.content}
          </Box>
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
            return renderComment(item)
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
              onClick={fetchMoreActivities}
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
        {loading && activities.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default CardActivitySection
