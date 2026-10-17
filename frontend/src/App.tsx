import { useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { useAppDispatch } from '@/app/hooks';
import { loadSystemData } from '@/features/system/systemSlice';
import Navbar from '@/features/navigation/Navbar';
import ChatContainer from '@/features/chat/ChatContainer';
import AfiDownloadModal from '@/features/chat/components/AfiDownloadModal';
import { appTheme } from '@/theme';

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadSystemData());
  }, [dispatch]);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <Navbar />
        <ChatContainer />
        <AfiDownloadModal />
      </Box>
    </ThemeProvider>
  );
}
