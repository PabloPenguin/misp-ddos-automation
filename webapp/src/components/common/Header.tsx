import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {onMenuClick && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 2 }}>
          MISP DDoS Automation
        </Typography>

        <Chip
          label="Beta"
          size="small"
          color="warning"
          sx={{ mr: 2 }}
        />

        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated && user && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <AccountCircle sx={{ mr: 1 }} />
              <Typography variant="body2">
                {user.username} ({user.role})
              </Typography>
            </Box>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};
