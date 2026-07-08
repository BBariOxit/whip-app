import { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import HistoryIcon from '@mui/icons-material/History'

import { getWorkspaceActivitiesAPI } from '~/apis'

// Bảng màu icon badge — dùng lại tông màu của các card Settings khác
const PALETTE = {
  green: { color: '#2ea043', bg: 'rgba(46,160,67,0.15)' },
  red: { color: '#f85149', bg: 'rgba(248,81,73,0.15)' },
  blue: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  purple: { color: '#a371f7', bg: 'rgba(163,113,247,0.15)' },
  amber: { color: '#d29922', bg: 'rgba(210,153,34,0.15)' }
}

// Icon + màu cho từng actionType (khớp cấu trúc backend WORKSPACE_ACTIVITY_TYPES)
const ACTIVITY_META = {
  BOARD_CREATED: { icon: ViewColumnIcon, ...PALETTE.green },
  BOARD_DELETED: { icon: DeleteIcon, ...PALETTE.red },
  MEMBER_INVITED: { icon: PersonAddIcon, ...PALETTE.blue },
  MEMBER_JOINED: { icon: LoginIcon, ...PALETTE.green },
  MEMBER_LEFT: { icon: LogoutIcon, ...PALETTE.amber },
  MEMBER_REMOVED: { icon: PersonRemoveIcon, ...PALETTE.red },
  MEMBER_ROLE_CHANGED: { icon: ManageAccountsIcon, ...PALETTE.purple },
  SETTINGS_CHANGED: { icon: SettingsOutlinedIcon, ...PALETTE.purple },
  OWNERSHIP_TRANSFERRED: { icon: SwapHorizIcon, ...PALETTE.purple }
}

// Nhãn hiển thị cho giá trị settings — trùng với các option trong tab Settings (single source ở FE)
const SETTING_LABELS = {
  key: {
    visibility: 'visibility',
    invitePermission: 'invite permissions',
    boardCreation: 'board creation',
    boardDeletion: 'board deletion'
  },
  value: {
    visibility: { private: 'Private', public: 'Public' },
    invitePermission: { admin: 'Owner & Admin only', all: 'All members' },
    boardCreation: { all: 'All members', admin: 'Owner & Admin only' },
    boardDeletion: { admin: 'Owner & Admin only', all: 'All members' }
  }
}

const ROLE_LABELS = { owner: 'Owner', admin: 'Admin', member: 'Member' }

/**
 * Dựng câu hiển thị từ 1 activity: trả về { action, target }.
 * action = phần chữ thường, target = phần in đậm (đối tượng bị tác động). target có thể null.
 */
const describeActivity = (act) => {
  const meta = act.metadata || {}
  switch (act.actionType) {
    case 'BOARD_CREATED': return { action: 'created board', target: act.targetName }
    case 'BOARD_DELETED': return { action: 'deleted board', target: act.targetName }
    case 'MEMBER_INVITED': return { action: 'invited', target: act.targetName }
    case 'MEMBER_JOINED': return { action: 'joined the workspace', target: null }
    case 'MEMBER_LEFT': return { action: 'left the workspace', target: null }
    case 'MEMBER_REMOVED': return { action: 'removed', target: act.targetName }
    case 'MEMBER_ROLE_CHANGED': {
      const role = ROLE_LABELS[meta.newRole] || meta.newRole
      return { action: 'changed the role of', target: `${act.targetName} → ${role}` }
    }
    case 'OWNERSHIP_TRANSFERRED': return { action: 'transferred ownership to', target: act.targetName }
    case 'SETTINGS_CHANGED': {
      if (meta.settingKey === 'title') return { action: 'renamed the workspace to', target: act.targetName }
      if (meta.settingKey === 'logo') return { action: 'updated the workspace logo', target: null }
      const keyLabel = SETTING_LABELS.key[meta.settingKey] || 'a setting'
      const valueLabel = SETTING_LABELS.value[meta.settingKey]?.[meta.settingValue] || meta.settingValue
      return { action: `changed ${keyLabel} to`, target: valueLabel }
    }
    default: return { action: 'made a change', target: act.targetName }
  }
}

const INITIAL_LIMIT = 5
const EXPANDED_LIMIT = 30

/**
 * Activity Log của workspace — "camera an ninh" ghi lại các macro-event
 * (tạo/xoá board, mời/kick/đổi quyền member, đổi settings...).
 * Chỉ đọc; việc ghi log do backend tự thực hiện khi các hành động tương ứng xảy ra.
 */
export const WorkspaceActivityLog = ({ workspaceId, currentUserId }) => {
  const [activities, setActivities] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const fetchActivities = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    try {
      const limit = expanded ? EXPANDED_LIMIT : INITIAL_LIMIT
      const result = await getWorkspaceActivitiesAPI(workspaceId, 1, limit)
      setActivities(result.activities || [])
      setTotal(result.total || 0)
    } catch (error) {
      console.error('Failed to fetch workspace activities:', error)
    } finally {
      setLoading(false)
    }
  }, [workspaceId, expanded])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  const rowBorderColor = (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')

  return (
    <Box id="settings-activity" sx={{
      p: 3, borderRadius: 2, border: '1px solid',
      borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'),
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff')
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>Activity Log</Typography>
        {total > INITIAL_LIMIT && (
          <Button
            size="small"
            onClick={() => setExpanded(v => !v)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {expanded ? 'Show less' : 'View all'}
          </Button>
        )}
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Recent actions taken by members in this workspace.
      </Typography>

      {/* Loading lần đầu (chưa có dữ liệu) */}
      {loading && activities.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={22} />
        </Box>
      )}

      {/* Rỗng */}
      {!loading && activities.length === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 5, color: 'text.disabled' }}>
          <HistoryIcon sx={{ fontSize: 40 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>No activity yet.</Typography>
        </Box>
      )}

      {/* Danh sách */}
      {activities.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', opacity: loading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
          {activities.map((act, idx) => {
            const meta = ACTIVITY_META[act.actionType] || ACTIVITY_META.SETTINGS_CHANGED
            const ActIcon = meta.icon
            const { action, target } = describeActivity(act)
            const isMe = String(act.actorId) === String(currentUserId)
            const userLabel = isMe ? 'You' : act.actorName

            return (
              <Box key={act._id} sx={{
                display: 'flex', gap: 2, alignItems: 'flex-start', py: 1.75,
                borderBottom: idx < activities.length - 1 ? '1px solid' : 'none',
                borderColor: rowBorderColor
              }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: meta.bg, color: meta.color
                }}>
                  <ActIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>{userLabel}</Box>
                    {' '}{action}{target ? ' ' : ''}
                    {target && <Box component="span" sx={{ fontWeight: 600 }}>{target}</Box>}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {dayjs(act.createdAt).fromNow()}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
