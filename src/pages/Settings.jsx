import React, { useState, useCallback, useEffect } from "react";
import '../assets/css/settings.css';
import ToggleCheckBox from "../Componenets/ToggleCheckBox";
import Button from "../Componenets/Button";
import Breadcrums from "../Componenets/Breadcrums";
import useAuth from '../hooks/useAuth';

const Settings = () => {
  const { user } = useAuth();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const validateForm = useCallback(() => {
    const errors = {};
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (!passwordRegex.test(formData.newPassword)) {
      errors.newPassword = 'Password must be 8+ chars, include letter, number, special char';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error on typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [validationErrors]);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setMessage({ 
        type: 'success', 
        text: 'Password changed successfully' 
      });
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(prev => !prev);
    // TODO: Implement actual two-factor toggle logic
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="settings-title">
          <Breadcrums name="Settings" />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-section-title">Security Settings</div>
        </div>

        <div className="two-factor-container">
          <div className="two-factor-text">
            <h4>Two-Factor Authentication</h4>
            <p>Add an extra layer of security to your account</p>
          </div>
          <div onClick={toggleTwoFactor}>
            <ToggleCheckBox 
              checked={twoFactorEnabled}
              onChange={toggleTwoFactor}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="password-change-container">
          {[
            { 
              name: 'currentPassword', 
              label: 'Current Password', 
              type: 'password' 
            },
            { 
              name: 'newPassword', 
              label: 'New Password', 
              type: 'password' 
            },
            { 
              name: 'confirmPassword', 
              label: 'Confirm New Password', 
              type: 'password' 
            }
          ].map(({ name, label, type }) => (
            <div key={name} className="password-input-group">
              <input
                type={showPasswords[name] ? 'text' : type}
                name={name}
                className={`password-input ${validationErrors[name] ? 'is-invalid' : ''}`}
                placeholder={label}
                value={formData[name]}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {name !== 'confirmPassword' && (
                <span 
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility(name)}
                >
                  <i 
                    className={`fas ${showPasswords[name] ? 'fa-eye-slash' : 'fa-eye'}`}
                  />
                </span>
              )}
              {validationErrors[name] && (
                <div className="validation-error">{validationErrors[name]}</div>
              )}
            </div>
          ))}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? (
              <i className="fas fa-check-circle" />
            ) : (
              <i className="fas fa-exclamation-triangle" />
            )}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
