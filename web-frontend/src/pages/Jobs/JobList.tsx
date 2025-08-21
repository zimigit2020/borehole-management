import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  Search,
  FileUpload,
  LocationOn,
} from '@mui/icons-material';
import { format } from 'date-fns';
import jobsService, { Job } from '../../services/jobs.service';

const JobList: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobsService.getAllJobs();
      setJobs(data);
    } catch (error: any) {
      console.error('Failed to fetch jobs:', error);
      setError(error.response?.data?.message || 'Failed to load jobs. Please try again.');
      // Use mock data as fallback for now
      setJobs([
        {
          id: '1',
          name: 'Venice Borehole Project',
          clientName: 'Venice Community Trust',
          siteName: 'Venice Site A',
          latitude: -17.8292,
          longitude: 31.0536,
          contactPerson: 'John Doe',
          contactPhone: '+263 77 123 4567',
          priority: 'high',
          budgetUsd: 5000,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      created: 'warning',
      assigned: 'info',
      surveyed: 'primary',
      drilling: 'secondary',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      high: 'error',
      medium: 'warning',
      low: 'success',
    };
    return colors[priority] || 'default';
  };

  const filteredJobs = jobs.filter(job =>
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.siteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedJobs = filteredJobs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Jobs</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FileUpload />}
            onClick={() => navigate('/jobs/import')}
            sx={{ mr: 2 }}
          >
            Import Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/jobs/new')}
          >
            New Job
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading jobs...</Typography>
        </Paper>
      ) : (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Name</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Budget (USD)</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              paginatedJobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>{job.name}</TableCell>
                  <TableCell>{job.clientName}</TableCell>
                  <TableCell>{job.siteName}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {Number(job.latitude).toFixed(4)}, 
                        {Number(job.longitude).toFixed(4)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.status}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {job.priority && (
                      <Chip
                        label={job.priority}
                        color={getPriorityColor(job.priority)}
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    ${parseFloat(job.budgetUsd?.toString() || '0').toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/jobs/${job.id}/edit`)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredJobs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      )}
    </Box>
  );
};

export default JobList;