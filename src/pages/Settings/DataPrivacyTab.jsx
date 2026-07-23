import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DownloadIcon from '@mui/icons-material/Download'
import HistoryIcon from '@mui/icons-material/History'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { exportAccountDataAPI, exportPersonalBoardsAPI } from '~/apis'
import { clearCurrentUser, selectCurrentUser } from '~/redux/user/userSlice'
import { clearRecentBoards, getRecentBoards } from '~/utils/recentBoards'
import { downloadJson } from '~/utils/downloadJson'
import DeleteAccountDialog from './DeleteAccountDialog'
import {
  SettingsContentShell,
  SettingsPageHeader,
  SettingsRow,
  SettingsSection
} from './SettingsComponents'

const navItems = [
  { id: 'data-export', label: 'Export' },
  { id: 'data-local', label: 'Local data' },
  { id: 'data-danger', label: 'Danger Zone', danger: true }
]

const getErrorMessage = (error, fallback) => (
  error?.response?.data?.message || error?.message || fallback
)

function DataPrivacyTab() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)
  const [isExportingAccount, setIsExportingAccount] = useState(false)
  const [isExportingBoards, setIsExportingBoards] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [recentBoards, setRecentBoards] = useState(() => getRecentBoards(currentUser?._id))
  const recentCount = recentBoards.length

  const handleExportAccount = async () => {
    if (isExportingAccount) return
    setIsExportingAccount(true)
    try {
      const serverData = await exportAccountDataAPI()
      downloadJson({
        ...serverData,
        localBrowserData: {
          recentBoards,
          note: 'This section was stored only in this browser.'
        }
      }, 'whip-account-data')
      toast.success('Account data downloaded successfully.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not export account data.'))
    } finally {
      setIsExportingAccount(false)
    }
  }

  const handleExportBoards = async () => {
    if (isExportingBoards) return
    setIsExportingBoards(true)
    try {
      const data = await exportPersonalBoardsAPI()
      downloadJson(data, 'whip-personal-boards')
      toast.success(
        data.count > 0
          ? `${data.count} personal board${data.count === 1 ? '' : 's'} downloaded.`
          : 'Personal boards archive downloaded. No owned boards were found.'
      )
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not export personal boards.'))
    } finally {
      setIsExportingBoards(false)
    }
  }

  const handleClearRecent = () => {
    const cleared = clearRecentBoards(currentUser?._id)
    if (!cleared) {
      toast.error('Could not clear recent boards in this browser.')
      return
    }
    setRecentBoards([])
    toast.success('Recent boards cleared from this browser.')
  }

  const handleAccountDeleted = (result) => {
    clearRecentBoards(currentUser?._id)
    dispatch(clearCurrentUser())
    setIsDeleteDialogOpen(false)
    navigate('/login', { replace: true })
    toast.success(
      `Account deleted permanently. ${result.deletedPersonalBoards || 0} personal board(s) were removed.`
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SettingsPageHeader
        title="Data & privacy"
        description="Download your data, manage local history, and control your account lifecycle."
      />

      <SettingsContentShell navItems={navItems}>
        <SettingsSection id="data-export" title="Export">
          <SettingsRow
            title="Download account data"
            description="Export your profile, memberships, board access, preferences, comments, activity, invitations, notifications, and this browser's recent boards."
          >
            <Button
              variant="outlined"
              onClick={handleExportAccount}
              disabled={isExportingAccount}
              startIcon={<DownloadIcon fontSize="small" />}
              sx={{ minHeight: 38, borderRadius: '8px', fontWeight: 700 }}
            >
              {isExportingAccount ? 'Preparing...' : 'Export data'}
            </Button>
          </SettingsRow>

          <SettingsRow
            title="Back up personal boards"
            description="Download restorable JSON snapshots of personal boards you own. Comments, attachments, and member assignments are excluded."
            last
          >
            <Button
              variant="outlined"
              onClick={handleExportBoards}
              disabled={isExportingBoards}
              startIcon={<DownloadIcon fontSize="small" />}
              sx={{ minHeight: 38, borderRadius: '8px', fontWeight: 700 }}
            >
              {isExportingBoards ? 'Preparing...' : 'Export boards'}
            </Button>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="data-local" title="Local data">
          <SettingsRow
            title="Recent boards"
            description={`${recentCount} board${recentCount === 1 ? '' : 's'} stored only in this browser for the Recent menu.`}
            last
          >
            <Button
              variant="outlined"
              onClick={handleClearRecent}
              disabled={recentCount === 0}
              startIcon={<HistoryIcon fontSize="small" />}
              sx={{ minHeight: 38, borderRadius: '8px', fontWeight: 700 }}
            >
              Clear recent
            </Button>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="data-danger" title="Danger Zone" danger>
          <SettingsRow
            title="Delete account"
            description="Verify by email, then permanently delete your profile and sole-owned personal boards. Shared content is anonymized."
            last
          >
            <Button
              variant="outlined"
              color="error"
              onClick={() => setIsDeleteDialogOpen(true)}
              startIcon={<DeleteOutlineIcon fontSize="small" />}
              sx={{ minHeight: 38, borderRadius: '8px', fontWeight: 700 }}
            >
              Delete account
            </Button>
          </SettingsRow>
        </SettingsSection>
      </SettingsContentShell>

      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        accountEmail={currentUser?.email}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={handleAccountDeleted}
      />
    </Box>
  )
}

export default DataPrivacyTab
