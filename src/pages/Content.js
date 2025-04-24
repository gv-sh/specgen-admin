import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import '../styles/Content.css';

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
      const { id, title, content: contentText, imageUrl } = editContent;
      const payload = { title };
      
      if (editContent.type === 'fiction') {
        payload.content = contentText;
      } else if (editContent.type === 'image') {
        payload.imageUrl = imageUrl;
      }
      
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
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="mb-0">Generated Content</div>
            <div>
              <select 
                className="form-select form-select-sm" 
                value={contentTypeFilter} 
                onChange={handleFilterChange}
                aria-label="Filter content by type"
              >
                <option value="">All Content</option>
                <option value="fiction">Fiction Only</option>
                <option value="image">Images Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading content...</p>
                </div>
              ) : filteredContent.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No content found. Generate content through the main application.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th scope="col">Title</th>
                        <th scope="col">Type</th>
                        <th scope="col">Created</th>
                        <th scope="col">Last Updated</th>
                        <th scope="col" className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContent.map((item) => (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td>
                            <span className={`badge ${item.type === 'fiction' ? 'bg-primary' : 'bg-success'}`}>
                              {item.type === 'fiction' ? 'Fiction' : 'Image'}
                            </span>
                          </td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td>{formatDate(item.updatedAt)}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleViewContent(item)}
                              aria-label={`View ${item.title}`}
                            >
                              View
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() => handleEditClick(item)}
                              aria-label={`Edit ${item.title}`}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteClick(item)}
                              aria-label={`Delete ${item.title}`}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Content Modal */}
      {showViewModal && selectedContent && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="viewContentModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow">
              <div className="modal-header">
                <div className="modal-title" id="viewContentModalLabel">{selectedContent.title}</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {selectedContent.type === 'fiction' ? (
                  <div className="fiction-content">
                    <p>{selectedContent.content}</p>
                  </div>
                ) : (
                  <div className="image-content text-center">
                    {selectedContent.imageUrl ? (
                      <img 
                        src={selectedContent.imageUrl} 
                        alt={selectedContent.title} 
                        className="img-fluid rounded max-width-100"
                        style={{ maxHeight: '500px' }}
                      />
                    ) : (
                      <p className="text-muted">No image available</p>
                    )}
                  </div>
                )}

                <div className="content-metadata mt-4">
                  <h6 className="fw-bold">Generation Parameters</h6>
                  <div className="card">
                    <div className="card-body">
                      <pre className="mb-0">{JSON.stringify(selectedContent.parameterValues, null, 2)}</pre>
                    </div>
                  </div>

                  {selectedContent.metadata && (
                    <>
                      <h6 className="fw-bold mt-3">Metadata</h6>
                      <div className="card">
                        <div className="card-body">
                          <pre className="mb-0">{JSON.stringify(selectedContent.metadata, null, 2)}</pre>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      {/* Edit Content Modal */}
      {showEditModal && editContent && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="editContentModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow">
              <div className="modal-header">
                <div className="modal-title" id="editContentModalLabel">Edit {editContent.type === 'fiction' ? 'Fiction' : 'Image'}</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="contentTitle" className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contentTitle"
                    value={editContent.title}
                    onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                    required
                  />
                </div>

                {editContent.type === 'fiction' && (
                  <div className="mb-3">
                    <label htmlFor="contentText" className="form-label">Content</label>
                    <textarea
                      className="form-control"
                      id="contentText"
                      rows="12"
                      value={editContent.content}
                      onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
                    />
                  </div>
                )}

                {editContent.type === 'image' && (
                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">Image URL</label>
                    <input
                      type="text"
                      className="form-control"
                      id="imageUrl"
                      value={editContent.imageUrl || ''}
                      onChange={(e) => setEditContent({ ...editContent, imageUrl: e.target.value })}
                    />
                    {editContent.imageUrl && (
                      <div className="mt-3 text-center">
                        <img
                          src={editContent.imageUrl}
                          alt={editContent.title}
                          className="img-fluid rounded max-width-100"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedContent && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <div className="modal-title" id="deleteModalLabel">Confirm Delete</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{selectedContent.title}</strong>? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteContent}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </>
  );
}

export default Content;