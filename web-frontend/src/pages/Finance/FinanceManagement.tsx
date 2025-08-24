import React from 'react';
import { Container } from '@mui/material';
import Finance from '../../components/Finance/Finance';

const FinanceManagement: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Finance />
    </Container>
  );
};

export default FinanceManagement;