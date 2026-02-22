import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import CloseIcon from '@mui/icons-material/Close'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { Button } from '@mui/material'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import Column from './Column/Column'

function ListColumns({ columns }) {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toogleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const [newColumntitle, setNewColumntitle] = useState('')

  const addNewColumn = () => {
    if (!newColumntitle) {
      // console.error('please enter column title')
      return
    }
    // console.log(newColumntitle)
    // gọi API ở đây

    // đóng trạng thái thêm column mới và clear input
    toogleOpenNewColumnForm()
    setNewColumntitle('')
  }
  /**
   * Thằng SortableContext yêu cầu items là một mảng dạng ['id-1', 'id-2'] chứ không phải [{id: 'id-1'}, {id: 'id-2'}]
   * Nếu không đúng thì vẫn kéo thả được nhưng không có animation
   * https://github.com/clauderic/dnd-kit/issues/183#issuecomment-812569512
   */
  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box sx={{
        bgcolor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        {columns?.map(column => {
          return <Column key={column._id} column={column}/>
        })}

        {/* Box add new column */}
        {!openNewColumnForm
          ? <Box onClick= {toogleOpenNewColumnForm} sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d'
          }}>
            <Button
              startIcon={<NoteAddIcon />}
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: 1
              }}
            >Add new column</Button>
          </Box>
          : <Box sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            p: 1,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#333643' : '#ebecf0',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <TextField
              label="Enter column title..."
              type="text"
              size='small'
              variant='outlined'
              autoFocus
              value={newColumntitle}
              onChange = {(e) => setNewColumntitle(e.target.value)}
              sx={{
                '& label': {
                  color: (theme) => theme.palette.mode === 'dark' ? '#B6C2CF' : '#333643'
                },
                '& input': {
                  color: (theme) => theme.palette.primary.main
                },
                '& label.Mui-focused': {
                  color: (theme) => theme.palette.mode === 'dark' ? '#B6C2CF' : '#333643'
                },
                '& .MuiOutlinedInput-root': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#B6C2CF' : '#333643',
                    transition: 'border-color 0.2s ease, border-width 0.2s ease'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333643',
                    borderWidth: '1px !important'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333643',
                    borderWidth: '1px !important'
                  }
                }
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                onClick={addNewColumn}
                variant='contained' color='primary' size='small'
                sx={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.primary.main
                  }
                }}
              >Add column</Button>
              <CloseIcon
                onClick= {toogleOpenNewColumnForm}
                sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? '#B6C2CF' : '#333643',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.7 }
                }}
                fontSize='small'
              />
            </Box>
          </Box>
        }
      </Box>
    </SortableContext>
  )
}

export default ListColumns