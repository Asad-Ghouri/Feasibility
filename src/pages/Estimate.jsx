import React, { useState, useCallback, useMemo } from 'react';
import '../assets/css/estimate.css';
import Breadcrums from '../Componenets/Breadcrums';

const Estimate = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [estimateData, setEstimateData] = useState([
    {
      contractor: 'Contractor A',
      estimate: 10000,
      marketValue: 10000,
      discrepancyType: 'no-discrepancy'
    },
    {
      contractor: 'Contractor B',
      estimate: 12000,
      marketValue: 11500,
      discrepancyType: 'minor-discrepancy'
    },
    {
      contractor: 'Contractor C',
      estimate: 15000,
      marketValue: 10000,
      discrepancyType: 'major-discrepancy'
    }
  ]);

  const handleUpload = useCallback(() => {
    console.log('Uploading file:', searchTerm);
    // Simulate upload logic with timeout
    setTimeout(() => {
      alert('File uploaded successfully');
    }, 1000);
  }, [searchTerm]);

  const handleNotifyTeam = useCallback(() => {
    // Simulate team notification
    alert('Team Notified');
  }, []);

  const handleDownloadReport = useCallback(() => {
    // Simulate report download
    alert('Downloading Comprehensive Estimate Report');
  }, []);

  const handleFlagReview = useCallback(() => {
    // Simulate flagging for review
    alert('Estimates Flagged for Detailed Review');
  }, []);

  const getDiscrepancyLabel = useMemo(() => ({
    'no-discrepancy': 'No Discrepancy',
    'minor-discrepancy': 'Minor Discrepancy',
    'major-discrepancy': 'Major Discrepancy'
  }), []);

  const renderDiscrepancyTag = useCallback((type) => {
    return (
      <span className={`discrepancy ${type}`}>
        {getDiscrepancyLabel[type]}
      </span>
    );
  }, [getDiscrepancyLabel]);

  return (
    <div className="estimate-container">
      <div className="estimate-header">
        <div className="estimate-title">
          <Breadcrums name="Estimate" />
        </div>
      </div>

      <div className="upload-section">
        <input 
          type="text" 
          className="upload-input" 
          placeholder="Search or upload contractor estimates" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          className="action-button notify-button" 
          onClick={handleUpload}
        >
          Upload
        </button>
      </div>

      <div className="comparison-table">
        <div className="comparison-header">
          <h3>Estimate Comparisons</h3>
        </div>
        <div className="comparison-row">
          <ul>
            <li>Contractor</li>
            <li>Estimate</li>
            <li>Market Value</li>
            <li>Discrepancy</li>
          </ul>
        </div>
        {estimateData.map((entry, index) => (
          <div key={index} className="comparison-row">
            <ul>
              <li>{entry.contractor}</li>
              <li>${entry.estimate.toLocaleString()}</li>
              <li>${entry.marketValue.toLocaleString()}</li>
              <li>
                {renderDiscrepancyTag(entry.discrepancyType)}
              </li>
            </ul>
          </div>
        ))}
      </div>

      <div className="actions-section">
        <div className="actions-header">
          <h3>Actions</h3>
        </div>
        <div className="actions-buttons">
          <button 
            className="action-button notify-button" 
            onClick={handleNotifyTeam}
          >
            Notify Team
          </button>
          <button 
            className="action-button download-button" 
            onClick={handleDownloadReport}
          >
            Download Report
          </button>
          <button 
            className="action-button flag-button" 
            onClick={handleFlagReview}
          >
            Flag for Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default Estimate;