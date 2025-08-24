import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Installation } from '../../services/installationService';

interface InstallationListProps {
  installations: Installation[];
  onViewDetails: (installation: Installation) => void;
  onRefresh: () => void;
}

const installationTypes = [
  { value: 'pump', label: 'Pump Installation' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'tank', label: 'Water Tank' },
  { value: 'complete_system', label: 'Complete System' },
];

const InstallationList: React.FC<InstallationListProps> = ({
  installations,
  onViewDetails,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredInstallations = installations.filter((inst) => {
    const matchesSearch = 
      inst.job?.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.job?.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.technician?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || inst.type === filterType;
    const matchesStatus = !filterStatus || inst.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'scheduled':
        return 'default';
      case 'on_hold':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    return installationTypes.find(t => t.value === type)?.label || type;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search by job, client, or technician..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Type"
          >
            <MenuItem value="">All Types</MenuItem>
            {installationTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="on_hold">On Hold</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job #</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Technician</TableCell>
              <TableCell>Scheduled Date</TableCell>
              <TableCell>Started</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInstallations.map((inst) => (
              <TableRow key={inst.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {inst.job?.jobNumber || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>{inst.job?.clientName || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(inst.type)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={inst.status.replace(/_/g, ' ').toUpperCase()}
                    color={getStatusColor(inst.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{inst.technician?.name || 'Unassigned'}</TableCell>
                <TableCell>{formatDate(inst.scheduledDate)}</TableCell>
                <TableCell>{formatDate(inst.startedAt)}</TableCell>
                <TableCell>{formatDate(inst.completedAt)}</TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(inst)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {inst.status === 'scheduled' && (
                    <Tooltip title="Start Installation">
                      <IconButton size="small" color="primary">
                        <StartIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {inst.status === 'in_progress' && (
                    <>
                      <Tooltip title="Complete">
                        <IconButton size="small" color="success">
                          <CompleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Put on Hold">
                        <IconButton size="small" color="warning">
                          <PauseIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredInstallations.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">
            No installations found matching your criteria
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InstallationList;