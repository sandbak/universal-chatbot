import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import toast from 'react-hot-toast';

interface MenuBarProps {
  onClearChat: () => void;
  onSaveChat?: () => void;
  onLoadHistory?: () => void;
  hasMessages?: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({ 
  onClearChat, 
  onSaveChat, 
  onLoadHistory,
  hasMessages = false 
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success(t('auth.logout_success'));
    } catch (error) {
      toast.error(t('auth.logout_error'));
    }
    handleClose();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#2c3e50' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Medical Assistant
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Chat Controls */}
          <Button 
            color="inherit" 
            startIcon={<HistoryIcon />}
            onClick={onLoadHistory}
            disabled={!onLoadHistory}
          >
            {t('chat.history')}
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<SaveIcon />}
            onClick={onSaveChat}
            disabled={!hasMessages || !onSaveChat}
          >
            {t('chat.save')}
          </Button>
          
          <Button 
            color="inherit" 
            startIcon={<DeleteIcon />}
            onClick={onClearChat}
            disabled={!hasMessages}
          >
            {t('Clear')}
          </Button>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          
          {/* User Menu */}
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="textSecondary">
                {currentUser?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              {t('auth.logout')}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default MenuBar;
