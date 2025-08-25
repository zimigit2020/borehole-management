import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Alert,
  Tooltip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  CheckCircle,
  Warning,
  Error,
  Build,
  Water,
  LocationOn,
  CalendarToday,
  Description,
  Print,
  CloudUpload,
  Timer,
  Engineering,
  Opacity,
  TrendingDown,
  CheckCircleOutline,
  Cancel,
  Schedule,
  AssignmentTurnedIn,
  PlayArrow,
  Stop,
  Visibility,
} from '@mui/icons-material';

interface DrillingReport {
  id: string;
  reportNumber: string;
  date: string;
  bhNo: string;
  clientName: string;
  contactNo: string;
  address: string;
  siteDepth: number;
  endOfHole: number;
  waterBreaks: {
    break1: number;
    break2: number;
    break3: number;
  };
  casing: {
    size: string;
    metres: number;
    type: string;
  };
  airoundProfile: string;
  bitSize6: string;
  bitSize5: string;
  waterYield: string;
  literage: {
    neardown: number;
    drawdown: number;
  };
  crew: {
    siteManager: string;
    driller: string;
    offsider: string;
  };
  coordinates: {
    start: { lat: string; lon: string };
    end: { lat: string; lon: string };
  };
  workHours: {
    date: string;
    time: string;
    compressorHrs: number;
    donkeyHrs: number;
    rigHrs: number;
    hoseKm: number;
    fuelDonkey: number;
    fuelCompressor: number;
  };
  status: 'drilling' | 'completed' | 'dry_hole' | 'successful' | 'casing' | 'testing';
  result: 'successful' | 'dry_hole' | 'partial' | 'pending';
  notes?: string;
  photos?: string[];
  jobId: string;
  jobName: string;
}

interface DrillingJob {
  id: string;
  jobName: string;
  clientName: string;
  siteName: string;
  status: 'assigned' | 'in_progress' | 'drilling' | 'testing' | 'completed' | 'dry_hole';
  assignedTeam: string;
  startDate?: string;
  completionDate?: string;
  depth?: number;
  waterYield?: string;
}

const DrillingOperations: React.FC = () => {
  const [reports, setReports] = useState<DrillingReport[]>([]);
  const [jobs, setJobs] = useState<DrillingJob[]>([]);
  const [filteredReports, setFilteredReports] = useState<DrillingReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReport, setSelectedReport] = useState<DrillingReport | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [newReportDialogOpen, setNewReportDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  // Mock data
  useEffect(() => {
    const mockReports: DrillingReport[] = [
      {
        id: '1',
        reportNumber: '0523',
        date: '13/5/25',
        bhNo: '25',
        clientName: 'ZIMASA',
        contactNo: '0712345678',
        address: 'CROSSMANS MINING 5 WARD',
        siteDepth: 90,
        endOfHole: 90,
        waterBreaks: {
          break1: 18,
          break2: 52,
          break3: 0,
        },
        casing: {
          size: '155mm',
          metres: 90,
          type: '140 casing',
        },
        airoundProfile: '1-6: Sandy, 6-90: Granite',
        bitSize6: '203mm 0-18m',
        bitSize5: '165mm 18-90m',
        waterYield: '2000L/hr',
        literage: {
          neardown: 8,
          drawdown: 32,
        },
        crew: {
          siteManager: 'Vincent Mutekedza',
          driller: 'ERIC',
          offsider: 'ARLICE',
        },
        coordinates: {
          start: { lat: '17°31\'49"E', lon: '31°24\'51"S' },
          end: { lat: '17°31\'51"E', lon: '31°24\'53"S' },
        },
        workHours: {
          date: '15/05',
          time: '15:00',
          compressorHrs: 40.4,
          donkeyHrs: 86.4,
          rigHrs: 38.2,
          hoseKm: 10.988,
          fuelDonkey: 110.8,
          fuelCompressor: 279.8,
        },
        status: 'completed',
        result: 'successful',
        jobId: 'JOB001',
        jobName: 'Crossmans Mining Borehole',
      },
      {
        id: '2',
        reportNumber: '0524',
        date: '14/5/25',
        bhNo: '26',
        clientName: 'Chivhu School',
        contactNo: '0771234567',
        address: 'Chivhu Primary School',
        siteDepth: 65,
        endOfHole: 65,
        waterBreaks: {
          break1: 0,
          break2: 0,
          break3: 0,
        },
        casing: {
          size: '155mm',
          metres: 65,
          type: '140 casing',
        },
        airoundProfile: 'Clay and rock formation',
        bitSize6: '203mm 0-65m',
        bitSize5: '',
        waterYield: 'Dry',
        literage: {
          neardown: 0,
          drawdown: 0,
        },
        crew: {
          siteManager: 'John Makoni',
          driller: 'Peter',
          offsider: 'Mike',
        },
        coordinates: {
          start: { lat: '19°01\'23"E', lon: '30°53\'45"S' },
          end: { lat: '19°01\'23"E', lon: '30°53\'45"S' },
        },
        workHours: {
          date: '14/05',
          time: '12:00',
          compressorHrs: 25.5,
          donkeyHrs: 45.2,
          rigHrs: 24.8,
          hoseKm: 6.5,
          fuelDonkey: 65.0,
          fuelCompressor: 145.5,
        },
        status: 'completed',
        result: 'dry_hole',
        notes: 'No water encountered at any depth. Recommend alternative site.',
        jobId: 'JOB002',
        jobName: 'Chivhu School Borehole',
      },
    ];

    const mockJobs: DrillingJob[] = [
      {
        id: 'JOB003',
        jobName: 'Venice Community Borehole',
        clientName: 'Venice Trust',
        siteName: 'Venice Site A',
        status: 'drilling',
        assignedTeam: 'Team Alpha',
        startDate: new Date().toISOString(),
      },
      {
        id: 'JOB004',
        jobName: 'Mutare Industrial',
        clientName: 'Mutare Beverages',
        siteName: 'Factory Grounds',
        status: 'assigned',
        assignedTeam: 'Team Beta',
      },
      {
        id: 'JOB005',
        jobName: 'Rural Clinic Water',
        clientName: 'Health Ministry',
        siteName: 'Gweru Clinic',
        status: 'testing',
        assignedTeam: 'Team Alpha',
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        depth: 75,
        waterYield: 'Testing...',
      },
    ];

    setReports(mockReports);
    setFilteredReports(mockReports);
    setJobs(mockJobs);
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter]);

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'dry_hole') {
        filtered = filtered.filter(report => report.result === 'dry_hole');
      } else if (statusFilter === 'successful') {
        filtered = filtered.filter(report => report.result === 'successful');
      } else {
        filtered = filtered.filter(report => report.status === statusFilter);
      }
    }

    setFilteredReports(filtered);
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setNewReportDialogOpen(true);
    setActiveStep(0);
  };

  const handleViewReport = (report: DrillingReport) => {
    setSelectedReport(report);
    setReportDialogOpen(true);
  };

  const handlePrintReport = (report: DrillingReport) => {
    // Generate printable report
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Borehole Site Report - ${report.reportNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { text-align: center; color: #2E7D32; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .header-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .section { margin: 20px 0; }
              .section-title { font-weight: bold; margin-bottom: 10px; color: #2E7D32; }
            </style>
          </head>
          <body>
            <h1>BOREHOLE SITE REPORT</h1>
            <div class="header-section">
              <div>Report No: ${report.reportNumber}</div>
              <div>Date: ${report.date}</div>
            </div>
            
            <table>
              <tr><th>BH No.</th><td>${report.bhNo}</td></tr>
              <tr><th>Client Name</th><td>${report.clientName}</td></tr>
              <tr><th>Contact No.</th><td>${report.contactNo}</td></tr>
              <tr><th>Address</th><td>${report.address}</td></tr>
              <tr><th>Site Depth</th><td>${report.siteDepth}m</td></tr>
              <tr><th>End of Hole</th><td>${report.endOfHole}m</td></tr>
            </table>
            
            <div class="section">
              <div class="section-title">Water Breaks</div>
              <table>
                <tr><th>Break 1</th><td>${report.waterBreaks.break1}m</td></tr>
                <tr><th>Break 2</th><td>${report.waterBreaks.break2}m</td></tr>
                <tr><th>Break 3</th><td>${report.waterBreaks.break3}m</td></tr>
              </table>
            </div>
            
            <div class="section">
              <div class="section-title">Casing</div>
              <table>
                <tr><th>Size</th><td>${report.casing.size}</td></tr>
                <tr><th>Metres</th><td>${report.casing.metres}m</td></tr>
                <tr><th>Type</th><td>${report.casing.type}</td></tr>
              </table>
            </div>
            
            <div class="section">
              <div class="section-title">Ground Profile</div>
              <p>${report.airoundProfile}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Water Yield</div>
              <p>${report.waterYield}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Crew</div>
              <table>
                <tr><th>Site Manager</th><td>${report.crew.siteManager}</td></tr>
                <tr><th>Driller</th><td>${report.crew.driller}</td></tr>
                <tr><th>Offsider</th><td>${report.crew.offsider}</td></tr>
              </table>
            </div>
            
            <div class="section">
              <div class="section-title">Work Hours</div>
              <table>
                <tr><th>Compressor Hrs</th><td>${report.workHours.compressorHrs}</td></tr>
                <tr><th>Donkey Hrs</th><td>${report.workHours.donkeyHrs}</td></tr>
                <tr><th>Rig Hrs</th><td>${report.workHours.rigHrs}</td></tr>
                <tr><th>Fuel Donkey</th><td>${report.workHours.fuelDonkey}L</td></tr>
                <tr><th>Fuel Compressor</th><td>${report.workHours.fuelCompressor}L</td></tr>
              </table>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'successful':
        return 'success';
      case 'drilling':
      case 'testing':
        return 'info';
      case 'dry_hole':
        return 'error';
      case 'assigned':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'successful':
        return <CheckCircle />;
      case 'drilling':
        return <Build />;
      case 'testing':
        return <Opacity />;
      case 'dry_hole':
        return <TrendingDown />;
      case 'assigned':
        return <Schedule />;
      default:
        return <Engineering />;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'successful':
        return <Water color="primary" />;
      case 'dry_hole':
        return <Cancel color="error" />;
      default:
        return <Schedule color="action" />;
    }
  };

  const stats = {
    totalDrilled: reports.length,
    successful: reports.filter(r => r.result === 'successful').length,
    dryHoles: reports.filter(r => r.result === 'dry_hole').length,
    inProgress: jobs.filter(j => j.status === 'drilling' || j.status === 'testing').length,
  };

  const steps = [
    'Basic Information',
    'Drilling Details',
    'Water & Casing',
    'Crew & Equipment',
    'Review & Submit',
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Drilling Operations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage drilling activities and generate site reports
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stats.totalDrilled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Boreholes Drilled
                  </Typography>
                </Box>
                <Engineering sx={{ fontSize: 40, color: 'primary.light', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #11cdef 0%, #1171ef 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    {stats.successful}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Successful Wells
                  </Typography>
                </Box>
                <Water sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f5365c 0%, #f56565 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    {stats.dryHoles}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Dry Holes
                  </Typography>
                </Box>
                <TrendingDown sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    {stats.inProgress}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Currently Drilling
                  </Typography>
                </Box>
                <Build sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Active Jobs" icon={<Build />} iconPosition="start" />
          <Tab label="Drilling Reports" icon={<Description />} iconPosition="start" />
          <Tab 
            label="Dry Holes" 
            icon={
              <Badge badgeContent={stats.dryHoles} color="error">
                <TrendingDown />
              </Badge>
            } 
            iconPosition="start" 
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {jobs.map((job) => (
            <Grid size={4} key={job.id}>
              <Card sx={{ 
                border: job.status === 'drilling' ? 2 : 1,
                borderColor: job.status === 'drilling' ? 'primary.main' : 'divider'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {job.jobName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.clientName}
                      </Typography>
                    </Box>
                    <Chip
                      label={job.status.replace('_', ' ')}
                      color={getStatusColor(job.status) as any}
                      size="small"
                      icon={getStatusIcon(job.status)}
                    />
                  </Box>
                  
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocationOn fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={job.siteName} />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Engineering fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={job.assignedTeam} />
                    </ListItem>
                    {job.startDate && (
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CalendarToday fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={`Started: ${new Date(job.startDate).toLocaleDateString()}`} />
                      </ListItem>
                    )}
                    {job.depth && (
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <TrendingDown fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={`Depth: ${job.depth}m`} />
                      </ListItem>
                    )}
                  </List>

                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    {job.status === 'assigned' && (
                      <Button 
                        variant="contained" 
                        fullWidth
                        startIcon={<PlayArrow />}
                        onClick={() => {
                          // Update job status to drilling
                          const updatedJobs = jobs.map(j => 
                            j.id === job.id 
                              ? { ...j, status: 'drilling', startDate: new Date().toISOString() }
                              : j
                          );
                          setJobs(updatedJobs);
                        }}
                      >
                        Start Drilling
                      </Button>
                    )}
                    {job.status === 'drilling' && (
                      <Button 
                        variant="contained" 
                        fullWidth
                        color="warning"
                        onClick={handleCreateReport}
                        startIcon={<AssignmentTurnedIn />}
                      >
                        Complete Report
                      </Button>
                    )}
                    {job.status === 'testing' && (
                      <Button 
                        variant="outlined" 
                        fullWidth
                        startIcon={<Opacity />}
                      >
                        Update Test Results
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search reports..."
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter"
              >
                <MenuItem value="all">All Reports</MenuItem>
                <MenuItem value="successful">Successful</MenuItem>
                <MenuItem value="dry_hole">Dry Holes</MenuItem>
                <MenuItem value="drilling">In Progress</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateReport}
            >
              New Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
            >
              Upload
            </Button>
          </Box>

          {/* Reports Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Site/Address</TableCell>
                  <TableCell align="center">Depth (m)</TableCell>
                  <TableCell align="center">Water Yield</TableCell>
                  <TableCell align="center">Result</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {report.reportNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {report.clientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.contactNo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {report.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            BH #{report.bhNo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{report.endOfHole}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          {getResultIcon(report.result)}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              color: report.result === 'dry_hole' ? 'error.main' : 'primary.main'
                            }}
                          >
                            {report.waterYield}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={report.result === 'dry_hole' ? 'Dry Hole' : 'Successful'}
                          color={report.result === 'dry_hole' ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={report.status}
                          color={getStatusColor(report.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View Report">
                            <IconButton size="small" onClick={() => handleViewReport(report)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print">
                            <IconButton size="small" onClick={() => handlePrintReport(report)}>
                              <Print fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredReports.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Dry Hole Analysis: {stats.dryHoles} unsuccessful drilling attempts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              These sites require alternative solutions or new geological surveys
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {filteredReports
              .filter(report => report.result === 'dry_hole')
              .map((report) => (
                <Grid size={6} key={report.id}>
                  <Card sx={{ border: 1, borderColor: 'error.main' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {report.clientName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Report #{report.reportNumber} - {report.date}
                          </Typography>
                        </Box>
                        <Cancel color="error" />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">Location</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {report.address}
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="caption" color="text.secondary">Depth Drilled</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {report.endOfHole}m
                          </Typography>
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="caption" color="text.secondary">Ground Profile</Typography>
                          <Typography variant="body2">
                            {report.airoundProfile}
                          </Typography>
                        </Grid>
                        {report.notes && (
                          <Grid size={12}>
                            <Typography variant="caption" color="text.secondary">Notes</Typography>
                            <Typography variant="body2">
                              {report.notes}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>

                      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="outlined" fullWidth>
                            Request Re-survey
                          </Button>
                          <Button size="small" variant="contained" color="error" fullWidth>
                            Close Job
                          </Button>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Paper>
      )}

      {/* View Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Drilling Report #{selectedReport?.reportNumber}</Typography>
            <Chip
              label={selectedReport?.result === 'dry_hole' ? 'Dry Hole' : 'Successful'}
              color={selectedReport?.result === 'dry_hole' ? 'error' : 'success'}
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Grid container spacing={3}>
              <Grid size={6}>
                <Typography variant="subtitle2" color="text.secondary">Client</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedReport.clientName}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedReport.address}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedReport.contactNo}</Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="subtitle2" color="text.secondary">Site Depth</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedReport.siteDepth}m</Typography>

                <Typography variant="subtitle2" color="text.secondary">End of Hole</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedReport.endOfHole}m</Typography>

                <Typography variant="subtitle2" color="text.secondary">Water Yield</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedReport.waterYield}</Typography>
              </Grid>
              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>Water Breaks</Typography>
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">Break 1</Typography>
                        <Typography variant="h6">{selectedReport.waterBreaks.break1}m</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">Break 2</Typography>
                        <Typography variant="h6">{selectedReport.waterBreaks.break2}m</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="caption" color="text.secondary">Break 3</Typography>
                        <Typography variant="h6">{selectedReport.waterBreaks.break3}m</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePrintReport(selectedReport!)}>Print</Button>
          <Button onClick={() => setReportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DrillingOperations;