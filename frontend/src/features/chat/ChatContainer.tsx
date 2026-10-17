import { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SecurityIcon from '@mui/icons-material/Security';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectMessages, selectIsLoading, selectError } from './chatSlice';
import { setDownloadModalOpen } from '@/features/system/systemSlice';
import ChatMessage from './components/ChatMessage';
import LoadingIndicator from './components/LoadingIndicator';
import ChatInput from './components/ChatInput';

export default function ChatContainer() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectMessages);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 65px)',
        maxHeight: 'calc(100vh - 65px)',
      }}
    >
      {/* Scrollable Message Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 3,
          px: { xs: 1, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 3,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                maxWidth: 600,
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(0, 229, 255, 0.1)'
                      : 'rgba(2, 132, 199, 0.1)',
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7',
                  mb: 2,
                }}
              >
                <SecurityIcon sx={{ fontSize: 32 }} />
              </Box>

              <Typography variant="h5" fontWeight={800} gutterBottom>
                Air Force Instructions Retrieval
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Query official regulations and policy determinations synthesized by a self-hosted,
                air-gapped LLaMA model running directly on AWS EC2 with ChromaDB vector search.
              </Typography>

              <Button
                variant="outlined"
                startIcon={<MenuBookIcon />}
                onClick={() => dispatch(setDownloadModalOpen(true))}
                sx={{ fontWeight: 600 }}
              >
                View & Download Indexed Publications
              </Button>
            </Paper>
          </Box>
        ) : (
          /* Conversation Stream */
          <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && <LoadingIndicator />}

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Floating Bottom Input Bar */}
      <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', px: { xs: 1, sm: 2 } }}>
        <ChatInput />
      </Box>
    </Box>
  );
}
