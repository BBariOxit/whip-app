import { useState } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import SecurityIcon from '@mui/icons-material/Security'
import PersonIcon from '@mui/icons-material/Person'
import { Link, useLocation } from 'react-router-dom'
import AccountTab from './AccountTab'
import SecurityTab from './SecurityTab'

const TABS = {
  ACCOUNT: 'account',
  SECURITY: 'security'
}

function Settings() {
  const location = useLocation()
  const getDefaultTab = () => {
    if (location.pathname.includes(TABS.SECURITY)) return TABS.SECURITY
    return TABS.ACCOUNT
  }
  const [activeTab, setActiveTab] = useState(getDefaultTab())

  const handleChangeTab = (event, selectedTab) => { setActiveTab(selectedTab) }

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />
      <TabContext value={activeTab}>
        <Box sx={{ 
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0d1117' : '#f6f8fa', 
          minHeight: 'calc(100vh - 58px)', 
          display: 'flex',
          justifyContent: 'center',
          pt: 6,
          px: 4
        }}>
          <Box sx={{
            display: 'flex', 
            width: '100%', 
            maxWidth: '1012px',
            gap: 4 
          }}>
            {/* 1. SIDEBAR ĐIỀU HƯỚNG BÊN TRÁI */}
            <Box sx={{ width: '296px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <TabList 
                onChange={handleChangeTab} 
                orientation="vertical"
                sx={{
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTab-root': {
                    justifyContent: 'flex-start',
                    minHeight: '32px',
                    py: 1,
                    px: 2,
                    mb: 0.5,
                    borderRadius: '6px',
                    color: (theme) => theme.palette.mode === 'dark' ? '#768390' : '#57606a',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '14px',
                    '&:hover': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#24292f',
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)'
                    },
                    '&.Mui-selected': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#24292f',
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#25282c' : '#eaf2ff',
                      fontWeight: 600
                    }
                  }
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
                      Public profile
                    </Box>
                  }
                  value={TABS.ACCOUNT}
                  component={Link}
                  to="/settings/account" 
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SecurityIcon fontSize="small" sx={{ mr: 1.5 }} />
                      Security & password
                    </Box>
                  }
                  value={TABS.SECURITY}
                  component={Link}
                  to="/settings/security" 
                />
              </TabList>
            </Box>

            {/* 2. VÙNG NỘI DUNG CHÍNH BÊN PHẢI */}
            <Box sx={{ flex: 1, maxWidth: '800px' }}>
              <TabPanel value={TABS.ACCOUNT} sx={{ p: 0 }}><AccountTab /></TabPanel>
              <TabPanel value={TABS.SECURITY} sx={{ p: 0 }}><SecurityTab /></TabPanel>
            </Box>
          </Box>
        </Box>
      </TabContext>
    </Container>
  )
}

export default Settings
