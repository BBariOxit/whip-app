import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import { useForm, Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { FIELD_REQUIRED_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import AbcIcon from '@mui/icons-material/Abc'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import Button from '@mui/material/Button'
import { createNewBoardAPI } from '~/apis'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import PublicIcon from '@mui/icons-material/Public'
import LockIcon from '@mui/icons-material/Lock'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import CheckIcon from '@mui/icons-material/Check'
import { styled } from '@mui/material/styles'
import { HexColorPicker } from 'react-colorful'
import Popover from '@mui/material/Popover'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.paper,
  padding: '12px 16px',
  borderRadius: '8px',
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'transparent' : theme.palette.divider}`,
  transition: 'all 0.15s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#334155' : '#f1f5f9'
  },
  '&.active': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#e0f2fe',
    fontWeight: 600,
    border: `1px solid ${theme.palette.mode === 'dark' ? 'transparent' : theme.palette.primary.light}`
  }
}))

const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

const PRESET_COLORS = ['#8a2387', '#e94057', '#f27121', '#3a7bd5', '#3a6073', '#00b4db', '#0083b0', '#11998e']

const SecurityCard = ({ icon, title, description, checked, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      flex: 1,
      p: 2,
      border: '1px solid',
      borderColor: checked ? '#58a6ff' : (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#e1e4e8',
      bgcolor: checked ? (theme) => theme.palette.mode === 'dark' ? 'rgba(88, 166, 255, 0.05)' : 'rgba(88, 166, 255, 0.1)' : (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f6f8fa',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      gap: 1.5,
      transition: 'all 0.2s',
      '&:hover': { borderColor: checked ? '#58a6ff' : '#444c56' }
    }}
  >
    <Box sx={{ color: checked ? '#58a6ff' : '#768390', mt: 0.5 }}>{icon}</Box>
    <Box>
      <Typography sx={{ fontWeight: 600, fontSize: '14px', color: checked ? (theme) => theme.palette.mode === 'dark' ? '#fff' : '#24292f' : (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a' }}>{title}</Typography>
      <Typography sx={{ fontSize: '12px', color: '#768390' }}>{description}</Typography>
    </Box>
  </Box>
)

export const ColorPickerInput = ({ label, color, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpen = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const open = Boolean(anchorEl)

  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: '12px', color: '#768390', mb: 1 }}>{label}</Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          onClick={handleOpen}
          sx={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            bgcolor: color,
            cursor: 'pointer',
            border: '2px solid #30363d',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'transform 0.1s',
            '&:hover': { transform: 'scale(1.05)', borderColor: '#444c56' }
          }}
        />
        
        <Typography sx={{ fontFamily: 'monospace', fontSize: '14px', color: '#adbac7', textTransform: 'uppercase' }}>
          {color}
        </Typography>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{
          '& .MuiPaper-root': {
            p: 1.5,
            bgcolor: '#1f242c',
            border: '1px solid #30363d',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }
        }}
      >
        <HexColorPicker color={color} onChange={onChange} />
      </Popover>
    </Box>
  )
}

export function BoardModalForm({ isOpen, handleClose, initialData, onSubmit, title, submitText }) {
  const { control, register, handleSubmit, reset, formState: { errors } } = useForm()

  const [color1, setColor1] = useState(PRESET_COLORS[0])
  const [color2, setColor2] = useState(PRESET_COLORS[1])
  const [isGradient, setIsGradient] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          description: initialData.description,
          type: initialData.type || BOARD_TYPES.PUBLIC
        })
        setColor1(initialData.background?.color1 || PRESET_COLORS[0])
        setColor2(initialData.background?.color2 || PRESET_COLORS[1])
        setIsGradient(initialData.background ? initialData.background.type === 'gradient' : false)
      } else {
        reset({ title: '', description: '', type: BOARD_TYPES.PUBLIC })
        setColor1(PRESET_COLORS[0])
        setColor2(PRESET_COLORS[1])
        setIsGradient(false)
      }
    }
  }, [isOpen, initialData, reset])

  const submitForm = (data) => {
    const finalData = {
      ...data,
      background: {
        type: isGradient ? 'gradient' : 'solid',
        color1,
        color2: isGradient ? color2 : undefined
      }
    }
    onSubmit(finalData)
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      onClick={(e) => {
        // Prevent click events from bubbling up (useful when modal is rendered inside a CardActionArea)
        e.stopPropagation()
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 540,
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#22272e' : '#fff',
        boxShadow: 24,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#e1e4e8',
        outline: 0,
        padding: '24px',
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-thumb': { borderRadius: '8px', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#e1e4e8' }
      }}
      onClick={(e) => e.stopPropagation()}
      >
        <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 16, right: 16, color: '#768390', '&:hover': { color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000' } }}>
          <CloseIcon />
        </IconButton>

        <Typography id="modal-modal-title" variant="h6" sx={{ fontWeight: 700, mb: 3, color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#24292f' }}>
          {title}
        </Typography>

        <Box id="modal-modal-description">
          <form onSubmit={handleSubmit(submitForm)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Board Title"
                  type="text"
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f6f8fa' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AbcIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  {...register('title', {
                    required: FIELD_REQUIRED_MESSAGE,
                    minLength: { value: 3, message: 'Min Length is 3 characters' },
                    maxLength: { value: 50, message: 'Max Length is 50 characters' }
                  })}
                  error={!!errors['title']}
                />
                <FieldErrorAlert errors={errors} fieldName={'title'} />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Description"
                  type="text"
                  variant="outlined"
                  multiline
                  minRows={3}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f6f8fa' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <DescriptionOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                  {...register('description', {
                    required: FIELD_REQUIRED_MESSAGE,
                    minLength: { value: 3, message: 'Min Length is 3 characters' },
                    maxLength: { value: 255, message: 'Max Length is 255 characters' }
                  })}
                  error={!!errors['description']}
                />
                <FieldErrorAlert errors={errors} fieldName={'description'} />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1, color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a' }}>Visibility</Typography>
                <Controller
                  name="type"
                  defaultValue={BOARD_TYPES.PUBLIC}
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <SecurityCard 
                        icon={<PublicIcon fontSize="small" />} 
                        title="Public" 
                        description="Anyone on the internet can see this board." 
                        checked={field.value === BOARD_TYPES.PUBLIC} 
                        onClick={() => field.onChange(BOARD_TYPES.PUBLIC)}
                      />
                      <SecurityCard 
                        icon={<LockIcon fontSize="small" />} 
                        title="Private" 
                        description="Only members added to the board can see it." 
                        checked={field.value === BOARD_TYPES.PRIVATE} 
                        onClick={() => field.onChange(BOARD_TYPES.PRIVATE)}
                      />
                    </Box>
                  )}
                />
              </Box>

              {/* KHU VỰC CHỌN MÀU NỀN */}
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1.5, color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a' }}>
                  Board Background
                </Typography>

                {/* Ô XEM TRƯỚC (PREVIEW) */}
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: '80px', 
                    borderRadius: '8px', 
                    mb: 2,
                    background: isGradient ? `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)` : color1,
                    transition: 'background 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />

                <ColorPickerInput 
                  label="Primary color (Color 1):" 
                  color={color1} 
                  onChange={setColor1} 
                />

                {/* CHECKBOX BẬT GRADIENT */}
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={isGradient} 
                      onChange={(e) => setIsGradient(e.target.checked)}
                      sx={{ color: '#768390', '&.Mui-checked': { color: '#58a6ff' } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: '13px', color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a' }}>Use gradient</Typography>}
                  sx={{ mb: 1 }}
                />

                {/* HÀNG CHỌN MÀU 2 (CHỈ HIỆN KHI BẬT GRADIENT) */}
                {isGradient && (
                  <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <ColorPickerInput 
                      label="Secondary color (Color 2):" 
                      color={color2} 
                      onChange={setColor2} 
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  className="interceptor-loading"
                  type="submit"
                  variant="contained"
                  sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, px: 4, py: 1, fontWeight: 600, borderRadius: '6px' }}
                >
                  {submitText}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Box>
    </Modal>
  )
}

function SidebarCreateBoardModal({ afterCreateNewBoard }) {
  const [isOpen, setIsOpen] = useState(false)
  const handleOpenModal = () => setIsOpen(true)
  const handleCloseModal = () => setIsOpen(false)

  const submitCreateNewBoard = (data) => {
    createNewBoardAPI(data).then(() => {
      handleCloseModal()
      afterCreateNewBoard()
    })
  }

  return (
    <>
      <SidebarItem onClick={handleOpenModal}>
        <LibraryAddIcon fontSize="small" />
        Create a new board
      </SidebarItem>

      <BoardModalForm 
        isOpen={isOpen}
        handleClose={handleCloseModal}
        onSubmit={submitCreateNewBoard}
        title="Create a new board"
        submitText="Create Board"
      />
    </>
  )
}

export default SidebarCreateBoardModal
