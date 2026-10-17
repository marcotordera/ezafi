import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Collapse,
  Paper,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Citation } from '@/types/ezafi';
import { getDocumentDownloadUrl } from '@/api/client';

interface CitationCardProps {
  citations: Citation[];
}

export default function CitationCard({ citations }: CitationCardProps) {
  const [expanded, setExpanded] = useState(true);

  if (!citations || citations.length === 0) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(0, 229, 255, 0.25)' : 'rgba(2, 132, 199, 0.25)',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(6, 11, 25, 0.6)' : 'rgba(241, 245, 249, 0.6)',
      }}
    >
      {/* Header bar of Citations drawer */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.2,
          cursor: 'pointer',
          userSelect: 'none',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(0, 229, 255, 0.05)' : 'rgba(2, 132, 199, 0.05)',
          '&:hover': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(2, 132, 199, 0.1)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedIcon
            sx={{
              fontSize: 18,
              color: (theme) => (theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7'),
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: (theme) => (theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7'),
            }}
          >
            Official Regulatory Citations ({citations.length})
          </Typography>
        </Box>
        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </Box>

      {/* Collapsible Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {citations.map((citation, idx) => {
            const pubName = citation.source.replace(/\.pdf$/i, '').toUpperCase();
            const downloadUrl = getDocumentDownloadUrl(citation.source);

            return (
              <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {idx > 0 && <Divider sx={{ my: 1 }} />}

                {/* Badge row with Open PDF link */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Chip
                    label={`${pubName} | PAGE ${citation.page} | ${citation.score}% CONFIDENCE MATCH`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: 0.4,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(0, 229, 255, 0.15)'
                          : 'rgba(2, 132, 199, 0.15)',
                      color: (theme) => (theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7'),
                      border: '1px solid',
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(0, 229, 255, 0.4)'
                          : 'rgba(2, 132, 199, 0.4)',
                    }}
                  />

                  <Button
                    size="small"
                    variant="text"
                    endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      py: 0.3,
                      px: 1,
                      color: (theme) => (theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7'),
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(0, 229, 255, 0.12)'
                            : 'rgba(2, 132, 199, 0.12)',
                      },
                    }}
                  >
                    Open PDF
                  </Button>
                </Box>

                {/* Excerpt Text */}
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: 'text.secondary',
                    fontFamily: 'monospace',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(0, 0, 0, 0.25)'
                        : 'rgba(255, 255, 255, 0.7)',
                    p: 1.5,
                    borderRadius: 1.5,
                    borderLeft: '3px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? '#00e5ff' : '#0284c7',
                  }}
                >
                  "{citation.text}"
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Paper>
  );
}
