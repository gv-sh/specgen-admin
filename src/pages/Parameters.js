import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Alert } from '../components/ui/alert';
import config from '../config';

function Parameters() {
  const [parameters, setParameters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newParameter, setNewParameter] = useState({
    name: '',
    description: '',
    type: 'Dropdown',
    categoryId: '',
    values: [],
    visibility: 'Basic',
    config: {
      min: 0,
      max: 100,
      step: 1
    }
  });
  const [editingParameter, setEditingParameter] = useState(null);
  const [newValue, setNewValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/categories`);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Don't show alert for empty database
      if (error.response && error.response.status !== 404) {
        showAlert('destructive', 'Failed to fetch categories. Please try again.');
      }
    }
  }, []);

  const fetchParameters = useCallback(async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/parameters`);
      setParameters(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      // Don't show alert for empty database
      if (error.response && error.response.status !== 404) {
        showAlert('destructive', 'Failed to fetch parameters. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchParameters();
  }, [fetchCategories, fetchParameters]);

  const handleAddParameter = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.post(`${config.API_URL}/api/parameters`, newParameter);
      setNewParameter({
        name: '',
        description: '',
        type: 'Dropdown',
        categoryId: '',
        values: [],
        visibility: 'Basic',
        config: {
          min: 0,
          max: 100,
          step: 1
        }
      });
      fetchParameters();
      showAlert('default', 'Parameter added successfully');
    } catch (error) {
      console.error('Error adding parameter:', error);
      showAlert('destructive', 'Failed to add parameter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateParameter = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await axios.put(`${config.API_URL}/api/parameters/${editingParameter.id}`, editingParameter);
      setShowModal(false);
      setEditingParameter(null);
      fetchParameters();
      showAlert('default', 'Parameter updated successfully');
    } catch (error) {
      console.error('Error updating parameter:', error);
      showAlert('destructive', 'Failed to update parameter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteParameter = async (id) => {
    if (window.confirm('Are you sure you want to delete this parameter?')) {
      try {
        setIsLoading(true);
        await axios.delete(`${config.API_URL}/api/parameters/${id}`);
        fetchParameters();
        showAlert('default', 'Parameter deleted successfully');
      } catch (error) {
        console.error('Error deleting parameter:', error);
        showAlert('destructive', 'Failed to delete parameter');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const showAlert = (variant, message) => {
    setAlert({ show: true, variant, message });
    setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 5000);
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
          <h1 className="text-2xl font-bold">Parameters</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Parameter</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddParameter} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="parameterName" className="text-sm font-medium">Name</label>
                <Input
                  id="parameterName"
                  value={newParameter.name}
                  onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">Enter a descriptive name for the parameter.</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="parameterType" className="text-sm font-medium">Type</label>
                <Select
                  id="parameterType"
                  value={newParameter.type}
                  onChange={(e) => setNewParameter({ ...newParameter, type: e.target.value })}
                  required
                >
                  <option value="">Select a type</option>
                  <option value="Dropdown">Dropdown</option>
                  <option value="Slider">Slider</option>
                  <option value="Toggle Switch">Toggle Switch</option>
                  <option value="Radio Buttons">Radio Buttons</option>
                  <option value="Checkbox">Checkbox</option>
                </Select>
                <p className="text-sm text-muted-foreground">Choose the input type for this parameter.</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="parameterDescription" className="text-sm font-medium">Description</label>
                <textarea
                  id="parameterDescription"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newParameter.description}
                  onChange={(e) => setNewParameter({ ...newParameter, description: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">Provide additional details about this parameter.</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="parameterCategory" className="text-sm font-medium">Category</label>
                <Select
                  id="parameterCategory"
                  value={newParameter.categoryId}
                  onChange={(e) => setNewParameter({ ...newParameter, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                <p className="text-sm text-muted-foreground">Choose the category this parameter belongs to.</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="parameterVisibility" className="text-sm font-medium">Visibility</label>
                <Select
                  id="parameterVisibility"
                  value={newParameter.visibility}
                  onChange={(e) => setNewParameter({ ...newParameter, visibility: e.target.value })}
                >
                  <option value="Basic">Basic</option>
                  <option value="Advanced">Advanced</option>
                </Select>
                <p className="text-sm text-muted-foreground">Choose the visibility level for this parameter.</p>
              </div>
              
              {newParameter.type === 'Slider' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slider Configuration</label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="sliderMin" className="text-sm font-medium">Min</label>
                      <Input
                        id="sliderMin"
                        type="number"
                        value={newParameter.config.min}
                        onChange={(e) => setNewParameter({
                          ...newParameter,
                          config: {
                            ...newParameter.config,
                            min: parseInt(e.target.value, 10)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label htmlFor="sliderMax" className="text-sm font-medium">Max</label>
                      <Input
                        id="sliderMax"
                        type="number"
                        value={newParameter.config.max}
                        onChange={(e) => setNewParameter({
                          ...newParameter,
                          config: {
                            ...newParameter.config,
                            max: parseInt(e.target.value, 10)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label htmlFor="sliderStep" className="text-sm font-medium">Step</label>
                      <Input
                        id="sliderStep"
                        type="number"
                        value={newParameter.config.step}
                        onChange={(e) => setNewParameter({
                          ...newParameter,
                          config: {
                            ...newParameter.config,
                            step: parseInt(e.target.value, 10)
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {(newParameter.type === 'Dropdown' || newParameter.type === 'Radio Buttons' || newParameter.type === 'Checkbox') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Values</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (newValue.trim()) {
                          setNewParameter({
                            ...newParameter,
                            values: [...newParameter.values, { label: newValue.trim() }]
                          });
                          setNewValue('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {newParameter.values.length > 0 && (
                    <div className="rounded-md border divide-y mt-2">
                      {newParameter.values.map((value, index) => (
                        <div key={index} className="flex justify-between items-center p-2">
                          <span>{value.label}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNewParameter({
                                ...newParameter,
                                values: newParameter.values.filter((_, i) => i !== index)
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {newParameter.type === 'Toggle Switch' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Toggle Labels</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="toggleOn" className="text-sm font-medium">On Label</label>
                      <Input
                        id="toggleOn"
                        placeholder="Yes"
                        onChange={(e) => setNewParameter({
                          ...newParameter,
                          values: {
                            ...(newParameter.values || {}),
                            on: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label htmlFor="toggleOff" className="text-sm font-medium">Off Label</label>
                      <Input
                        id="toggleOff"
                        placeholder="No"
                        onChange={(e) => setNewParameter({
                          ...newParameter,
                          values: {
                            ...(newParameter.values || {}),
                            off: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Parameter'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parameters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center text-muted-foreground py-10">
                      No parameters found. Database may be empty. Add your first parameter above.
                    </TableCell>
                  </TableRow>
                ) : (
                  parameters.map((parameter) => (
                    <TableRow key={parameter.id}>
                      <TableCell>{parameter.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {parameter.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{parameter.description}</TableCell>
                      <TableCell>{categories.find(c => c.id === parameter.categoryId)?.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {parameter.visibility}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => {
                            setEditingParameter({...parameter});
                            setShowModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteParameter(parameter.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Parameter Modal */}
      <Dialog 
        isOpen={showModal} 
        onDismiss={() => {
          setShowModal(false);
          setEditingParameter(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Parameter</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateParameter} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="editParameterName" className="text-sm font-medium">Name</label>
              <Input
                id="editParameterName"
                value={editingParameter?.name || ''}
                onChange={(e) => setEditingParameter({ ...editingParameter, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="editParameterType" className="text-sm font-medium">Type</label>
              <Select
                id="editParameterType"
                value={editingParameter?.type || ''}
                onChange={(e) => setEditingParameter({ ...editingParameter, type: e.target.value })}
                required
              >
                <option value="Dropdown">Dropdown</option>
                <option value="Slider">Slider</option>
                <option value="Toggle Switch">Toggle Switch</option>
                <option value="Radio Buttons">Radio Buttons</option>
                <option value="Checkbox">Checkbox</option>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="editParameterDescription" className="text-sm font-medium">Description</label>
              <textarea
                id="editParameterDescription"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editingParameter?.description || ''}
                onChange={(e) => setEditingParameter({ ...editingParameter, description: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="editParameterCategory" className="text-sm font-medium">Category</label>
              <Select
                id="editParameterCategory"
                value={editingParameter?.categoryId || ''}
                onChange={(e) => setEditingParameter({ ...editingParameter, categoryId: e.target.value })}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="editParameterVisibility" className="text-sm font-medium">Visibility</label>
              <Select
                id="editParameterVisibility"
                value={editingParameter?.visibility || 'Basic'}
                onChange={(e) => setEditingParameter({ ...editingParameter, visibility: e.target.value })}
              >
                <option value="Basic">Basic</option>
                <option value="Advanced">Advanced</option>
              </Select>
            </div>
            
            {editingParameter?.type === 'Slider' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Slider Configuration</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="editSliderMin" className="text-sm font-medium">Min</label>
                    <Input
                      id="editSliderMin"
                      type="number"
                      value={editingParameter?.config?.min || 0}
                      onChange={(e) => setEditingParameter({
                        ...editingParameter,
                        config: {
                          ...(editingParameter?.config || {}),
                          min: parseInt(e.target.value, 10)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label htmlFor="editSliderMax" className="text-sm font-medium">Max</label>
                    <Input
                      id="editSliderMax"
                      type="number"
                      value={editingParameter?.config?.max || 100}
                      onChange={(e) => setEditingParameter({
                        ...editingParameter,
                        config: {
                          ...(editingParameter?.config || {}),
                          max: parseInt(e.target.value, 10)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label htmlFor="editSliderStep" className="text-sm font-medium">Step</label>
                    <Input
                      id="editSliderStep"
                      type="number"
                      value={editingParameter?.config?.step || 1}
                      onChange={(e) => setEditingParameter({
                        ...editingParameter,
                        config: {
                          ...(editingParameter?.config || {}),
                          step: parseInt(e.target.value, 10)
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {(editingParameter?.type === 'Dropdown' || editingParameter?.type === 'Radio Buttons' || editingParameter?.type === 'Checkbox') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Values</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (newValue.trim()) {
                        setEditingParameter({
                          ...editingParameter,
                          values: [
                            ...(Array.isArray(editingParameter?.values) ? editingParameter.values : []), 
                            { label: newValue.trim() }
                          ]
                        });
                        setNewValue('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                
                {Array.isArray(editingParameter?.values) && editingParameter.values.length > 0 && (
                  <div className="rounded-md border divide-y mt-2">
                    {editingParameter.values.map((value, index) => (
                      <div key={index} className="flex justify-between items-center p-2">
                        <span>{value.label || value}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingParameter({
                              ...editingParameter,
                              values: editingParameter.values.filter((_, i) => i !== index)
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {editingParameter?.type === 'Toggle Switch' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Toggle Labels</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editToggleOn" className="text-sm font-medium">On Label</label>
                    <Input
                      id="editToggleOn"
                      placeholder="Yes"
                      value={
                        typeof editingParameter?.values === 'object' && 
                        !Array.isArray(editingParameter?.values) ? 
                        editingParameter.values.on || '' : ''
                      }
                      onChange={(e) => setEditingParameter({
                        ...editingParameter,
                        values: {
                          ...(typeof editingParameter?.values === 'object' && 
                             !Array.isArray(editingParameter?.values) ? 
                             editingParameter.values : {}),
                          on: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label htmlFor="editToggleOff" className="text-sm font-medium">Off Label</label>
                    <Input
                      id="editToggleOff"
                      placeholder="No"
                      value={
                        typeof editingParameter?.values === 'object' && 
                        !Array.isArray(editingParameter?.values) ? 
                        editingParameter.values.off || '' : ''
                      }
                      onChange={(e) => setEditingParameter({
                        ...editingParameter,
                        values: {
                          ...(typeof editingParameter?.values === 'object' && 
                             !Array.isArray(editingParameter?.values) ? 
                             editingParameter.values : {}),
                          off: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingParameter(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Parameters;