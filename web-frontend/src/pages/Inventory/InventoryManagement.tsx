import React from 'react';
import { Container } from '@mui/material';
import Inventory from '../../components/Inventory/Inventory';

const InventoryManagement: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Inventory />
    </Container>
  );
};

export default InventoryManagement;