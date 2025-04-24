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

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    description: '', 
    visibility: 'Show' 
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ show: false, variant: '', message: '' });

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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${config.API_URL}/api/categories`, newCategory);
      setNewCategory({ name: '', description: '', visibility: 'Show' });
      fetchCategories();
      showAlert('default', 'Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      showAlert('destructive', 'Failed to add category. Please try again.');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${config.API_URL}/api/categories/${editingCategory.id}`, editingCategory);
      setEditingCategory(null);
      setShowModal(false);
      fetchCategories();
      showAlert('default', 'Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      showAlert('destructive', 'Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${config.API_URL}/api/categories/${id}`);
        fetchCategories();
        showAlert('default', 'Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        showAlert('destructive', 'Failed to delete category. Please try again.');
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
          <h1 className="text-2xl font-bold">Categories</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="categoryName" className="text-sm font-medium">Name</label>
                <Input
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">Enter a descriptive name for the category.</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="categoryDescription" className="text-sm font-medium">Description</label>
                <textarea
                  id="categoryDescription"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">Provide additional details about this category.</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="categoryVisibility" className="text-sm font-medium">Visibility</label>
                <Select
                  id="categoryVisibility"
                  value={newCategory.visibility}
                  onChange={(e) => setNewCategory({ ...newCategory, visibility: e.target.value })}
                >
                  <option value="Show">Show</option>
                  <option value="Hide">Hide</option>
                </Select>
                <p className="text-sm text-muted-foreground">Whether to show or hide this category in the user interface.</p>
              </div>
              
              <Button type="submit">Add Category</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="4" className="text-center text-muted-foreground py-10">
                      No categories found. Database may be empty. Add your first category above.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        <Badge variant={category.visibility === 'Show' ? 'default' : 'outline'}>
                          {category.visibility}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => {
                            setEditingCategory(category);
                            setShowModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
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

      {/* Edit Category Modal */}
      <Dialog isOpen={showModal} onDismiss={() => {
        setShowModal(false);
        setEditingCategory(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="editCategoryName" className="text-sm font-medium">Name</label>
              <Input
                id="editCategoryName"
                value={editingCategory?.name || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="editCategoryDescription" className="text-sm font-medium">Description</label>
              <textarea
                id="editCategoryDescription"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editingCategory?.description || ''}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="editCategoryVisibility" className="text-sm font-medium">Visibility</label>
              <Select
                id="editCategoryVisibility"
                value={editingCategory?.visibility || 'Show'}
                onChange={(e) => setEditingCategory({ ...editingCategory, visibility: e.target.value })}
              >
                <option value="Show">Show</option>
                <option value="Hide">Hide</option>
              </Select>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Categories;