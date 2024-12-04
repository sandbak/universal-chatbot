import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  CircularProgress 
} from '@mui/material';
import { 
  History as HistoryIcon, 
  Save as SaveIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { generateResponse, getInitialMessage } from '../../services/llm';
import ChatHistory from './ChatHistory';
import toast from 'react-hot-toast';
import MenuBar from '../MenuBar/MenuBar';

interface Message {
  id?: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  historyOpen: boolean;
}

export interface ChatRef {
  handleClearChat: () => void;
}

const Chat = forwardRef<ChatRef>((_, ref) => {
  const [state, setState] = useState<ChatState>({
    messages: [{
      content: getInitialMessage(),
      sender: 'bot',
      timestamp: Date.now()
    }],
    isTyping: false,
    error: null,
    historyOpen: false,
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLocalClearChat = () => {
    setState(prev => ({ 
      ...prev, 
      messages: [{
        content: getInitialMessage(),
        sender: 'bot',
        timestamp: Date.now()
      }] 
    }));
    setInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useImperativeHandle(ref, () => ({
    handleClearChat: handleLocalClearChat
  }));

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentUser) return;

    const userMessage: Message = {
      content: input,
      sender: 'user',
      timestamp: Date.now(),
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, userMessage] }));
    setInput('');
    setIsLoading(true);

    try {
      // Store message in Firestore
      try {
        await addDoc(collection(db, 'messages'), {
          ...userMessage,
          userId: currentUser.uid,
          createdAt: new Date().toISOString()
        });
      } catch (firestoreError) {
        console.error('Error storing message in Firestore:', firestoreError);
        // Continue with the chat even if Firestore fails
      }

      // Generate response using LLM
      const formattedMessages = state.messages.concat(userMessage).map(msg => ({
        content: msg.content,
        role: msg.sender === 'user' ? 'user' : 'assistant' as 'user' | 'assistant'
      }));

      console.log('Sending messages to LLM:', formattedMessages);
      const response = await generateResponse(formattedMessages);
      console.log('Received response from LLM:', response);

      const botMessage: Message = {
        content: response,
        sender: 'bot',
        timestamp: Date.now(),
      };

      // Store bot message in Firestore
      try {
        await addDoc(collection(db, 'messages'), {
          ...botMessage,
          userId: currentUser.uid,
          createdAt: new Date().toISOString()
        });
      } catch (firestoreError) {
        console.error('Error storing bot message in Firestore:', firestoreError);
        // Continue with the chat even if Firestore fails
      }

      setState(prev => ({ ...prev, messages: [...prev.messages, botMessage] }));
    } catch (error) {
      console.error('Error in chat:', error);
      // Show error in chat
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const botMessage: Message = {
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
        sender: 'bot',
        timestamp: Date.now(),
      };
      setState(prev => ({ ...prev, messages: [...prev.messages, botMessage] }));
    } finally {
      setIsLoading(false);
      // Focus the input field after the bot responds
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSaveChat = async () => {
    if (!currentUser) return;
    
    try {
      const lastMessage = state.messages[state.messages.length - 1].content;
      const title = state.messages[0].content.substring(0, 50) + '...';
      
      const chatData = {
        userId: currentUser.uid,
        title,
        lastMessage,
        timestamp: Date.now(),
        messages: state.messages
      };

      await addDoc(collection(db, 'savedChats'), chatData);
      toast.success(t('chat.save_success'));
    } catch (error) {
      console.error('Error saving chat:', error);
      toast.error(t('chat.save_error'));
    }
  };

  const handleLoadChat = (messages: Message[]) => {
    setState(prev => ({
      ...prev,
      messages,
      historyOpen: false
    }));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <>
      <MenuBar 
        onClearChat={handleLocalClearChat}
        onSaveChat={handleSaveChat}
        onLoadHistory={() => setState(prev => ({ ...prev, historyOpen: true }))}
        hasMessages={state.messages.length > 1}
      />
      <Container maxWidth="md" sx={{ height: 'calc(100vh - 64px)', py: 2 }}>
        <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {state.messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.200',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    maxWidth: '70%',
                  }}
                >
                  <Typography>{message.content}</Typography>
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <CircularProgress size={20} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('chat.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              autoComplete="off"
              inputRef={inputRef}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={isLoading}
              sx={{ mt: 1 }}
              fullWidth
            >
              {t('chat.send')}
            </Button>
          </Box>
        </Paper>
        <ChatHistory
          open={state.historyOpen}
          onClose={() => setState(prev => ({ ...prev, historyOpen: false }))}
          onLoadChat={handleLoadChat}
        />
      </Container>
    </>
  );
});

export default Chat;
