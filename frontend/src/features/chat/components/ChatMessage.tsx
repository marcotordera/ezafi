import { Box, Typography, Paper, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BoltIcon from '@mui/icons-material/Bolt';
import { ChatMessage as ChatMessageType } from '@/types/ezafi';
import CitationCard from './CitationCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 1.5,
        mb: 3,
        width: '100%',
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          bgcolor: isUser
            ? (theme) => (theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7')
            : (theme) => (theme.palette.mode === 'dark' ? '#1e293b' : '#e2e8f0'),
          color: isUser
            ? (theme) => (theme.palette.mode === 'dark' ? '#060b19' : '#ffffff')
            : (theme) => (theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7'),
          width: 36,
          height: 36,
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(0, 229, 255, 0.2)' : 'rgba(2, 132, 199, 0.2)',
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
      </Avatar>

      {/* Message Card */}
      <Box sx={{ maxWidth: { xs: '85%', sm: '80%' } }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: isUser
              ? (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 229, 255, 0.12)'
                    : 'rgba(2, 132, 199, 0.1)'
              : 'background.paper',
            border: '1px solid',
            borderColor: isUser
              ? (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 229, 255, 0.3)'
                    : 'rgba(2, 132, 199, 0.3)'
              : 'divider',
          }}
        >
          {/* Header row in message if assistant */}
          {!isUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: (theme) => (theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7'),
                }}
              >
                Official Determination
              </Typography>

              {message.latencyMs && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BoltIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {(message.latencyMs / 1000).toFixed(1)}s
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Text Content */}
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: '0.95rem',
            }}
          >
            {message.content}
          </Typography>

          {/* Citations Drawer */}
          {message.citations && message.citations.length > 0 && (
            <CitationCard citations={message.citations} />
          )}
        </Paper>

        {/* Timestamp */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mt: 0.5,
            px: 1,
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {message.timestamp}
        </Typography>
      </Box>
    </Box>
  );
}
