import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Typography, 
  Drawer, 
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Chat as ChatIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface SavedChat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  messages: Array<{
    content: string;
    sender: 'user' | 'bot';
    timestamp: number;
  }>;
}

interface ChatHistoryProps {
  open: boolean;
  onClose: () => void;
  onLoadChat: (messages: SavedChat['messages']) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ open, onClose, onLoadChat }) => {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (open && currentUser) {
      loadSavedChats();
    }
  }, [open, currentUser]);

  const loadSavedChats = async () => {
    try {
      setLoading(true);
      // Simplified query without orderBy initially
      const chatsQuery = query(
        collection(db, 'savedChats'),
        where('userId', '==', currentUser?.uid)
      );

      const querySnapshot = await getDocs(chatsQuery);
      const chats: SavedChat[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          title: data.title,
          lastMessage: data.lastMessage,
          timestamp: data.timestamp,
          messages: data.messages,
        });
      });

      // Sort the chats in memory instead
      chats.sort((a, b) => b.timestamp - a.timestamp);
      setSavedChats(chats);
    } catch (error) {
      console.error('Error loading saved chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteDoc(doc(db, 'savedChats', chatId));
      setSavedChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleLoadChat = (chat: SavedChat) => {
    onLoadChat(chat.messages);
    onClose();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('chat.history')}
        </Typography>
      </Box>
      <Divider />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : savedChats.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('chat.no_history')}
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {savedChats.map((chat) => (
            <React.Fragment key={chat.id}>
              <ListItem>
                <ListItemText
                  primary={chat.title}
                  secondary={formatDate(chat.timestamp)}
                  sx={{
                    '.MuiListItemText-primary': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="load"
                    onClick={() => handleLoadChat(chat)}
                    sx={{ mr: 1 }}
                  >
                    <ChatIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteChat(chat.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Drawer>
  );
};

export default ChatHistory;
