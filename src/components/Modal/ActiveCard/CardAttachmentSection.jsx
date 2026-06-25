import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useConfirm } from 'material-ui-confirm'

// Các format ảnh mà trình duyệt có thể hiển thị thumbnail
const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']

/**
 * Kiểm tra xem format có phải là ảnh hay không
 */
const isImageFormat = (format) => {
  return IMAGE_FORMATS.includes(format?.toLowerCase())
}

/**
 * Tạo URL thumbnail từ Cloudinary bằng cách chèn transform params vào URL
 * Ví dụ: .../upload/v123/file.jpg → .../upload/w_200,h_150,c_fill/v123/file.jpg
 */
const getCloudinaryThumbnailUrl = (url, width = 200, height = 150) => {
  if (!url) return ''
  const uploadIndex = url.indexOf('/upload/')
  if (uploadIndex === -1) return url
  const before = url.substring(0, uploadIndex + 8)
  const after = url.substring(uploadIndex + 8)
  return `${before}w_${width},h_${height},c_fill/${after}`
}

import { useSelector } from 'react-redux'
import { selectIsReadOnly } from '~/redux/activeBoard/activeBoardSlice'

function CardAttachmentSection({ attachments = [], onDeleteAttachment }) {
  const isReadOnly = useSelector(selectIsReadOnly)
  const confirmDelete = useConfirm()

  const handleDelete = (attachment) => {
    confirmDelete({
      title: 'Delete Attachment?',
      description: `Are you sure you want to delete "${attachment.filename}"? This action cannot be undone.`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel'
    }).then(() => {
      onDeleteAttachment(attachment.publicId)
    }).catch(() => {})
  }

  const handleDownload = (url, filename) => {
    window.open(url, '_blank')
  }

  if (!attachments?.length) return null

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <AttachFileOutlinedIcon />
        <Typography sx={{ fontWeight: '600', color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a' }}>
          Attachments
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 4 }}>
        {attachments.map((att, index) => (
          <Box
            key={att.publicId || index}
            sx={{
              display: 'flex',
              gap: 2,
              p: 1,
              borderRadius: '8px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f2f4',
              border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #d0d7de',
              transition: 'background-color 0.15s ease',
              '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#e4e6ea'
              }
            }}
          >
            {/* Thumbnail / File icon */}
            <Box
              sx={{
                width: 112,
                height: 80,
                borderRadius: '6px',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2230' : '#dfe1e6'
              }}
            >
              {isImageFormat(att.format) ? (
                <img
                  src={getCloudinaryThumbnailUrl(att.url)}
                  alt={att.filename}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    {att.format}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* File info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {att.filename}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.3 }}>
                Added {dayjs(att.createdAt).format('MMM D, YYYY [at] HH:mm')}
              </Typography>

            </Box>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {!isReadOnly && <Tooltip title="Download">
                <IconButton size="small" onClick={() => handleDownload(att.url, att.filename)}>
                  <DownloadOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>}
              {!isReadOnly && <Tooltip title="Delete">
                <IconButton size="small" onClick={() => handleDelete(att)} color="error">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default CardAttachmentSection
