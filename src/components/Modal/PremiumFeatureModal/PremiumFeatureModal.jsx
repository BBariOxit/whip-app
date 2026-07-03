import CloseIcon from '@mui/icons-material/Close'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'

/**
 * Modal placeholder dùng chung cho các tính năng "Pro" chưa mở (Drive, Automation, Power-Ups...).
 * Dùng: <PremiumFeatureModal isOpen={Boolean(feature)} onClose={...} featureName={feature} />
 */
function PremiumFeatureModal({ isOpen, onClose, featureName = 'This feature' }) {
  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="premium-feature-modal-title">
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 380,
        maxWidth: 'calc(100vw - 32px)',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#22272e' : '#fff',
        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#30363d' : '#e1e4e8'}`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
        borderRadius: '12px',
        p: 3,
        outline: 'none'
      }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            bgcolor: 'rgba(139, 92, 246, 0.12)',
            color: '#8b5cf6'
          }}>
            <RocketLaunchIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography id="premium-feature-modal-title" sx={{ fontWeight: 600, fontSize: '15px' }}>
                {featureName}
              </Typography>
              <Chip
                label="PRO"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  bgcolor: 'rgba(227, 179, 65, 0.15)',
                  color: '#e3b341'
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Not available on the Free plan
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          This feature is coming to the Pro plan soon. Stay tuned!
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>
          <Button
            size="small"
            variant="contained"
            onClick={onClose}
            sx={{
              px: 2.5,
              fontWeight: 600,
              boxShadow: 'none',
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb', boxShadow: 'none' }
            }}
          >
            Got it
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default PremiumFeatureModal
