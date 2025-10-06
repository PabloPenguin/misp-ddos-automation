import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventsIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
    description: 'DDoS Event Analytics'
  },
  {
    id: 'events',
    label: 'Events',
    icon: <EventsIcon />,
    path: '/events',
    description: 'View and manage events'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    description: 'Configuration and preferences'
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1A1A1A',
          borderRight: '2px solid #FFD700',
          backgroundImage: `
            linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, transparent 100%),
            radial-gradient(circle at top right, rgba(255, 215, 0, 0.1) 0%, transparent 50%)
          `,
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.02) 0%, transparent 30%, transparent 70%, rgba(255, 215, 0, 0.02) 100%)',
            pointerEvents: 'none',
          },
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        {/* Logo/Brand Section */}
        <Box 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.03) 100%)',
            borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
            position: 'relative',
          }}
        >
          <SecurityIcon 
            sx={{ 
              fontSize: 56, 
              color: '#FFD700', 
              mb: 1.5,
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))',
              animation: 'glow 3s ease-in-out infinite alternate',
              '@keyframes glow': {
                '0%': { filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))' },
                '100%': { filter: 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.6))' }
              }
            }} 
          />
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              color: '#FFD700',
              fontSize: '1.3rem',
              fontFamily: '"Roboto Mono", monospace',
              letterSpacing: '1px',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MISP DDoS
          </Typography>
          <Typography 
            variant="body2" 
            sx={{
              color: 'rgba(255, 215, 0, 0.8)',
              fontSize: '0.9rem',
              mt: 0.5,
              fontFamily: '"Roboto Mono", monospace',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Automation Suite
          </Typography>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)',
              borderRadius: '1px',
            }}
          />
        </Box>
        
        <Divider 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(255, 215, 0, 0.3)',
            height: '1px',
          }} 
        />
        
        {/* Navigation Menu */}
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid transparent',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 215, 0, 0.15)',
                    color: '#FFD700',
                    border: '1px solid rgba(255, 215, 0, 0.5)',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 20px rgba(255, 215, 0, 0.1)',
                    transform: 'translateX(4px)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.2)',
                      boxShadow: '0 0 25px rgba(255, 215, 0, 0.3), inset 0 0 25px rgba(255, 215, 0, 0.15)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#FFD700',
                      filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.5))',
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 'bold',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.3)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 215, 0, 0.08)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    transform: 'translateX(2px)',
                    '& .MuiListItemIcon-root': {
                      color: 'rgba(255, 215, 0, 0.9)',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'rgba(255, 215, 0, 0.9)',
                    },
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'rgba(255, 215, 0, 0.7)',
                    transition: 'all 0.3s ease',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 215, 0, 0.6)',
                    fontFamily: '"Roboto Mono", monospace',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider 
          sx={{ 
            my: 2,
            backgroundColor: 'rgba(255, 215, 0, 0.3)',
            height: '1px',
          }} 
        />
        
        {/* Footer Info */}
        <Box 
          sx={{ 
            p: 2, 
            mt: 'auto',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, transparent 100%)',
            borderTop: '1px solid rgba(255, 215, 0, 0.2)',
          }}
        >
          <Typography 
            variant="caption" 
            align="center" 
            display="block"
            sx={{
              color: 'rgba(255, 215, 0, 0.7)',
              fontFamily: '"Roboto Mono", monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.5px',
            }}
          >
            Built with React & Material-UI
          </Typography>
          <Typography 
            variant="caption" 
            align="center" 
            display="block"
            sx={{
              color: 'rgba(255, 215, 0, 0.5)',
              fontFamily: '"Roboto Mono", monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.5px',
              mt: 0.5,
            }}
          >
            Cybersecurity Dashboard
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;