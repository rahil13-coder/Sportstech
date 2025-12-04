import React from 'react';
import CricketStatsDashboard from '../components/CricketStatsDashboard';
import { useNavigate } from 'react-router-dom';

const DataDrivenAthletePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <CricketStatsDashboard onBack={handleBack} />
    </div>
  );
};

export default DataDrivenAthletePage;




