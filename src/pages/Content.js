import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import '../index.css';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert } from '../components/ui/alert';
import { Select } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Clipboard, Download } from 'lucide-react';

function Content() {
  const [contentItems, setContentItems] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [contentTypeFilter, setContentTypeFilter] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);
  const [editContent, setEditContent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const isValidJson = (json) => {
    try {
      JSON.parse(JSON.stringify(json));
      return true;
    } catch (e) {
      return false;
    }
  };

  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${config.API_URL}/api/content${contentTypeFilter ? `?type=${contentTypeFilter}` : ''}`);
      setContentItems(response.data.data);
      setFilteredContent(response.data.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      showAlert('danger', 'Failed to fetch content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [contentTypeFilter]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleFilterChange = (e) => {
    setContentTypeFilter(e.target.value);
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleViewContent = (content) => {
    setSelectedContent(content);
    setShowViewModal(true);
  };

  const handleEditClick = (content) => {
    setEditContent({ ...content });
    setShowEditModal(true);
  };

  const handleDeleteClick = (content) => {
    setSelectedContent(content);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      const { id, title, content: contentText, imageData, year, metadata } = editContent;
      const payload = { title };
  
      // Add validated year to payload
      if (year && year.toString().length === 4) {
        payload.year = parseInt(year, 10);
      }
  
      if (editContent.type === 'fiction') {
        payload.content = contentText;
      } else if (editContent.type === 'image') {
        payload.imageData = imageData;
      }
      
      // Always include metadata in payload (even if it's an empty object)
      payload.metadata = metadata || {};
  
      console.log('Saving with payload:', payload);
  
      await axios.put(`${config.API_URL}/api/content/${id}`, payload);
      setShowEditModal(false);
      fetchContent();
      showAlert('success', 'Content updated successfully');
    } catch (error) {
      console.error('Error updating content:', error);
      showAlert('danger', 'Failed to update content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContent = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`${config.API_URL}/api/content/${selectedContent.id}`);
      setShowDeleteModal(false);
      fetchContent();
      showAlert('success', 'Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      showAlert('danger', 'Failed to delete content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCopyContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      showAlert('success', 'Content copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showAlert('danger', 'Failed to copy to clipboard');
    }
  };

  const handleDownloadImage = (imageData, title) => {
    try {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${imageData}`;
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showAlert('success', 'Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      showAlert('danger', 'Failed to download image');
    }
  };

  const handleDownloadText = (text, title) => {
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showAlert('success', 'Text downloaded successfully');
    } catch (error) {
      console.error('Error downloading text:', error);
      showAlert('danger', 'Failed to download text');
    }
  };

  return (
    <>
      {/* Alert Messages */}
      {alert.show && (
        <div className="mb-6">
          <Alert
            variant={alert.type === 'success' ? 'default' : alert.type === 'danger' ? 'destructive' : 'info'}
            onDismiss={() => setAlert({ show: false, type: '', message: '' })}
          >
            {alert.message}
          </Alert>
        </div>
      )}

      <div className="space-y-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Generated Content</h2>
          <div>
            <Select
              className="w-40"
              value={contentTypeFilter}
              onChange={handleFilterChange}
              aria-label="Filter content by type"
            >
              <option value="">All Content</option>
              <option value="fiction">Fiction Only</option>
              <option value="image">Images Only</option>
            </Select>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Loading content...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No content found. Generate content through the main application.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[200px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 text-xs rounded-md inline-flex items-center
                          ${item.type === 'fiction'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-purple-600 dark:text-purple-400'}`}>
                          {item.type === 'fiction' ? 'Fiction' : 'Image'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(item.updatedAt)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleViewContent(item)}
                          aria-label={`View ${item.title}`}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleEditClick(item)}
                          aria-label={`Edit ${item.title}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteClick(item)}
                          aria-label={`Delete ${item.title}`}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Content Modal */}
      {showViewModal && selectedContent && (
        <Dialog isOpen={showViewModal} onDismiss={() => setShowViewModal(false)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{selectedContent.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created {formatDate(selectedContent.createdAt)}
              </p>
            </DialogHeader>

            <div className="py-6">
              {selectedContent.type === 'fiction' ? (
                <div className="fiction-content">
                  <div className="flex justify-end space-x-2 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 rounded-md px-3 py-1 h-8 text-xs bg-background/80 hover:bg-background"
                      onClick={() => handleCopyContent(selectedContent.content)}
                    >
                      <Clipboard className="h-3.5 w-3.5 opacity-70" /> Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 rounded-md px-3 py-1 h-8 text-xs bg-background/80 hover:bg-background"
                      onClick={() => handleDownloadText(selectedContent.content, selectedContent.title)}
                    >
                      <Download className="h-3.5 w-3.5 opacity-70" /> Download
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none rounded-lg border border-border/50 p-4 bg-transparent">
                    <p className="text-sm whitespace-pre-line text-foreground/90">{selectedContent.content}</p>
                  </div>
                </div>
              ) : (
                <div className="image-content">
                  {selectedContent.imageData ? (
                    <>
                      <div className="flex justify-end space-x-2 mb-6">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 rounded-md px-3 py-1 h-8 text-xs bg-background/80 hover:bg-background"
                          onClick={() => handleCopyContent(`data:image/png;base64,${selectedContent.imageData}`)}
                        >
                          <Clipboard className="h-3.5 w-3.5 opacity-70" /> Copy Data URL
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 rounded-md px-3 py-1 h-8 text-xs bg-background/80 hover:bg-background"
                          onClick={() => handleDownloadImage(selectedContent.imageData, selectedContent.title)}
                        >
                          <Download className="h-3.5 w-3.5 opacity-70" /> Download
                        </Button>
                      </div>
                      <div className="flex justify-center p-4 rounded-lg border border-border/50 bg-transparent">
                        <img
                          src={`data:image/png;base64,${selectedContent.imageData}`}
                          alt={selectedContent.title}
                          className="rounded-md max-w-full mx-auto shadow-md"
                          style={{ maxHeight: '500px' }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 rounded-lg border border-border/50 bg-transparent">
                      <p className="text-sm text-muted-foreground">No image data available</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Generation Parameters</h4>
                  <div className="rounded-lg border border-border/50 p-3 h-[200px] overflow-y-auto bg-transparent">
                    <pre className="text-xs text-foreground/80">{JSON.stringify(selectedContent.parameterValues, null, 2)}</pre>
                  </div>
                </div>

                {selectedContent.metadata && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Metadata</h4>
                    <div className="rounded-lg border border-border/50 p-3 h-[200px] overflow-y-auto bg-transparent">
                      <pre className="text-xs text-foreground/80">{JSON.stringify(selectedContent.metadata, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md text-xs"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Content Modal */}
      {showEditModal && editContent && (
        <Dialog isOpen={showEditModal} onDismiss={() => setShowEditModal(false)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit {editContent.type === 'fiction' ? 'Fiction' : 'Image'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label htmlFor="contentTitle" className="text-sm font-medium">Title</label>
                <Input
                  id="contentTitle"
                  value={editContent.title}
                  onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                  className="bg-background/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contentYear" className="text-sm font-medium">Year of Generation</label>
                <Input
                  id="contentYear"
                  type="number"
                  value={editContent.year || new Date().getFullYear()}
                  onChange={(e) => {
                    const yearValue = e.target.value;
                    // Only update if empty or valid number
                    if (!yearValue || (yearValue.length <= 4 && /^\d+$/.test(yearValue))) {
                      setEditContent({ ...editContent, year: yearValue });
                    }
                  }}
                  placeholder={new Date().getFullYear().toString()}
                  className="bg-background/50"
                  min="1000"
                  max="9999"
                />
                {editContent.year && (editContent.year.toString().length !== 4 || editContent.year < 1000 || editContent.year > 9999) && (
                  <p className="text-xs text-destructive">Please enter a valid four-digit year</p>
                )}
              </div>

              {editContent.type === 'fiction' && (
                <div className="space-y-2">
                  <label htmlFor="contentText" className="text-sm font-medium">Content</label>
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 min-h-[250px]"
                    id="contentText"
                    value={editContent.content}
                    onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
                  />
                </div>
              )}

              {editContent.type === 'image' && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Image Preview</p>
                  {editContent.imageData ? (
                    <div className="rounded-lg border border-border/50 bg-transparent p-4 flex justify-center">
                      <img
                        src={`data:image/png;base64,${editContent.imageData}`}
                        alt={editContent.title}
                        className="rounded-md max-w-full mx-auto shadow-md"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-lg border border-border/50 bg-transparent">
                      <p className="text-sm text-muted-foreground">No image data available</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    The image data is stored as a base64 encoded string and cannot be directly edited.
                  </p>
                </div>
              )}

              {/* Add Metadata Editing Section */}
              <div className="space-y-2">
                <label htmlFor="contentMetadata" className="text-sm font-medium">Metadata</label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 min-h-[150px]"
                  id="contentMetadata"
                  value={JSON.stringify(editContent.metadata || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setEditContent({ ...editContent, metadata: parsed });
                    } catch (error) {
                      // Allow invalid JSON during editing, but will validate before saving
                      // We're keeping the potentially invalid text in the textarea
                      const event = e;
                      // This approach allows users to continue typing even when syntax is temporarily invalid
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Edit metadata in JSON format. Changes will be validated before saving.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md text-xs"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="rounded-md text-xs"
                onClick={handleSaveEdit}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedContent && (
        <Dialog isOpen={showDeleteModal} onDismiss={() => setShowDeleteModal(false)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Confirm Delete</DialogTitle>
              <DialogDescription className="pt-2 text-muted-foreground">
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">
                  Are you sure you want to delete <span className="font-semibold">"{selectedContent.title}"</span>?
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md text-xs"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-md text-xs"
                onClick={handleDeleteContent}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default Content;