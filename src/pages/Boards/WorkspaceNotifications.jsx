import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import { toast } from 'sonner'
import { updateWorkspaceNotificationsAPI } from '~/apis'

// Giá trị mặc định (khớp default phía backend) — dùng khi member chưa có prefs riêng
const DEFAULT_NOTIF_PREFS = {
  memberJoins: true,
  boardChanges: true,
  mentions: true
}

// Cấu hình các nhóm tuỳ chọn — data-driven để không lặp markup và dễ thêm loại mới sau này
const NOTIFICATION_GROUPS = [
  {
    id: 'email',
    title: 'Email',
    items: [
      { key: 'memberJoins', label: 'New member joins', desc: 'When someone accepts an invite to this workspace.' }
    ]
  },
  {
    id: 'inApp',
    title: 'In-app',
    items: [
      { key: 'boardChanges', label: 'Board created or deleted', desc: 'When a board is added to or removed from this workspace.' },
      { key: 'mentions', label: 'Mentions', desc: 'When someone @mentions you in a card or comment.' }
    ]
  }
]

const rowBorderColor = (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')

/**
 * Tuỳ chọn thông báo của chính user trong một workspace.
 * - Mỗi member tự quản lý prefs của mình nên không cần phân quyền theo role.
 * - Lưu tức thì kiểu optimistic: bật/tắt hiển thị ngay, gọi API nền, revert đúng
 *   switch bị lỗi. Trong lúc chờ API thì disable switch đó để chặn spam/race.
 */
export const WorkspaceNotifications = ({ workspaceId, myPrefs, onSaved }) => {
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_NOTIF_PREFS, ...(myPrefs || {}) }))
  // map { [key]: true } cho các switch đang chờ API
  const [savingKeys, setSavingKeys] = useState({})

  // Cờ "đang có save dở" đọc bằng ref để effect đồng bộ không cần phụ thuộc savingKeys
  const hasPendingRef = useRef(false)
  useEffect(() => { hasPendingRef.current = Object.keys(savingKeys).length > 0 }, [savingKeys])

  // Đồng bộ lại khi đổi workspace hoặc prefs từ server thay đổi.
  // Bỏ qua khi đang có save dở để không ghi đè giá trị optimistic của switch khác.
  const myPrefsKey = JSON.stringify(myPrefs || null)
  useEffect(() => {
    if (hasPendingRef.current) return
    setPrefs({ ...DEFAULT_NOTIF_PREFS, ...(myPrefs || {}) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, myPrefsKey])

  const handleToggle = async (key) => {
    // Đang lưu key này rồi thì bỏ qua click tiếp (chặn double-toggle race)
    if (savingKeys[key]) return

    const prevValue = prefs[key]
    const next = { ...prefs, [key]: !prevValue }
    setPrefs(next)
    setSavingKeys(s => ({ ...s, [key]: true }))

    try {
      await updateWorkspaceNotificationsAPI(workspaceId, next)
      onSaved?.(next)
    } catch (error) {
      // Chỉ revert đúng key bị lỗi, không đụng key khác có thể vừa đổi song song
      setPrefs(p => ({ ...p, [key]: prevValue }))
      toast.error('Error: ' + (error?.message || 'Failed to update notifications'))
    } finally {
      setSavingKeys(s => {
        const nextSaving = { ...s }
        delete nextSaving[key]
        return nextSaving
      })
    }
  }

  return (
    <Box id="settings-notifications" sx={{
      p: 3, borderRadius: 2, border: '1px solid',
      borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'),
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff')
    }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>Notifications</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Choose which updates from this workspace you want to be notified about.
      </Typography>

      {NOTIFICATION_GROUPS.map((group, gIdx) => (
        <Box key={group.id} sx={{ mb: gIdx < NOTIFICATION_GROUPS.length - 1 ? 3 : 0 }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {group.title}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
            {group.items.map((item, idx, arr) => {
              const isSaving = !!savingKeys[item.key]
              return (
                <Box key={item.key} sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5,
                  borderBottom: idx < arr.length - 1 ? '1px solid' : 'none',
                  borderColor: rowBorderColor
                }}>
                  <Box sx={{ pr: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{item.label}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    {isSaving && <CircularProgress size={14} thickness={5} sx={{ color: 'text.secondary' }} />}
                    <Switch
                      checked={!!prefs[item.key]}
                      onChange={() => handleToggle(item.key)}
                      disabled={isSaving}
                      inputProps={{ 'aria-label': item.label }}
                    />
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
