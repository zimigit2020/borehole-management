const axios = require('axios');

const API_BASE_URL = 'https://borehole-management-nuyvk.ondigitalocean.app/api/v1';

// Sample job data
const jobs = [
  { name: 'Borehole BH-2024-001', clientName: 'Rural Development Fund', siteName: 'Mutare Rural', status: 'completed', latitude: -18.9707, longitude: 32.6708 },
  { name: 'Borehole BH-2024-002', clientName: 'UNICEF Zimbabwe', siteName: 'Gweru Central', status: 'drilling', latitude: -19.4500, longitude: 29.8167 },
  { name: 'Borehole BH-2024-003', clientName: 'World Vision', siteName: 'Masvingo East', status: 'surveyed', latitude: -20.0689, longitude: 30.8277 },
  { name: 'Borehole BH-2024-004', clientName: 'Local Government', siteName: 'Bulawayo South', status: 'assigned', latitude: -20.1500, longitude: 28.5833 },
  { name: 'Borehole BH-2024-005', clientName: 'Rural Development Fund', siteName: 'Harare North', status: 'created', latitude: -17.8292, longitude: 31.0522 },
  { name: 'Borehole BH-2024-006', clientName: 'UNICEF Zimbabwe', siteName: 'Mutare Rural', status: 'completed', latitude: -18.8707, longitude: 32.5708 },
  { name: 'Borehole BH-2024-007', clientName: 'World Vision', siteName: 'Gweru Central', status: 'drilling', latitude: -19.3500, longitude: 29.7167 },
  { name: 'Borehole BH-2024-008', clientName: 'Local Government', siteName: 'Masvingo East', status: 'surveyed', latitude: -19.9689, longitude: 30.7277 },
  { name: 'Borehole BH-2024-009', clientName: 'Rural Development Fund', siteName: 'Bulawayo South', status: 'assigned', latitude: -20.0500, longitude: 28.4833 },
  { name: 'Borehole BH-2024-010', clientName: 'UNICEF Zimbabwe', siteName: 'Harare North', status: 'created', latitude: -17.7292, longitude: 31.1522 },
  { name: 'Borehole BH-2024-011', clientName: 'World Vision', siteName: 'Mutare Rural', status: 'completed', latitude: -19.0707, longitude: 32.7708 },
  { name: 'Borehole BH-2024-012', clientName: 'Local Government', siteName: 'Gweru Central', status: 'drilling', latitude: -19.5500, longitude: 29.9167 },
  { name: 'Borehole BH-2024-013', clientName: 'Rural Development Fund', siteName: 'Masvingo East', status: 'surveyed', latitude: -20.1689, longitude: 30.9277 },
  { name: 'Borehole BH-2024-014', clientName: 'UNICEF Zimbabwe', siteName: 'Bulawayo South', status: 'assigned', latitude: -20.2500, longitude: 28.6833 },
  { name: 'Borehole BH-2024-015', clientName: 'World Vision', siteName: 'Harare North', status: 'created', latitude: -17.9292, longitude: 31.2522 },
];

async function populateJobs() {
  try {
    console.log('Logging in as admin...');
    
    // Login as admin
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@borehole.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.access_token;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    console.log('Successfully logged in!\n');
    
    // Check existing jobs first
    console.log('Checking existing jobs...');
    const existingJobs = await axios.get(`${API_BASE_URL}/jobs`, config);
    console.log(`Found ${existingJobs.data.length} existing jobs\n`);
    
    // Create sample jobs
    console.log('Creating sample jobs...');
    let successCount = 0;
    let skipCount = 0;
    
    for (const job of jobs) {
      // Check if job already exists
      const exists = existingJobs.data.some(j => j.name === job.name);
      
      if (exists) {
        console.log(`- Job already exists: ${job.name}`);
        skipCount++;
        continue;
      }
      
      try {
        await axios.post(`${API_BASE_URL}/jobs`, job, config);
        console.log(`✓ Created job: ${job.name} (${job.status})`);
        successCount++;
      } catch (error) {
        console.error(`✗ Failed to create job ${job.name}:`, error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n✅ Job population complete!');
    console.log(`   Created: ${successCount} jobs`);
    console.log(`   Skipped: ${skipCount} jobs (already exist)`);
    console.log(`   Total jobs in system: ${existingJobs.data.length + successCount}`);
    
    // Show status distribution
    const allJobs = await axios.get(`${API_BASE_URL}/jobs`, config);
    const statusCounts = allJobs.data.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nJob Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
  } catch (error) {
    console.error('Failed to populate jobs:', error.response?.data || error.message);
    process.exit(1);
  }
}

populateJobs();