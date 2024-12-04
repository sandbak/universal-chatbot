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
        sx: { width: { xs: '100%', sm: 400 } },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          {t('chat.savedChats')}
        </Typography>
      </Box>
      <Divider />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : savedChats.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Typography color="textSecondary">
            {t('chat.noSavedChats')}
          </Typography>
        </Box>
      ) : (
        <List>
          {savedChats.map((chat) => (
            <ListItem
              key={chat.id}
              button
              onClick={() => handleLoadChat(chat)}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ChatIcon sx={{ mr: 2, color: 'primary.main' }} />
              <ListItemText
                primary={chat.title}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textSecondary"
                    >
                      {formatDate(chat.timestamp)}
                    </Typography>
                    <br />
                    <Typography
                      component="span"
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {chat.lastMessage}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Drawer>
  );
};

export default ChatHistory;
