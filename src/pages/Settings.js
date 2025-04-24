import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config, { updateApiUrl } from '../config';
import '../index.css';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Alert } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';

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
        <Alert 
          variant={alert.type === 'success' ? 'default' : alert.type === 'danger' ? 'destructive' : 'secondary'} 
          onDismiss={() => setAlert({ show: false, type: '', message: '' })}
          className="mb-6"
        >
          {alert.message}
        </Alert>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Server Connection Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>API Server Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="apiUrl" className="text-sm font-medium">API Server URL</label>
                  <div className="flex space-x-2">
                    <Input
                      id="apiUrl"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="http://localhost:3000"
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant={serverStatus === 'online' ? 'default' : serverStatus === 'offline' ? 'destructive' : 'secondary'}
                      onClick={testConnection}
                      disabled={isTesting}
                    >
                      {isTesting ? 'Testing...' : 'Test'}
                    </Button>
                    <Button 
                      type="button"
                      onClick={saveConnection}
                      disabled={isTesting || apiUrl === config.API_URL}
                    >
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the base URL of your API server without /api (e.g., http://localhost:3000)
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Server Status</label>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={serverStatus === 'online' ? 'default' : serverStatus === 'offline' ? 'destructive' : 'secondary'}
                      className="p-2"
                    >
                      {serverStatus === 'online' ? 'Connected' : 
                       serverStatus === 'offline' ? 'Disconnected' : 
                       'Unknown'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {serverStatus === 'online' ? 'API server is reachable' : 
                       serverStatus === 'offline' ? 'Cannot reach API server' : 
                       'Connection status unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Models Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>AI Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fictionModel" className="text-sm font-medium">Fiction Model</label>
                  <Input
                    id="fictionModel"
                    value={settings.ai.models.fiction}
                    onChange={(e) => handleSettingsChange('ai', 'models', 'fiction', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The AI model used for fiction generation (e.g., "gpt-4o-mini")
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="imageModel" className="text-sm font-medium">Image Model</label>
                  <Input
                    id="imageModel"
                    value={settings.ai.models.image}
                    onChange={(e) => handleSettingsChange('ai', 'models', 'image', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The AI model used for image generation (e.g., "dall-e-3")
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fiction Generation Parameters Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Fiction Generation Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="temperature" className="text-sm font-medium">Temperature</label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={settings.ai.parameters.fiction.temperature}
                    onChange={(e) => handleSettingsChange('ai', 'parameters', 'fiction', {
                      ...settings.ai.parameters.fiction,
                      temperature: parseFloat(e.target.value)
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness (0.0 to 2.0)
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="maxTokens" className="text-sm font-medium">Max Tokens</label>
                  <Input
                    id="maxTokens"
                    type="number"
                    step="100"
                    min="100"
                    value={settings.ai.parameters.fiction.max_tokens}
                    onChange={(e) => handleSettingsChange('ai', 'parameters', 'fiction', {
                      ...settings.ai.parameters.fiction,
                      max_tokens: parseInt(e.target.value, 10)
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum tokens to generate
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="storyLength" className="text-sm font-medium">Default Story Length</label>
                  <Input
                    id="storyLength"
                    type="number"
                    step="100"
                    min="100"
                    value={settings.ai.parameters.fiction.default_story_length}
                    onChange={(e) => handleSettingsChange('ai', 'parameters', 'fiction', {
                      ...settings.ai.parameters.fiction,
                      default_story_length: parseInt(e.target.value, 10)
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default story length in words
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Generation Parameters Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Image Generation Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="imageSize" className="text-sm font-medium">Image Size</label>
                  <Select
                    id="imageSize"
                    value={settings.ai.parameters.image.size}
                    onChange={(e) => handleSettingsChange('ai', 'parameters', 'image', {
                      ...settings.ai.parameters.image,
                      size: e.target.value
                    })}
                  >
                    <option value="256x256">256x256</option>
                    <option value="512x512">512x512</option>
                    <option value="1024x1024">1024x1024</option>
                    <option value="1792x1024">1792x1024</option>
                    <option value="1024x1792">1024x1792</option>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Size of generated images
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="imageQuality" className="text-sm font-medium">Image Quality</label>
                  <Select
                    id="imageQuality"
                    value={settings.ai.parameters.image.quality}
                    onChange={(e) => handleSettingsChange('ai', 'parameters', 'image', {
                      ...settings.ai.parameters.image,
                      quality: e.target.value
                    })}
                  >
                    <option value="standard">Standard</option>
                    <option value="hd">HD</option>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Quality of generated images
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Settings Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <div className="space-y-2">
                  <label htmlFor="defaultContentType" className="text-sm font-medium">Default Content Type</label>
                  <Select
                    id="defaultContentType"
                    value={settings.defaults.content_type}
                    onChange={(e) => handleSettingsChange('defaults', null, 'content_type', e.target.value)}
                  >
                    <option value="fiction">Fiction</option>
                    <option value="image">Image</option>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Default content type for generation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleReset} 
              disabled={isLoading}
            >
              Reset to Defaults
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Settings;