import { useState, useRef, useEffect, useMemo } from 'react'
import TextField from '@mui/material/TextField'
import Popper from '@mui/material/Popper'
import Paper from '@mui/material/Paper'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Bắt "@query" đang gõ ngay trước con trỏ (đầu dòng hoặc sau khoảng trắng để tránh dính email)
const MENTION_QUERY_REGEX = /(^|\s)@([\p{L}\p{N}._-]*)$/u
const MAX_SUGGESTIONS = 8

/**
 * TextField có gợi ý @mention: gõ "@" hiện danh sách member board, gõ tiếp để lọc,
 * ↑/↓ chọn, Tab/Enter/click để chèn. Luôn chèn "@username" (1 token) để backend
 * match được (displayName nhiều từ sẽ không khớp phía BE).
 *
 * Là controlled component: truyền value + onChange(newValue). Các prop TextField
 * khác (placeholder, multiline, size, disabled, inputProps...) được truyền thẳng.
 */
function MentionTextarea({ value, onChange, members = [], excludeId, onKeyDown, ...textFieldProps }) {
  const inputRef = useRef(null)
  const anchorRef = useRef(null)
  // { query, atIndex } khi đang gõ mention, null khi không
  const [mention, setMention] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  // Vị trí con trỏ cần đặt lại sau khi chèn mention (value được điều khiển từ ngoài)
  const pendingCaretRef = useRef(null)

  const suggestions = useMemo(() => {
    if (!mention) return []
    const q = mention.query.toLowerCase()
    const seen = new Set()
    const out = []
    // Mục đặc biệt "@all": báo cho toàn bộ thành viên board
    if ('all'.includes(q)) {
      out.push({ _id: '__all__', username: 'all', displayName: 'Everyone on this board' })
    }
    for (const m of members) {
      if (!m?.username || !m?._id) continue
      const id = String(m._id)
      if (seen.has(id) || (excludeId && id === String(excludeId))) continue
      seen.add(id)
      const handles = [m.username, m.displayName, m.email?.split('@')[0]]
        .filter(Boolean)
        .map(s => s.toLowerCase())
      if (q === '' || handles.some(h => h.includes(q))) out.push(m)
    }
    return out.slice(0, MAX_SUGGESTIONS)
  }, [mention, members, excludeId])

  const open = !!mention && suggestions.length > 0

  // Đặt lại con trỏ sau khi chèn mention
  useEffect(() => {
    if (pendingCaretRef.current != null && inputRef.current) {
      const pos = pendingCaretRef.current
      pendingCaretRef.current = null
      inputRef.current.selectionStart = pos
      inputRef.current.selectionEnd = pos
    }
  }, [value])

  const detectMention = (text, caret) => {
    const before = text.slice(0, caret)
    const match = before.match(MENTION_QUERY_REGEX)
    if (!match) return null
    const query = match[2]
    return { query, atIndex: caret - query.length - 1 }
  }

  const handleChange = (e) => {
    const text = e.target.value
    onChange(text)
    const caret = e.target.selectionStart ?? text.length
    setMention(detectMention(text, caret))
    setActiveIndex(0)
  }

  const applyMention = (member) => {
    if (!member || !mention || !inputRef.current) return
    const caret = inputRef.current.selectionStart ?? value.length
    const insert = `@${member.username} `
    const before = value.slice(0, mention.atIndex)
    const after = value.slice(caret)
    pendingCaretRef.current = (before + insert).length
    onChange(before + insert + after)
    setMention(null)
  }

  const handleKeyDown = (e) => {
    if (open) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => (i + 1) % suggestions.length); return }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applyMention(suggestions[activeIndex]); return }
      if (e.key === 'Escape') { e.preventDefault(); setMention(null); return }
    }
    onKeyDown?.(e)
  }

  return (
    <Box ref={anchorRef} sx={{ position: 'relative', width: '100%' }}>
      <TextField
        {...textFieldProps}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        // Click ra ngoài input sẽ đóng gợi ý; chọn item dùng onMouseDown nên không bị blur
        onBlur={() => setMention(null)}
      />
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1500 }}
      >
        <Paper
          elevation={0}
          sx={{
            mt: 0.75,
            width: 280,
            maxHeight: 256,
            overflowY: 'auto',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#e1e4e8',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f242c' : '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.24)',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#555' : '#c1c1c1',
              borderRadius: '3px'
            }
          }}
        >
          <MenuList dense disablePadding sx={{ p: 0.75 }}>
            {suggestions.map((m, idx) => (
              <MenuItem
                key={m._id}
                selected={idx === activeIndex}
                onMouseEnter={() => setActiveIndex(idx)}
                // onMouseDown + preventDefault: chọn mà không làm input mất focus
                onMouseDown={(e) => { e.preventDefault(); applyMention(m) }}
                sx={{
                  gap: 1.25,
                  py: 0.75,
                  px: 1,
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.16)' : 'rgba(59,130,246,0.1)'
                  },
                  '&.Mui-selected:hover': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.24)' : 'rgba(59,130,246,0.16)'
                  }
                }}
              >
                <Avatar src={m.avatar} sx={{ width: 28, height: 28, fontSize: 13 }}>
                  {(m.displayName || m.username || '?').charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600, lineHeight: 1.25 }}>
                    {m.displayName || m.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>@{m.username}</Typography>
                </Box>
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      </Popper>
    </Box>
  )
}

export default MentionTextarea
