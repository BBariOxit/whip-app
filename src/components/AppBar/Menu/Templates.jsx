import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { fetchTemplatesAPI, cloneTemplateAPI } from '~/apis'
import { getBoardThumbnailBackground } from '~/utils/formatters'

function Templates() {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [templates, setTemplates] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  // id của template đang được clone -> chặn double-click và hiển thị spinner
  const [cloningId, setCloningId] = React.useState(null)
  const open = Boolean(anchorEl)
  const navigate = useNavigate()

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget)
    setLoading(true)
    try {
      const res = await fetchTemplatesAPI()
      setTemplates(res || [])
    } catch (error) {
      // Lỗi request đã được toast tập trung ở interceptor authorizeAxios
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (cloningId) return // Đang clone thì chưa cho đóng
    setAnchorEl(null)
  }

  // Click template -> clone thành board mới (personal, user làm chủ) -> nhảy vào board đó
  const handleUseTemplate = async (templateId) => {
    if (cloningId) return
    setCloningId(templateId)
    try {
      const res = await cloneTemplateAPI(templateId)
      toast.success('Board created from template!')
      setAnchorEl(null)
      navigate(`/boards/${res.newBoardId}`)
    } catch (error) {
      toast.error('Failed to create board from template!')
    } finally {
      setCloningId(null)
    }
  }

  const handleBrowseAll = () => {
    setAnchorEl(null)
    navigate('/boards?view=templates')
  }

  return (
    <Box>
      <Button
        sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#475569' }}
        id="basic-button-templates"
        aria-controls={open ? 'basic-menu-templates' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        Templates
      </Button>
      <Menu
        id="basic-menu-templates"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button-templates', sx: { py: 0 } }}
        PaperProps={{ sx: { width: 320, maxHeight: 460, borderRadius: '10px', mt: 1 } }}
      >
        <Typography sx={{ px: 2, pt: 1.5, pb: 1, fontSize: '12px', color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Start with a template
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2.5 }}>
            <CircularProgress size={24} />
          </Box>
        ) : templates.length === 0 ? (
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <DashboardCustomizeOutlinedIcon sx={{ color: 'text.secondary', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              No templates available yet.
            </Typography>
          </Box>
        ) : (
          templates.map(template => {
            const isCloning = cloningId === template._id
            return (
              <MenuItem
                key={template._id}
                onClick={() => handleUseTemplate(template._id)}
                disabled={Boolean(cloningId) && !isCloning}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1 }}
              >
                {/* Thumbnail nền template */}
                <Box sx={{
                  width: 40,
                  height: 32,
                  borderRadius: 1,
                  flexShrink: 0,
                  background: getBoardThumbnailBackground(template.background)
                }} />

                {/* Tên + mô tả */}
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {template.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {template.description || 'No description'}
                  </Typography>
                </Box>

                {isCloning && <CircularProgress size={16} sx={{ flexShrink: 0 }} />}
              </MenuItem>
            )
          })
        )}

        {/* Footer: full-width, flush đáy, hover fill cả hàng, màu trung tính (không dùng xanh chói) */}
        <Box
          onClick={cloningId ? undefined : handleBrowseAll}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.75,
            cursor: cloningId ? 'default' : 'pointer',
            opacity: cloningId ? 0.5 : 1,
            color: 'text.secondary',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
            transition: 'background-color 0.15s ease, color 0.15s ease',
            '&:hover': cloningId ? {} : {
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              color: 'text.primary'
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Browse all templates
          </Typography>
          <ArrowForwardIcon fontSize="small" />
        </Box>
      </Menu>
    </Box>
  )
}

export default Templates
