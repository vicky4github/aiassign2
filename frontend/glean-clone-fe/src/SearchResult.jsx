import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, IconButton } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { styled } from '@mui/system';

const StyledCard = styled(Card)({
  marginBottom: '10px',
  borderRadius: '10px',
  border: '1px solid #E0E0E0',
  boxShadow: 'none'
});

const ResultHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px'
});

const ResultTitle = styled(Typography)({
  fontWeight: 'bold',
  flexGrow: 1,
  fontSize: '1rem'
});

const ResultDescription = styled(Typography)({
  color: '#616161',
  marginBottom: '8px'
});

const ResultFooter = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const AuthorInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center'
});

const AuthorName = styled(Typography)({
  marginLeft: '8px',
  color: '#757575',
  fontSize: '0.875rem'
});

const TimeInfo = styled(Typography)({
  color: '#757575',
  fontSize: '0.875rem'
});

const SearchResult = ({ result }) => {
  return (
    <StyledCard variant="outlined">
      <CardContent>
        <ResultHeader>
          <IconButton size="small" color="primary">
            <FolderOpenIcon />
          </IconButton>
          <ResultTitle variant="h6">{result.title}</ResultTitle>
          <Typography variant="caption" style={{ color: '#757575' }}>
            {result.collections} Collections
          </Typography>
        </ResultHeader>
        <ResultDescription variant="body2">{result.description}</ResultDescription>
        {/* <ResultDescription variant="body2">{result.matchingText}</ResultDescription> */}
        <ResultDescription variant="body2">{result.summary}</ResultDescription>
        <ResultFooter>
          <AuthorInfo>
            <Avatar alt={result.author} src={result.authorImage} style={{ width: 24, height: 24 }} />
            <AuthorName variant="body2">{result.author}</AuthorName>
          </AuthorInfo>
          <TimeInfo variant="body2">{result.updated}</TimeInfo>
        </ResultFooter>
      </CardContent>
    </StyledCard>
  );
};

export default SearchResult;
