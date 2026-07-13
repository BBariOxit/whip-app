import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import LanguageIcon from '@mui/icons-material/Language'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import {
  SettingsContentShell,
  SettingsPageHeader,
  SettingsRow,
  SettingsSection
} from './SettingsComponents'
import { settingsSelectSx } from './settingsStyles'

const navItems = [
  { id: 'preferences-appearance', label: 'Appearance' },
  { id: 'preferences-defaults', label: 'Defaults' },
  { id: 'preferences-notifications', label: 'Notifications' }
]

function PreferencesTab() {
  const [defaults, setDefaults] = useState({
    landing: 'personal',
    boardView: 'boards',
    language: 'en',
    weekStart: 'monday'
  })
  const [notifications, setNotifications] = useState({
    mentions: true,
    assignments: true,
    dueDates: true,
    digest: false
  })

  const handleDefaultChange = (field) => (event) => {
    setDefaults(prev => ({ ...prev, [field]: event.target.value }))
  }

  const handleNotificationChange = (field) => (event) => {
    setNotifications(prev => ({ ...prev, [field]: event.target.checked }))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SettingsPageHeader
        title="Preferences"
        description="Tune Whip to match the way you work."
      />

      <SettingsContentShell navItems={navItems}>
        <SettingsSection id="preferences-appearance" title="Appearance">
          <SettingsRow
            title="Theme"
            description="Choose how Whip should look on this device."
            last
          >
            <ModeSelect />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="preferences-defaults" title="Defaults">
          <SettingsRow
            title="Start page"
            description="Choose the first board area you want to see after opening Whip."
          >
            <Select
              size="small"
              value={defaults.landing}
              onChange={handleDefaultChange('landing')}
              sx={settingsSelectSx}
            >
              <MenuItem value="personal">Personal boards</MenuItem>
              <MenuItem value="last">Last opened workspace</MenuItem>
              <MenuItem value="templates">Templates</MenuItem>
            </Select>
          </SettingsRow>

          <SettingsRow
            title="Default board view"
            description="Pick the default view for workspace pages."
          >
            <Select
              size="small"
              value={defaults.boardView}
              onChange={handleDefaultChange('boardView')}
              sx={settingsSelectSx}
            >
              <MenuItem value="boards">Boards grid</MenuItem>
              <MenuItem value="members">Members</MenuItem>
              <MenuItem value="settings">Settings</MenuItem>
            </Select>
          </SettingsRow>

          <SettingsRow
            title="Language"
            description="Set the display language for account-level UI."
          >
            <Select
              size="small"
              value={defaults.language}
              onChange={handleDefaultChange('language')}
              sx={settingsSelectSx}
            >
              <MenuItem value="en">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LanguageIcon fontSize="small" /> English
                </Box>
              </MenuItem>
              <MenuItem value="vi">Vietnamese</MenuItem>
            </Select>
          </SettingsRow>

          <SettingsRow
            title="Week starts on"
            description="Used by date pickers and due-date reminders."
            last
          >
            <Select
              size="small"
              value={defaults.weekStart}
              onChange={handleDefaultChange('weekStart')}
              sx={settingsSelectSx}
            >
              <MenuItem value="monday">Monday</MenuItem>
              <MenuItem value="sunday">Sunday</MenuItem>
            </Select>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="preferences-notifications" title="Notifications">
          <SettingsRow
            title="Mentions"
            description="Notify me when someone mentions me in a card or comment."
          >
            <Switch checked={notifications.mentions} onChange={handleNotificationChange('mentions')} />
          </SettingsRow>

          <SettingsRow
            title="Card assignments"
            description="Notify me when I am assigned to or removed from a card."
          >
            <Switch checked={notifications.assignments} onChange={handleNotificationChange('assignments')} />
          </SettingsRow>

          <SettingsRow
            title="Due date reminders"
            description="Send reminders for cards that are close to their due date."
          >
            <Switch checked={notifications.dueDates} onChange={handleNotificationChange('dueDates')} />
          </SettingsRow>

          <SettingsRow
            title="Weekly digest"
            description="Get a summary of workspace and board activity each week."
            last
          >
            <Switch checked={notifications.digest} onChange={handleNotificationChange('digest')} />
          </SettingsRow>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
            <Button
              variant="contained"
              startIcon={<NotificationsNoneIcon fontSize="small" />}
              disabled
              sx={{ minHeight: 40, borderRadius: '8px', boxShadow: 'none', fontWeight: 700 }}
            >
              Save preferences
            </Button>
          </Box>
        </SettingsSection>

      </SettingsContentShell>
    </Box>
  )
}

export default PreferencesTab
