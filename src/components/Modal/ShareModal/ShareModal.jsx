import { useRef } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import CloseIcon from '@mui/icons-material/Close'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'

export const ShareModal = ({ isOpen, onClose, shareUrl, title, type = 'Board' }) => {
  const qrRef = useRef(null)

  // 1. Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success(`${type} link copied to clipboard!`)
  }

  // 2. Tải ảnh QR Code (Convert từ SVG sang PNG)
  const handleDownloadQR = () => {
    const svg = document.getElementById('share-qr-code')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Thêm viền trắng (Padding) 40px cho đẹp và dễ quét
      canvas.width = img.width + 40
      canvas.height = img.height + 40
      ctx.fillStyle = '#ffffff' 
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 20, 20)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `QR_${type}_${title.replace(/\s+/g, '_')}.png` // Tên file tải về
      downloadLink.href = pngFile
      downloadLink.click()
      toast.success('QR Code downloaded successfully!')
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Share {type}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, pt: 3 }}>
        
        {/* Tên Board/Card đang share */}
        <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>
          {title}
        </Typography>

        {/* Cục QR Code nền trắng */}
        <Box sx={{ bgcolor: '#fff', padding: 2, borderRadius: 2, display: 'flex', justifyContent: 'center' }}>
          <QRCodeSVG 
            id="share-qr-code"
            value={shareUrl} 
            size={220}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"} // Chuẩn H: Quét cực nhạy lỡ có bị mờ góc
          />
        </Box>

        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadQR} sx={{ textTransform: 'none', '&:hover': { boxShadow: '0 0 0 1px currentColor' } }}>
          Download QR
        </Button>

        {/* Link box */}
        <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={shareUrl}
            slotProps={{ input: { readOnly: true } }}
          />
          <Button variant="contained" onClick={handleCopyLink} sx={{ minWidth: '40px', p: 0 }}>
            <ContentCopyIcon fontSize="small" />
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ShareModal
