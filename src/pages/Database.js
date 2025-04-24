import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '../components/ui/dialog';
import { Alert } from '../components/ui/alert';
import config from '../config';

function Database() {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const showAlertMessage = (variant, message) => {
    setAlert({ show: true, variant, message });
    setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      console.log('Initiating database download...');
      
      const response = await axios.get(`${config.API_URL}/api/database/download`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Download response received:', response);
      
      if (response.status !== 200) {
        throw new Error(`Server returned status ${response.status}`);
      }

      // Create a JSON string from the response data
      // If the database is empty, use an empty object as the default
      const data = response.data || {};
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'database.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showAlertMessage('success', 'Database downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      showAlertMessage('danger', err.response?.data?.error || 'Failed to download database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      showAlertMessage('danger', 'Please select a file first');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(`${config.API_URL}/api/database/restore`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showAlertMessage('success', 'Database restored successfully');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Restore error:', err);
      showAlertMessage('danger', err.response?.data?.error || 'Failed to restore database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${config.API_URL}/api/database/reset`);
      showAlertMessage('success', 'Database reset successfully');
    } catch (err) {
      console.error('Reset error:', err);
      showAlertMessage('danger', err.response?.data?.error || 'Failed to reset database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Alert Messages */}
      {alert.show && (
        <Alert variant={alert.variant} onDismiss={() => setAlert({ show: false, variant: '', message: '' })}>
          {alert.message}
        </Alert>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Database Management</h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Download Database</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Download a backup of the current database.</p>
            <Button 
              onClick={handleDownload}
              disabled={isLoading}
            >
              {isLoading ? 'Downloading...' : 'Download Database'}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Restore Database</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Restore the database from a backup file.</p>
            <div className="space-y-4">
              <Input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="mb-4"
              />
              <Button
                variant="warning"
                onClick={() => setShowRestoreModal(true)}
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? 'Restoring...' : 'Restore Database'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Reset Database</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Reset the database to its initial state. This action cannot be undone.</p>
            <Button
              variant="destructive"
              onClick={() => setShowResetModal(true)}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Database'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Restore Confirmation Modal */}
      <Dialog 
        isOpen={showRestoreModal} 
        onDismiss={() => setShowRestoreModal(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Restore</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to restore the database from the selected file? This will overwrite all current data.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRestoreModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setShowRestoreModal(false);
                handleRestore();
              }}
            >
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Modal */}
      <Dialog 
        isOpen={showResetModal} 
        onDismiss={() => setShowResetModal(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reset</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to reset the database? This will delete all data and cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowResetModal(false);
                handleReset();
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Database;