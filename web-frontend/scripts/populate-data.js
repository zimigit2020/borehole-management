const axios = require('axios');

const API_BASE_URL = 'https://borehole-management-nuyvk.ondigitalocean.app/api/v1';

// Sample data
const clients = [
  { name: 'Rural Development Fund', contactName: 'John Mutasa', contactPhone: '+263771234567', contactEmail: 'john@rdf.co.zw' },
  { name: 'UNICEF Zimbabwe', contactName: 'Sarah Ndlovu', contactPhone: '+263772345678', contactEmail: 'sarah@unicef.org' },
  { name: 'World Vision', contactName: 'Peter Moyo', contactPhone: '+263773456789', contactEmail: 'peter@worldvision.org' },
  { name: 'Local Government', contactName: 'Mary Chigumba', contactPhone: '+263774567890', contactEmail: 'mary@gov.zw' },
];

const sites = [
  { name: 'Mutare Rural', latitude: -18.9707, longitude: 32.6708 },
  { name: 'Gweru Central', latitude: -19.4500, longitude: 29.8167 },
  { name: 'Masvingo East', latitude: -20.0689, longitude: 30.8277 },
  { name: 'Bulawayo South', latitude: -20.1500, longitude: 28.5833 },
  { name: 'Harare North', latitude: -17.8292, longitude: 31.0522 },
];

const users = [
  { email: 'manager@borehole.com', password: 'manager123', firstName: 'Project', lastName: 'Manager', role: 'project_manager', phone: '+263775555001' },
  { email: 'surveyor1@borehole.com', password: 'surveyor123', firstName: 'Tom', lastName: 'Survey', role: 'surveyor', phone: '+263775555002' },
  { email: 'surveyor2@borehole.com', password: 'surveyor123', firstName: 'Jane', lastName: 'Maps', role: 'surveyor', phone: '+263775555003' },
  { email: 'driller1@borehole.com', password: 'driller123', firstName: 'Mike', lastName: 'Drill', role: 'driller', phone: '+263775555004' },
  { email: 'driller2@borehole.com', password: 'driller123', firstName: 'David', lastName: 'Bore', role: 'driller', phone: '+263775555005' },
];

async function populateData() {
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
    
    console.log('Successfully logged in!');
    
    // Create users
    console.log('\nCreating users...');
    const createdUsers = [];
    for (const user of users) {
      try {
        const response = await axios.post(`${API_BASE_URL}/users`, user, config);
        createdUsers.push(response.data);
        console.log(`✓ Created user: ${user.email}`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`- User already exists: ${user.email}`);
        } else {
          console.error(`✗ Failed to create user ${user.email}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    // Create clients
    console.log('\nCreating clients...');
    const createdClients = [];
    for (const client of clients) {
      try {
        const response = await axios.post(`${API_BASE_URL}/clients`, client, config);
        createdClients.push(response.data);
        console.log(`✓ Created client: ${client.name}`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`- Client already exists: ${client.name}`);
          // Get existing client
          const getResponse = await axios.get(`${API_BASE_URL}/clients`, config);
          const existing = getResponse.data.find(c => c.name === client.name);
          if (existing) createdClients.push(existing);
        } else {
          console.error(`✗ Failed to create client ${client.name}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    // Create sites
    console.log('\nCreating sites...');
    const createdSites = [];
    for (const site of sites) {
      try {
        const response = await axios.post(`${API_BASE_URL}/sites`, site, config);
        createdSites.push(response.data);
        console.log(`✓ Created site: ${site.name}`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`- Site already exists: ${site.name}`);
          // Get existing site
          const getResponse = await axios.get(`${API_BASE_URL}/sites`, config);
          const existing = getResponse.data.find(s => s.name === site.name);
          if (existing) createdSites.push(existing);
        } else {
          console.error(`✗ Failed to create site ${site.name}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    // Create sample jobs using clientName and siteName
    console.log('\nCreating sample jobs...');
    const jobStatuses = ['created', 'assigned', 'surveyed', 'drilling', 'completed'];
    const jobNames = [
      'Borehole BH-2024-001',
      'Borehole BH-2024-002', 
      'Borehole BH-2024-003',
      'Borehole BH-2024-004',
      'Borehole BH-2024-005',
      'Borehole BH-2024-006',
      'Borehole BH-2024-007',
      'Borehole BH-2024-008',
      'Borehole BH-2024-009',
      'Borehole BH-2024-010',
    ];
    
    for (let i = 0; i < jobNames.length; i++) {
      const job = {
        name: jobNames[i],
        clientName: clients[i % clients.length].name,
        siteName: sites[i % sites.length].name,
        status: jobStatuses[i % jobStatuses.length],
        latitude: -17.8292 + (Math.random() - 0.5) * 2,
        longitude: 31.0522 + (Math.random() - 0.5) * 2,
      };
      
      try {
        await axios.post(`${API_BASE_URL}/jobs`, job, config);
        console.log(`✓ Created job: ${job.name} (${job.status})`);
      } catch (error) {
        console.error(`✗ Failed to create job ${job.name}:`, error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n✅ Sample data population complete!');
    console.log('\nYou can now log in with:');
    console.log('- Admin: admin@borehole.com / admin123');
    console.log('- Manager: manager@borehole.com / manager123');
    console.log('- Surveyor: surveyor1@borehole.com / surveyor123');
    console.log('- Driller: driller1@borehole.com / driller123');
    
  } catch (error) {
    console.error('Failed to populate data:', error.response?.data || error.message);
    process.exit(1);
  }
}

populateData();