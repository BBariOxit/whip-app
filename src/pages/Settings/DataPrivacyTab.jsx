import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import DownloadIcon from '@mui/icons-material/Download'
import HistoryIcon from '@mui/icons-material/History'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PrivacyTipOutlinedIcon from '@mui/icons-material/PrivacyTipOutlined'
import {
  SettingsContentShell,
  SettingsPageHeader,
  SettingsRow,
  SettingsSection
} from './SettingsComponents'

const navItems = [
  { id: 'data-export', label: 'Export' },
  { id: 'data-history', label: 'Recent activity' },
  { id: 'data-privacy', label: 'Privacy' },
  { id: 'data-danger', label: 'Danger Zone', danger: true }
]

function DataPrivacyTab() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SettingsPageHeader
        title="Data & privacy"
        description="Review personal data controls and account-level privacy options."
      />

      <SettingsContentShell navItems={navItems}>
        <SettingsSection id="data-export" title="Export">
          <SettingsRow
            title="Export account data"
            description="Download your profile, personal boards metadata, and account preferences."
          >
            <Button
              variant="outlined"
              disabled
              startIcon={<DownloadIcon fontSize="small" />}
              sx={{ minHeight: 38, borderRadius: '8px', fontWeight: 700 }}
            >
              Export data
            </Button>
          </SettingsRow>

          <SettingsRow
            title="Export personal boards"
            description="Create a portable JSON backup for boards that are not inside a workspace."
            last
          >
            <Button
              variant="outlined"
              disabled
              startIcon={<DownloadIcon fontSize="small" />}
              sx={{ minHeight: 38, borderRadius: '8px', fontWeight: 700 }}
            >
              Export boards
            </Button>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="data-history" title="Recent activity">
          <SettingsRow
            title="Recent boards"
            description="Clear the local list used by the Recent menu in the top navigation."
            last
          >
            <Button
              variant="outlined"
              disabled
              startIcon={<HistoryIcon fontSize="small" />}
              sx={{ minHeight: 38, borderRadius: '8px', fontWeight: 700 }}
            >
              Clear recent
            </Button>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="data-privacy" title="Privacy">
          <SettingsRow
            title="Profile visibility"
            description="Control whether other Whip users can discover your public profile."
            last
          >
            <Chip
              icon={<PrivacyTipOutlinedIcon />}
              label="Public profile"
              variant="outlined"
              sx={{
                minWidth: 148,
                minHeight: 40,
                borderRadius: '999px',
                borderWidth: 2,
                fontWeight: 700,
                '& .MuiChip-label': { px: 1 }
              }}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="data-danger" title="Danger Zone" danger>
          <SettingsRow
            title="Delete account"
            description="Permanently delete your account, personal boards, and profile data."
            last
          >
            <Button
              variant="outlined"
              color="error"
              disabled
              startIcon={<DeleteOutlineIcon fontSize="small" />}
              sx={{ minHeight: 38, borderRadius: '8px', fontWeight: 700 }}
            >
              Delete account
            </Button>
          </SettingsRow>
        </SettingsSection>
      </SettingsContentShell>
    </Box>
  )
}

export default DataPrivacyTab
