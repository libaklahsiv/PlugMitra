import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AddChargerForm } from '../components/AddChargerForm';

export const AddChargerPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-16">
      <AddChargerForm onSuccessNavigate={() => navigate('/explore')} />
    </div>
  );
};
