import { AppBar, Toolbar, Container } from '@mui/material';
import BrandLogo from './components/BrandLogo';
import DownloadAfisButton from './components/DownloadAfisButton';

export default function Navbar() {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        backdropFilter: 'blur(8px)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64 }}>
          {/* Left: Clean Brand Logo */}
          <BrandLogo />

          {/* Right: Download AFIs */}
          <DownloadAfisButton />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
