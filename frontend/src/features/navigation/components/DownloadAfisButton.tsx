import { Button } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAppDispatch } from '@/app/hooks';
import { setDownloadModalOpen } from '@/features/system/systemSlice';

export default function DownloadAfisButton() {
  const dispatch = useAppDispatch();

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<MenuBookIcon fontSize="small" />}
      endIcon={<KeyboardArrowDownIcon fontSize="small" />}
      onClick={() => dispatch(setDownloadModalOpen(true))}
      sx={{
        fontWeight: 600,
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(0, 229, 255, 0.08)' : 'rgba(2, 132, 199, 0.08)',
        },
      }}
    >
      Download AFIs
    </Button>
  );
}
