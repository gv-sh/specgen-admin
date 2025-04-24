import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config, { updateApiUrl } from '../config';
import '../index.css';

function Settings() {
  const [settings, setSettings] = useState({
    ai: {
      models: {
        fiction: '',
        image: ''
      },
      parameters: {
        fiction: {
          temperature: 0,
          max_tokens: 0,
          default_story_length: 0
        },
        image: {
          size: '',
          quality: ''
        }
      }
    },
    defaults: {
      content_type: ''
    }
  });
  const [apiUrl, setApiUrl] = useState(config.API_URL);
  const [serverStatus, setServerStatus] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${config.API_URL}/api/settings`);
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showAlert('danger', 'Failed to fetch settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    
    // Test connection on initial load
    const checkServerStatus = async () => {
      try {
        const pingUrl = `${config.API_URL}/api/health/ping`;
        const response = await axios.get(pingUrl, { timeout: 3000 });
        
        if (response.status === 200 && response.data && response.data.message === 'pong') {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        console.error('Initial connection check failed:', error);
        setServerStatus('offline');
      }
    };
    
    checkServerStatus();
  }, [fetchSettings]);

  const handleSettingsChange = (section, subsection, field, value) => {
    if (subsection) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: {
            ...prev[section][subsection],
            [field]: value
          }
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.put(`${config.API_URL}/api/settings`, settings);
      showAlert('success', 'Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      showAlert('danger', 'Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        const response = await axios.post(`${config.API_URL}/api/settings/reset`);
        setSettings(response.data.data);
        showAlert('success', 'Settings reset to defaults');
      } catch (error) {
        console.error('Error resetting settings:', error);
        showAlert('danger', 'Failed to reset settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const testConnection = async (e) => {
    e.preventDefault();
    setIsTesting(true);
    try {
      const pingUrl = `${apiUrl}/api/health/ping`;
      console.log('Testing connection to:', pingUrl);
      const response = await axios.get(pingUrl, { timeout: 5000 });
      
      if (response.status === 200 && response.data && response.data.message === 'pong') {
        setServerStatus('online');
        showAlert('success', 'Successfully connected to the API server!');
      } else {
        setServerStatus('offline');
        showAlert('danger', 'Server responded but with unexpected data');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setServerStatus('offline');
      showAlert('danger', `Failed to connect to API server: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const saveConnection = (e) => {
    e.preventDefault();
    if (updateApiUrl(apiUrl)) {
      showAlert('success', 'API URL updated successfully');
      // Force reload to apply the new API URL to all components
      window.location.reload();
    } else {
      showAlert('danger', 'Failed to update API URL');
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  return (
    <>
      {/* Alert Messages */}
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false, type: '', message: '' })} aria-label="Close"></button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center mb-4">
            <div className="mb-0">AI Settings</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12">
            {/* Server Connection Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <div className="card-title mb-0">API Server Connection</div>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-8">
                    <label htmlFor="apiUrl" className="form-label">API Server URL</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        id="apiUrl"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="http://localhost:3000"
                        aria-describedby="apiUrlHelp"
                      />
                      <button 
                        className={`btn ${serverStatus === 'online' ? 'btn-success' : serverStatus === 'offline' ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={testConnection}
                        disabled={isTesting}
                      >
                        {isTesting ? 'Testing...' : 'Test Connection'}
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={saveConnection}
                        disabled={isTesting || apiUrl === config.API_URL}
                      >
                        Save
                      </button>
                    </div>
                    <div id="apiUrlHelp" className="form-text">
                      Enter the base URL of your API server without /api (e.g., http://localhost:3000)
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Server Status</label>
                    <div className="d-flex align-items-center">
                      <div className={`badge ${
                        serverStatus === 'online' ? 'bg-success' : 
                        serverStatus === 'offline' ? 'bg-danger' : 
                        'bg-secondary'
                      } fs-6 p-2`}>
                        <i className={`bi ${
                          serverStatus === 'online' ? 'bi-cloud-check' : 
                          serverStatus === 'offline' ? 'bi-cloud-slash' : 
                          'bi-question-circle'
                        } me-2`}></i>
                        {serverStatus === 'online' ? 'Connected' : 
                         serverStatus === 'offline' ? 'Disconnected' : 
                         'Unknown'}
                      </div>
                      <div className="ms-3 text-muted">
                        {serverStatus === 'online' ? 'API server is reachable' : 
                         serverStatus === 'offline' ? 'Cannot reach API server' : 
                         'Connection status unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <div className="card-title mb-0">AI Models</div>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="fictionModel" className="form-label">Fiction Model</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fictionModel"
                      value={settings.ai.models.fiction}
                      onChange={(e) => handleSettingsChange('ai', 'models', 'fiction', e.target.value)}
                      aria-describedby="fictionModelHelp"
                    />
                    <div id="fictionModelHelp" className="form-text">The AI model used for fiction generation (e.g., "gpt-4o-mini")</div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="imageModel" className="form-label">Image Model</label>
                    <input
                      type="text"
                      className="form-control"
                      id="imageModel"
                      value={settings.ai.models.image}
                      onChange={(e) => handleSettingsChange('ai', 'models', 'image', e.target.value)}
                      aria-describedby="imageModelHelp"
                    />
                    <div id="imageModelHelp" className="form-text">The AI model used for image generation (e.g., "dall-e-3")</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <div className="card-title mb-0">Fiction Generation Parameters</div>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="temperature" className="form-label">Temperature</label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        className="form-control"
                        id="temperature"
                        value={settings.ai.parameters.fiction.temperature}
                        onChange={(e) => handleSettingsChange('ai', 'parameters', 'fiction', {
                          ...settings.ai.parameters.fiction,
                          temperature: parseFloat(e.target.value)
                        })}
                        aria-describedby="temperatureHelp"
                      />
                    </div>
                    <div id="temperatureHelp" className="form-text">Controls randomness (0.0 to 2.0)</div>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="maxTokens" className="form-label">Max Tokens</label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="100"
                        min="100"
                        className="form-control"
                        id="maxTokens"
                        value={settings.ai.parameters.fiction.max_tokens}
                        onChange={(e) => handleSettingsChange('ai', 'parameters', 'fiction', {
                          ...settings.ai.parameters.fiction,
                          max_tokens: parseInt(e.target.value, 10)
                        })}
                        aria-describedby="maxTokensHelp"
                      />
                    </div>
                    <div id="maxTokensHelp" className="form-text">Maximum tokens to generate</div>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="storyLength" className="form-label">Default Story Length</label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="100"
                        min="100"
                        className="form-control"
                        id="storyLength"
                        value={settings.ai.parameters.fiction.default_story_length}
                        onChange={(e) => handleSettingsChange('ai', 'parameters', 'fiction', {
                          ...settings.ai.parameters.fiction,
                          default_story_length: parseInt(e.target.value, 10)
                        })}
                        aria-describedby="storyLengthHelp"
                      />
                    </div>
                    <div id="storyLengthHelp" className="form-text">Default story length in words</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <div className="card-title mb-0">Image Generation Parameters</div>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="imageSize" className="form-label">Image Size</label>
                    <select
                      className="form-select"
                      id="imageSize"
                      value={settings.ai.parameters.image.size}
                      onChange={(e) => handleSettingsChange('ai', 'parameters', 'image', {
                        ...settings.ai.parameters.image,
                        size: e.target.value
                      })}
                      aria-describedby="imageSizeHelp"
                    >
                      <option value="256x256">256x256</option>
                      <option value="512x512">512x512</option>
                      <option value="1024x1024">1024x1024</option>
                      <option value="1792x1024">1792x1024</option>
                      <option value="1024x1792">1024x1792</option>
                    </select>
                    <div id="imageSizeHelp" className="form-text">Size of generated images</div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="imageQuality" className="form-label">Image Quality</label>
                    <select
                      className="form-select"
                      id="imageQuality"
                      value={settings.ai.parameters.image.quality}
                      onChange={(e) => handleSettingsChange('ai', 'parameters', 'image', {
                        ...settings.ai.parameters.image,
                        quality: e.target.value
                      })}
                      aria-describedby="imageQualityHelp"
                    >
                      <option value="standard">Standard</option>
                      <option value="hd">HD</option>
                    </select>
                    <div id="imageQualityHelp" className="form-text">Quality of generated images</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <div className="card-title mb-0">Default Settings</div>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="defaultContentType" className="form-label">Default Content Type</label>
                    <select
                      className="form-select"
                      id="defaultContentType"
                      value={settings.defaults.content_type}
                      onChange={(e) => handleSettingsChange('defaults', null, 'content_type', e.target.value)}
                      aria-describedby="defaultContentTypeHelp"
                    >
                      <option value="fiction">Fiction</option>
                      <option value="image">Image</option>
                    </select>
                    <div id="defaultContentTypeHelp" className="form-text">Default content type for generation</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between mb-4">
              <button type="button" className="btn btn-danger" onClick={handleReset} disabled={isLoading}>
                Reset to Defaults
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default Settings;