import React from 'react';
import { CSpinner } from '@coreui/react';
import { useLoading } from './LoadingContext'; // Import the loading context

const SpinnerOverlay = () => {
  const { loading } = useLoading();

  return loading ? (
    <div className="spinner-overlay">
      <CSpinner color="info" variant="grow" />
    </div>
  ) : null;
};

export default SpinnerOverlay;
