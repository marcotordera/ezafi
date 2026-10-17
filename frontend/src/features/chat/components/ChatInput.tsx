import { useState, KeyboardEvent } from 'react';
import { Box, Paper, InputBase, Button, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { sendQuestion, selectIsLoading } from '@/features/chat/chatSlice';

export default function ChatInput() {
  const [query, setQuery] = useState('');
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);

  const handleSend = () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    dispatch(sendQuestion(trimmed));
    setQuery('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        pt: 1,
        pb: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 0.8,
          borderRadius: 4,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(13, 23, 46, 0.85)'
              : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(0, 229, 255, 0.4)'
              : 'rgba(2, 132, 199, 0.35)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 0 25px rgba(0, 229, 255, 0.15)'
              : '0 8px 24px rgba(2, 132, 199, 0.12)',
          transition: 'all 0.2s ease-in-out',
          '&:focus-within': {
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 0 35px rgba(0, 229, 255, 0.25)'
                : '0 8px 30px rgba(2, 132, 199, 0.2)',
          },
        }}
      >
        <InputBase
          placeholder="Ask any question regarding Air Force Instructions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          multiline
          maxRows={4}
          sx={{
            flex: 1,
            fontSize: '0.95rem',
            color: 'text.primary',
            mr: 1,
          }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={!query.trim() || isLoading}
          endIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SendIcon sx={{ fontSize: 18 }} />
            )
          }
          sx={{
            fontWeight: 700,
            px: 2.5,
            py: 0.8,
            borderRadius: 3,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7',
            color: (theme) =>
              theme.palette.mode === 'dark' ? '#060b19' : '#ffffff',
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? '#33ebff' : '#0369a1',
            },
          }}
        >
          SEND
        </Button>
      </Paper>
    </Box>
  );
}
