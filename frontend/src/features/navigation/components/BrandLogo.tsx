import { Box, Typography } from '@mui/material';

export default function BrandLogo() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="img"
        src="/usaf-logo.png"
        alt="United States Air Force"
        sx={{
          height: 32,
          width: 'auto',
          display: 'block',
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          letterSpacing: -0.5,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, #00e5ff 0%, #00b4d8 100%)'
              : 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        ezAFI
      </Typography>
    </Box>
  );
}
