import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import FilterBar from './FilterBarComponent';
import SearchResult from './SearchResult';
import { Container, Box, Button } from '@mui/material';

function App() {
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    time: 'anytime',
    whoFrom: 'anyone',
    type: 'any_type',
    history: 'all',
  });

  const handleSearch = async (query) => {
    try {
      // Construct query parameters including filters only if they have meaningful values
      const filterParams = new URLSearchParams({
        query: query,
        ...(filters.whoFrom !== 'anyone' && { author: filters.whoFrom }),
        ...(filters.type !== 'any_type' && { doctype: filters.type }),
        // Add more filters as needed
      }).toString();

      const response = await axios.get(`http://localhost:3000/search?${filterParams}`, {
        withCredentials: true
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const connectToDrive = () => {
    window.location.href = 'http://localhost:3000/auth';
  };

  return (
    <Container>
      <Box marginTop={4}>
        <Button variant="contained" color="primary" onClick={connectToDrive}>
          Connect to Drive
        </Button>
        <SearchBar onSearch={handleSearch} />
        <FilterBar filters={filters} setFilters={setFilters} />
        <Box marginTop={4}>
          {results.map((result) => (
            <SearchResult key={result.id} result={result} />
          ))}
        </Box>
      </Box>
    </Container>
  );
}

export default App;
