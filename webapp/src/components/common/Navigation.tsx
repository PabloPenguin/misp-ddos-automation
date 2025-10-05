import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  EventNote as EventIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface NavigationProps {
  open?: boolean;
  onClose?: () => void;
  onNavigate?: (route: string) => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, route: '/' },
  { text: 'Upload Events', icon: <UploadIcon />, route: '/upload' },
  { text: 'Event List', icon: <EventIcon />, route: '/events' },
];

const settingsItems = [
  { text: 'Settings', icon: <SettingsIcon />, route: '/settings' },
];

export const Navigation: React.FC<NavigationProps> = ({
  open = true,
  onClose,
  onNavigate,
}) => {
  const handleItemClick = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    }
    if (onClose) {
      onClose();
    }
  };

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleItemClick(item.route)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {settingsItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleItemClick(item.route)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
