import React from 'react';
import { Box, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import HistoryIcon from '@mui/icons-material/History';

const FilterBar = ({ filters, setFilters }) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <Box display="flex" justifyContent="space-between" marginTop={2} gap={2}>
      <FormControl variant="outlined" size="small">
        <InputLabel>Anytime</InputLabel>
        <Select
          name="time"
          value={filters.time}
          onChange={handleChange}
          label="Anytime"
          startAdornment={<CalendarTodayIcon />}
        >
          <MenuItem value="anytime">Anytime</MenuItem>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="this_week">This Week</MenuItem>
          <MenuItem value="this_month">This Month</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="outlined" size="small">
        <InputLabel>Who from</InputLabel>
        <Select
          name="whoFrom"
          value={filters.whoFrom}
          onChange={handleChange}
          label="Who from"
          startAdornment={<PersonIcon />}
        >
          <MenuItem value="anyone">Anyone</MenuItem>
          <MenuItem value="specific_person">Specific Person</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="outlined" size="small">
        <InputLabel>What type</InputLabel>
        <Select
          name="type"
          value={filters.type}
          onChange={handleChange}
          label="What type"
          startAdornment={<CategoryIcon />}
        >
          <MenuItem value="any_type">Any Type</MenuItem>
          <MenuItem value="documents">Documents</MenuItem>
          <MenuItem value="spreadsheets">Spreadsheets</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="outlined" size="small">
        <InputLabel>My history</InputLabel>
        <Select
          name="history"
          value={filters.history}
          onChange={handleChange}
          label="My history"
          startAdornment={<HistoryIcon />}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="viewed">Viewed</MenuItem>
          <MenuItem value="edited">Edited</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterBar;
