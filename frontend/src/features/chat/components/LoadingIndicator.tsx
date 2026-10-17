import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import RadarIcon from '@mui/icons-material/Radar';

export default function LoadingIndicator() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: '85%',
          p: 2.5,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(0, 229, 255, 0.3)' : 'rgba(2, 132, 199, 0.3)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 0 20px rgba(0, 229, 255, 0.08)'
              : '0 4px 12px rgba(2, 132, 199, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <RadarIcon
            sx={{
              color: (theme) => (theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7'),
              animation: 'spin 4s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: (theme) => (theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7'),
            }}
          >
            Scanning...
          </Typography>
        </Box>

        <LinearProgress
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(0, 229, 255, 0.1)'
                : 'rgba(2, 132, 199, 0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7',
            },
          }}
        />
      </Paper>
    </Box>
  );
}
