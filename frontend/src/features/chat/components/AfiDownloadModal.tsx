import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectIsDownloadModalOpen,
  setDownloadModalOpen,
  selectDocuments,
} from '@/features/system/systemSlice';
import { getDocumentDownloadUrl } from '@/api/client';

// Default publication matching the active sovereign index
const DEFAULT_DOCS = [
  {
    filename: 'DAFI36-9999_Feline_Companionship_and_Cat_Ownership.pdf',
    publication: 'DAFI 36-9999',
    description: 'Feline Companionship and Cat Ownership (Expanded 30-Page Edition)',
    page_count: 30,
    chunk_count: 94,
  },
];

export default function AfiDownloadModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectIsDownloadModalOpen);
  const documents = useAppSelector(selectDocuments);

  const displayDocs = documents.length > 0 ? documents : DEFAULT_DOCS;

  const handleClose = () => {
    dispatch(setDownloadModalOpen(false));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 6,
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PictureAsPdfIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Indexed Air Force Publications
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ px: 3, py: 2, bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)') }}>
          <Typography variant="body2" color="text.secondary">
            Download and inspect the exact PDFs currently indexed in the sovereign vector database to quiz the model on specific clauses.
          </Typography>
        </Box>

        <List disablePadding>
          {displayDocs.map((doc: any, index: number) => {
            const downloadUrl = getDocumentDownloadUrl(doc.filename);
            const isCatAfi = doc.filename.includes('36-9999');

            return (
              <Box key={doc.filename}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {doc.publication || doc.filename.replace('.pdf', '')}
                        </Typography>
                        {isCatAfi && (
                          <Chip
                            label="Special 30-Page Edition"
                            size="small"
                            color="secondary"
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {doc.description || doc.filename}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                          {doc.page_count && (
                            <Typography variant="caption" color="text.secondary">
                              <strong>Pages:</strong> {doc.page_count}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            <strong>Chunks:</strong> {doc.chunk_count}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      alignSelf: { xs: 'stretch', sm: 'center' },
                      whiteSpace: 'nowrap',
                      px: 2,
                    }}
                  >
                    Download PDF
                  </Button>
                </ListItem>
              </Box>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
