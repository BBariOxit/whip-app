import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { cloneTemplateAPI } from '~/apis'
import { toast } from 'sonner'
import { useState } from 'react'

const GRADIENTS = [
  'linear-gradient(to right, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
  'linear-gradient(to right, #a8caba 0%, #5d4157 100%)',
  'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)'
]

export const TemplateCard = ({ template, index }) => {
  const navigate = useNavigate()
  const [isCloning, setIsCloning] = useState(false)

  const handleCloneTemplate = async () => {
    if (isCloning) return
    setIsCloning(true)
    try {
      const res = await cloneTemplateAPI(template._id)
      toast.success('Template cloned successfully!')
      navigate(`/boards/${res.newBoardId}`)
    } catch (error) {
      toast.error('Failed to clone template!')
    } finally {
      setIsCloning(false)
    }
  }

  return (
    <Card sx={{ 
      width: '100%',
      height: '180px',
      borderRadius: '16px',
      boxShadow: (theme) => theme.palette.mode === 'dark' 
        ? '0 4px 20px rgba(0,0,0,0.5)' 
        : '0 4px 20px rgba(0,0,0,0.05)',
      border: '1px solid',
      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      opacity: isCloning ? 0.7 : 1,
      pointerEvents: isCloning ? 'none' : 'auto',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 12px 28px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)'
          : '0 12px 28px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)'
      }
    }}>
      <CardActionArea 
        onClick={handleCloneTemplate}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch', 
          justifyContent: 'flex-start'
        }}
      >
        <Box sx={{ 
          height: '100px', 
          background: template?.background ? 
            (template.background.type === 'gradient' ? `linear-gradient(135deg, ${template.background.color1} 0%, ${template.background.color2} 100%)` : template.background.color1)
            : GRADIENTS[index % GRADIENTS.length],
          position: 'relative',
          flexShrink: 0
        }}>

        </Box>

        <CardContent sx={{ 
          p: 1.5, 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          '&:last-child': { pb: 1.5 },
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e2125' : '#ffffff'
        }}>
          <Typography gutterBottom variant="h6" component="div" sx={{
            fontWeight: 700,
            fontSize: '1rem',
            mb: 0.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.2,
            minHeight: '2.4em'
          }}>
            {template?.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              overflow: 'hidden', 
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.5,
              minHeight: '1.5em'
            }}>
            {template?.description || 'No description provided'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
