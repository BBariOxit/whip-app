import Box from '@mui/material/Box'
import Card from './Card/Card'

function ListCard() {
  return (
    <Box sx={{
      p: '0 5px',
      m: '0 5px',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      overflowX: 'hidden',
      overflowY: 'auto',
      maxHeight: (theme) => `calc(
      ${theme.trello.boardContentHeight} -
      ${theme.spacing(5)} -
      ${theme.trello.columnHeaderHeight} -
      ${theme.trello.columnFooterHeight}
      )`,
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#868e96ff' : '#B6C2CF')
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#a6a7b0ff' : '#9199a0ff')
      }
    }}>
      <Card />
      <Card temporaryHiddenMedia/>
      <Card temporaryHiddenMedia/>
      <Card temporaryHiddenMedia/>
      <Card temporaryHiddenMedia/>
      <Card temporaryHiddenMedia/>
      <Card temporaryHiddenMedia/>
      <Card temporaryHiddenMedia/>
      <Card temporaryHiddenMedia/>
      <Card temporaryHiddenMedia/>
      <Card temporaryHiddenMedia/>
    </Box>
  )
}

export default ListCard