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
  Divider,
  Alert,
  Tooltip,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Badge,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  PictureAsPdf,
  LocationOn,
  CalendarToday,
  Person,
  CheckCircle,
  Warning,
  Error,
  Terrain,
  WaterDrop,
  Engineering,
  Description,
  Image,
  Close,
  ZoomIn,
  BarChart,
  Layers,
  Speed,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  Print,
  Share,
  Edit,
  MoreVert,
  Add,
  FileDownload,
} from '@mui/icons-material';
import api from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api';

interface SurveyReport {
  id: string;
  jobId: string;
  jobName: string;
  surveyorId: string;
  surveyorName: string;
  
  // Location Data
  siteName: string;
  constituency: string;
  ward: string;
  latitude: number;
  longitude: number;
  contactPerson?: string;
  contactPhone?: string;
  
  // Geological Data
  geology: string;
  surveyMethod: string;
  
  // Drilling Recommendations
  minDrillingDepth: number;
  maxDrillingDepth: number;
  expectedWaterBreaks: number[];
  recommendations: string;
  
  // Special Notes
  specialNotes?: string;
  disclaimer?: string;
  
  // Attachments
  resistivityGraphUrl?: string;
  sitePhotos: string[];
  
  // Metadata
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  syncedAt?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const SurveyReports: React.FC = () => {
  const [reports, setReports] = useState<SurveyReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<SurveyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [surveyorFilter, setSurveyorFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReport, setSelectedReport] = useState<SurveyReport | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  useEffect(() => {
    // Simple placeholder images using data URIs
    const resistivityGraphDataUri = 'data:image/svg+xml,%3Csvg width="600" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="400" fill="%23f0f0f0"/%3E%3Ctext x="300" y="200" font-family="Arial" font-size="20" text-anchor="middle" fill="%23333"%3EResistivity Graph%3C/text%3E%3C/svg%3E';
    
    const sitePhoto1DataUri = 'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="300" fill="%23E3F2FD"/%3E%3Ctext x="200" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="%23333"%3ESite Photo 1%3C/text%3E%3C/svg%3E';
    
    const sitePhoto2DataUri = 'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="300" fill="%23FFF3E0"/%3E%3Ctext x="200" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="%23333"%3ESite Photo 2%3C/text%3E%3C/svg%3E';

    const mockReports: SurveyReport[] = [
      {
        id: '1',
        jobId: 'job1',
        jobName: 'Venice Borehole',
        surveyorId: 'surv1',
        surveyorName: 'John Makoni',
        siteName: 'Venice',
        constituency: 'Mhondoro Ngezi',
        ward: '7',
        latitude: -18.5067457,
        longitude: 29.7541347,
        contactPerson: 'Mr. Moyo',
        contactPhone: '+263 77 123 4567',
        geology: 'Granite rock',
        surveyMethod: 'Electrical resistivity geophysical method',
        minDrillingDepth: 40,
        maxDrillingDepth: 130,
        expectedWaterBreaks: [15, 40, 65, 90, 110],
        recommendations: 'Driller is recommended to use a temporal casing to counteract collapsing formation(boulders). Driller advised to reach minimum and maximum depth unless adequate yield has been reached.',
        specialNotes: 'Site has good potential for water yield based on resistivity profiles',
        disclaimer: 'The results of this survey are based on observed geology and resistivity profiles. However on account of the erratic changes to constitutions of the surface and underground water bodies due to global climatic changes, borehole/well yield as a Function of rate of recharge, may adversely affect the high to moderate groundwater potential of the area indicated by profile results of the survey.',
        resistivityGraphUrl: resistivityGraphDataUri,
        sitePhotos: [
          sitePhoto1DataUri,
          sitePhoto2DataUri
        ],
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncedAt: new Date().toISOString(),
      },
      {
        id: '2',
        jobId: 'job2',
        jobName: 'Chivhu School Borehole',
        surveyorId: 'surv2',
        surveyorName: 'Sarah Dube',
        siteName: 'Chivhu Primary School',
        constituency: 'Chivhu',
        ward: '3',
        latitude: -19.0234,
        longitude: 30.8965,
        geology: 'Sedimentary rock with clay layers',
        surveyMethod: 'Electrical resistivity and magnetic survey',
        minDrillingDepth: 35,
        maxDrillingDepth: 85,
        expectedWaterBreaks: [20, 45, 70],
        recommendations: 'Good water potential detected. Standard drilling recommended.',
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        approvedBy: 'Admin',
        approvedAt: new Date(Date.now() - 43200000).toISOString(),
        resistivityGraphUrl: 'data:image/svg+xml,%3Csvg width="600" height="400" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="600" height="400" fill="%23f5f5f5"/%3E%3Ctext x="300" y="200" font-family="Arial" font-size="20" text-anchor="middle" fill="%23333"%3EVES Sounding Curve%3C/text%3E%3C/svg%3E',
        sitePhotos: [
          'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="300" fill="%23C8E6C9"/%3E%3Ctext x="200" y="150" font-family="Arial" font-size="14" text-anchor="middle" fill="%23333"%3ESchool Building%3C/text%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="300" fill="%23FFE0B2"/%3E%3Ctext x="200" y="150" font-family="Arial" font-size="14" text-anchor="middle" fill="%23333"%3EDrilling Site%3C/text%3E%3C/svg%3E',
          'data:image/svg+xml,%3Csvg width="400" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="400" height="300" fill="%23E1F5FE"/%3E%3Ctext x="200" y="150" font-family="Arial" font-size="14" text-anchor="middle" fill="%23333"%3EEquipment Setup%3C/text%3E%3C/svg%3E'
        ],
        syncedAt: new Date().toISOString(),
      }
    ];
    
    setReports(mockReports);
    setFilteredReports(mockReports);
    setLoading(false);
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, surveyorFilter]);

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.constituency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.surveyorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.jobName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (surveyorFilter !== 'all') {
      filtered = filtered.filter(report => report.surveyorId === surveyorFilter);
    }

    setFilteredReports(filtered);
  };

  const handleViewDetails = (report: SurveyReport) => {
    setSelectedReport(report);
    setDetailsOpen(true);
    setTabValue(0);
  };

  const handleApprove = async (reportId: string) => {
    try {
      // API call to approve report
      setError(null);
      // Refresh reports
    } catch (err) {
      setError('Failed to approve report');
    }
  };

  const handleReject = async (reportId: string) => {
    try {
      // API call to reject report
      setError(null);
      // Refresh reports
    } catch (err) {
      setError('Failed to reject report');
    }
  };

  const handleGeneratePDF = (report: SurveyReport) => {
    // Create a simple HTML representation and open in new window for printing
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Survey Report - ${report.siteName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #2E7D32; }
              h2 { color: #333; margin-top: 30px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; }
              .water-breaks { display: flex; gap: 10px; margin: 10px 0; }
              .water-break { background: #E3F2FD; padding: 5px 10px; border-radius: 5px; }
              .recommendation { background: #FFF3E0; padding: 15px; border-radius: 5px; margin: 10px 0; }
              .disclaimer { background: #FFEBEE; padding: 15px; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <h1>Geological Survey Report</h1>
            
            <div class="section">
              <h2>Location</h2>
              <table>
                <tr><td class="label">Site Name:</td><td>${report.siteName}</td></tr>
                <tr><td class="label">Constituency:</td><td>${report.constituency}</td></tr>
                <tr><td class="label">Ward:</td><td>${report.ward}</td></tr>
                <tr><td class="label">Coordinates:</td><td>${report.latitude}, ${report.longitude}</td></tr>
                <tr><td class="label">Contact Person:</td><td>${report.contactPerson || 'N/A'}</td></tr>
              </table>
            </div>
            
            <div class="section">
              <h2>Geology</h2>
              <p>${report.geology}</p>
            </div>
            
            <div class="section">
              <h2>Survey Method</h2>
              <p>${report.surveyMethod}</p>
            </div>
            
            <div class="section">
              <h2>Results</h2>
              <p><span class="label">Minimum Drilling Depth:</span> ${report.minDrillingDepth}m</p>
              <p><span class="label">Maximum Drilling Depth:</span> ${report.maxDrillingDepth}m</p>
              <p><span class="label">Expected Water Breaks:</span></p>
              <div class="water-breaks">
                ${report.expectedWaterBreaks.map(depth => `<span class="water-break">${depth}m</span>`).join('')}
              </div>
            </div>
            
            <div class="section recommendation">
              <h2>Recommendations</h2>
              <p>${report.recommendations}</p>
            </div>
            
            ${report.disclaimer ? `
              <div class="section disclaimer">
                <h2>Disclaimer</h2>
                <p>${report.disclaimer}</p>
              </div>
            ` : ''}
            
            <div class="section">
              <p><small>Report generated on ${new Date().toLocaleDateString()}</small></p>
            </div>
          </body>
        </html>
      `);
      pdfWindow.document.close();
      setTimeout(() => {
        pdfWindow.print();
      }, 500);
    }
  };

  const handleExportCSV = () => {
    // Convert reports to CSV format
    const headers = ['Site Name', 'Constituency', 'Ward', 'Latitude', 'Longitude', 'Min Depth', 'Max Depth', 'Status', 'Surveyor', 'Date'];
    const csvData = filteredReports.map(report => [
      report.siteName,
      report.constituency,
      report.ward,
      report.latitude,
      report.longitude,
      report.minDrillingDepth,
      report.maxDrillingDepth,
      report.status,
      report.surveyorName,
      new Date(report.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `survey_reports_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageViewerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Error />;
      default:
        return <Warning />;
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    approved: reports.filter(r => r.status === 'approved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Survey Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and manage geological survey reports from field teams
            </Typography>
          </Box>
          <Alert severity="info" sx={{ maxWidth: 400 }}>
            <Typography variant="body2">
              <strong>Note:</strong> New surveys are created from the mobile app by field surveyors. 
              Surveys appear here after syncing from the field.
            </Typography>
          </Alert>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Reports
                  </Typography>
                </Box>
                <Description sx={{ fontSize: 40, color: 'primary.light', opacity: 0.3 }} />
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
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Pending Review
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Approved
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    Rejected
                  </Typography>
                </Box>
                <Error sx={{ fontSize: 40, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search reports..."
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
            </Grid>
            
            <Grid size={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Surveyor</InputLabel>
                <Select
                  value={surveyorFilter}
                  label="Surveyor"
                  onChange={(e) => setSurveyorFilter(e.target.value)}
                >
                  <MenuItem value="all">All Surveyors</MenuItem>
                  <MenuItem value="surv1">John Makoni</MenuItem>
                  <MenuItem value="surv2">Sarah Dube</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Site Information</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Surveyor</TableCell>
                <TableCell>Depths</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {report.siteName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {report.jobName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.constituency}, Ward {report.ward}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {report.surveyorName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2">
                          {report.surveyorName}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ArrowDownward sx={{ fontSize: 14, color: 'info.main' }} />
                          <Typography variant="body2">
                            Min: {report.minDrillingDepth}m
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ArrowUpward sx={{ fontSize: 14, color: 'success.main' }} />
                          <Typography variant="body2">
                            Max: {report.maxDrillingDepth}m
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(report.status)}
                        label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        color={getStatusColor(report.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(report.createdAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(report)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Generate PDF">
                          <IconButton
                            size="small"
                            onClick={() => handleGeneratePDF(report)}
                          >
                            <PictureAsPdf />
                          </IconButton>
                        </Tooltip>
                        {report.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApprove(report.id)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleReject(report.id)}
                              >
                                <Error />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredReports.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Paper>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Survey Report Details</Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
                <Tab label="Site Information" icon={<LocationOn />} iconPosition="start" />
                <Tab label="Survey Data" icon={<Terrain />} iconPosition="start" />
                <Tab label="Recommendations" icon={<Engineering />} iconPosition="start" />
                <Tab label="Attachments" icon={<Image />} iconPosition="start" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid size={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon><LocationOn /></ListItemIcon>
                        <ListItemText
                          primary="Site Name"
                          secondary={selectedReport.siteName}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Layers /></ListItemIcon>
                        <ListItemText
                          primary="Constituency"
                          secondary={selectedReport.constituency}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Badge /></ListItemIcon>
                        <ListItemText
                          primary="Ward"
                          secondary={`Ward ${selectedReport.ward}`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid size={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon><LocationOn /></ListItemIcon>
                        <ListItemText
                          primary="GPS Coordinates"
                          secondary={`${selectedReport.latitude.toFixed(6)}, ${selectedReport.longitude.toFixed(6)}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Person /></ListItemIcon>
                        <ListItemText
                          primary="Contact Person"
                          secondary={selectedReport.contactPerson || 'Not specified'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarToday /></ListItemIcon>
                        <ListItemText
                          primary="Survey Date"
                          secondary={new Date(selectedReport.createdAt).toLocaleDateString()}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Geology
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedReport.geology}
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Survey Method
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedReport.surveyMethod}
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Expected Water Breaks
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {selectedReport.expectedWaterBreaks.map((depth, index) => (
                        <Chip
                          key={index}
                          icon={<WaterDrop />}
                          label={`${depth}m`}
                          color="info"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Drilling Depth Range
                    </Typography>
                    <Typography variant="body2">
                      Minimum: {selectedReport.minDrillingDepth}m | Maximum: {selectedReport.maxDrillingDepth}m
                    </Typography>
                  </Alert>

                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Recommendations
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedReport.recommendations}
                  </Typography>

                  {selectedReport.specialNotes && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Special Notes
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {selectedReport.specialNotes}
                      </Typography>
                    </>
                  )}

                  {selectedReport.disclaimer && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Disclaimer
                      </Typography>
                      <Typography variant="body2">
                        {selectedReport.disclaimer}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Box>
                  {selectedReport.resistivityGraphUrl && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Resistivity Graph
                      </Typography>
                      <Paper
                        sx={{
                          p: 2,
                          mb: 3,
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 }
                        }}
                        onClick={() => handleImageClick(selectedReport.resistivityGraphUrl!)}
                      >
                        <img
                          src={selectedReport.resistivityGraphUrl}
                          alt="Resistivity Graph"
                          style={{ width: '100%', height: 'auto' }}
                        />
                      </Paper>
                    </>
                  )}

                  {selectedReport.sitePhotos.length > 0 && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Site Photos
                      </Typography>
                      <ImageList cols={3} gap={8}>
                        {selectedReport.sitePhotos.map((photo, index) => (
                          <ImageListItem
                            key={index}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.8 }
                            }}
                            onClick={() => handleImageClick(photo)}
                          >
                            <img
                              src={photo}
                              alt={`Site photo ${index + 1}`}
                              style={{ height: 200, objectFit: 'cover' }}
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </>
                  )}
                </Box>
              </TabPanel>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {selectedReport?.status === 'pending' && (
            <>
              <Button
                onClick={() => handleReject(selectedReport.id)}
                color="error"
                startIcon={<Error />}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedReport.id)}
                color="success"
                variant="contained"
                startIcon={<CheckCircle />}
              >
                Approve
              </Button>
            </>
          )}
          <Button
            onClick={() => handleGeneratePDF(selectedReport!)}
            startIcon={<PictureAsPdf />}
          >
            Generate PDF
          </Button>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setImageViewerOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1, bgcolor: 'background.paper' }}
          >
            <Close />
          </IconButton>
          <img
            src={selectedImage}
            alt="Full size"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SurveyReports;