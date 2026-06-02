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
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'

// Icons cho system log
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LabelIcon from '@mui/icons-material/Label'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import ImageIcon from '@mui/icons-material/Image'
import EventIcon from '@mui/icons-material/Event'

import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { getCardActivitiesAPI } from '~/apis'

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

  // Fetch activities từ API khi component mount hoặc cardId thay đổi
  const fetchActivities = useCallback(async () => {
    if (!cardId) return
    try {
      const data = await getCardActivitiesAPI(cardId)
      setActivities(data || [])
    } catch (error) {
      // Không throw lỗi, chỉ log ra console
      console.error('Failed to fetch activities:', error)
    }
  }, [cardId])

  // Re-fetch activities khi cardComments thay đổi (tức là có update card từ Redux)
  useEffect(() => {
    fetchActivities()
  }, [fetchActivities, cardComments])

  const handleAddCardComment = (event) => {
    // Bắt hành động người dùng nhấn phím Enter && không phải hành động Shift + Enter
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Thêm dòng này để khi Enter không bị nhảy dòng
      if (!event.target?.value) return // Nếu không có giá trị gì thì return không làm gì cả

      // Tạo một biến commend data để gửi api
      const commentToAdd = {
        userAvatar: currentUser?.avatar,
        userDisplayName: currentUser?.displayName,
        content: event.target.value.trim()
      }

      onAddCardComment(commentToAdd).then(() => {
        event.target.value = ''
        // Re-fetch activities sau khi thêm comment (vì có thể server ghi log liên quan)
        fetchActivities()
      })
    }
  }

  /**
   * Merge comments + activities thành 1 mảng chung, sort theo thời gian (mới nhất trước).
   * - Comment có trường `commentedAt` và type = 'COMMENT'
   * - Activity có trường `createdAt` và type = actionType
   */
  const mergedFeed = (() => {
    // Chuẩn hóa comments
    const normalizedComments = cardComments.map((comment, index) => ({
      ...comment,
      _type: 'COMMENT',
      _timestamp: comment.commentedAt,
      _key: `comment-${index}`
    }))

    // Chuẩn hóa activities
    const normalizedActivities = activities.map((activity) => ({
      ...activity,
      _type: activity.actionType,
      _timestamp: activity.createdAt,
      _key: `activity-${activity._id}`
    }))

    // Merge và sort theo thời gian giảm dần (mới nhất trước)
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

  // Render một Comment (UI bubble to, giữ nguyên style cũ)
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
      {/* Nút Toggle Show/Hide Details */}
      {activities.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
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
        </Box>
      )}

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

      {/* Hiển thị merged feed: comments + system logs */}
      {mergedFeed.length === 0 &&
        <Typography sx={{ pl: '45px', fontSize: '14px', fontWeight: '500', color: '#b1b1b1' }}>No activity found!</Typography>
      }
      {mergedFeed.map((item) => {
        // Comment: luôn hiện
        if (item._type === 'COMMENT') {
          return renderComment(item)
        }

        // System log: chỉ hiện khi showDetails === true
        if (!showDetails) return null
        return renderSystemLog(item)
      })}
    </Box>
  )
}

export default CardActivitySection
