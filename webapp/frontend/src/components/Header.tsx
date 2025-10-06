import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  GitHub as GitHubIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const Header: React.FC = () => {
  return (
    <AppBar 
      position="static" 
      color="primary" 
      elevation={1}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <SecurityIcon sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 600 }}
        >
          MISP DDoS Automation
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label="v1.0.0" 
            size="small" 
            variant="outlined" 
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
          />
          
          <Tooltip title="View notifications">
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Settings">
            <IconButton color="inherit">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="View on GitHub">
            <IconButton 
              color="inherit"
              href="https://github.com/PabloPenguin/misp-ddos-automation"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>

          <Button
            color="inherit"
            variant="outlined"
            sx={{ 
              ml: 2,
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Documentation
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;