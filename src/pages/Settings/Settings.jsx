import { useEffect, useState } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import SecurityIcon from '@mui/icons-material/Security'
import PersonIcon from '@mui/icons-material/Person'
import PrivacyTipOutlinedIcon from '@mui/icons-material/PrivacyTipOutlined'
import { alpha, useTheme } from '@mui/material/styles'
import { Link, useLocation } from 'react-router-dom'
import AccountTab from './AccountTab'
import SecurityTab from './SecurityTab'
import DataPrivacyTab from './DataPrivacyTab'

const TABS = {
  ACCOUNT: 'account',
  SECURITY: 'security',
  DATA: 'data-privacy'
}

const getTabFromPath = (pathname) => {
  if (pathname.includes(TABS.DATA)) return TABS.DATA
  if (pathname.includes(TABS.SECURITY)) return TABS.SECURITY
  return TABS.ACCOUNT
}

const settingsTabs = [
  {
    value: TABS.ACCOUNT,
    label: 'Profile',
    to: '/settings/account',
    icon: <PersonIcon fontSize="small" />
  },
  {
    value: TABS.SECURITY,
    label: 'Security & password',
    to: '/settings/security',
    icon: <SecurityIcon fontSize="small" />
  },
  {
    value: TABS.DATA,
    label: 'Data & privacy',
    to: '/settings/data-privacy',
    icon: <PrivacyTipOutlinedIcon fontSize="small" />
  }
]

function Settings() {
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname))

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname))
  }, [location.pathname])

  const handleChangeTab = (event, selectedTab) => { setActiveTab(selectedTab) }

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />
      <TabContext value={activeTab}>
        <Box sx={{
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 58px)',
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 5 }
        }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '276px minmax(0, 1fr)' },
            gap: { xs: 2.5, md: 4 },
            width: '100%',
            maxWidth: '1280px',
            mx: 'auto'
          }}>
            <Box
              component="aside"
              sx={(theme) => ({
                alignSelf: 'start',
                position: { xs: 'static', md: 'sticky' },
                top: { md: `calc(${theme.trello.appBarHeight} + 24px)` },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.74) : theme.palette.background.paper,
                boxShadow: theme.palette.mode === 'light' ? '0 10px 30px rgba(15, 23, 42, 0.06)' : 'none',
                overflow: 'hidden'
              })}
            >
              <Box sx={{
                px: 2,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: { xs: 'none', md: 'block' }
              }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                  Settings
                </Typography>
                <Typography sx={{ mt: 0.25, fontSize: '0.8125rem', color: 'text.secondary' }}>
                  Account settings
                </Typography>
              </Box>

              <TabList
                onChange={handleChangeTab}
                orientation={isMobile ? 'horizontal' : 'vertical'}
                variant={isMobile ? 'scrollable' : 'standard'}
                allowScrollButtonsMobile
                sx={(theme) => ({
                  p: 1,
                  minHeight: 'auto',
                  '& .MuiTabs-flexContainer': {
                    gap: 0.5
                  },
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTab-root': {
                    justifyContent: 'flex-start',
                    minHeight: 42,
                    px: 1.5,
                    py: 1,
                    borderRadius: '7px',
                    color: 'text.secondary',
                    textTransform: 'none',
                    fontWeight: 650,
                    fontSize: '0.9rem',
                    lineHeight: 1.2,
                    transition: 'background-color 0.15s ease, color 0.15s ease',
                    '& .MuiTab-iconWrapper': {
                      mr: 1.25,
                      color: 'inherit'
                    },
                    '&:hover': {
                      color: 'text.primary',
                      bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.05) : alpha(theme.palette.primary.main, 0.08)
                    },
                    '&.Mui-selected': {
                      color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
                      bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.18) : alpha(theme.palette.primary.main, 0.12)
                    }
                  }
                })}
              >
                {settingsTabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    icon={tab.icon}
                    iconPosition="start"
                    label={tab.label}
                    value={tab.value}
                    component={Link}
                    to={tab.to}
                  />
                ))}
              </TabList>
            </Box>

            <Box component="main" sx={{ minWidth: 0 }}>
              <TabPanel value={TABS.ACCOUNT} sx={{ p: 0 }}><AccountTab /></TabPanel>
              <TabPanel value={TABS.SECURITY} sx={{ p: 0 }}><SecurityTab /></TabPanel>
              <TabPanel value={TABS.DATA} sx={{ p: 0 }}><DataPrivacyTab /></TabPanel>
            </Box>
          </Box>
        </Box>
      </TabContext>
    </Container>
  )
}

export default Settings
