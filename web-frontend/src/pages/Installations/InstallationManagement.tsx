import React from 'react';
import { Container } from '@mui/material';
import Installations from '../../components/Installations/Installations';

const InstallationManagement: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Installations />
    </Container>
  );
};

export default InstallationManagement;