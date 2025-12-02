"use client";

/**
 * Manage Category Dialog Component
 * Two-column layout: Categories on left, Subcategories on right
 * Matches the design reference image
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, Subcategory, categoryApi } from "@/lib/api/categories";
import { Loader2, Plus, Edit, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManageCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onCategoryUpdated: () => Promise<void>;
}

export function ManageCategoryDialog({ open, onClose, categories: initialCategories, onCategoryUpdated }: ManageCategoryDialogProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  
  // Category form
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  
  // Subcategory form
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryDescription, setNewSubcategoryDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [editSubcategoryName, setEditSubcategoryName] = useState("");
  const [editSubcategoryDescription, setEditSubcategoryDescription] = useState("");
  const [editSubcategoryCategoryId, setEditSubcategoryCategoryId] = useState<number | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      loadAllData();
    }
  }, [open]);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const loadAllData = async () => {
    try {
      const [cats, subs] = await Promise.all([
        categoryApi.getAllCategories(),
        categoryApi.getAllSubcategories(),
      ]);
      setCategories(cats);
      setSubcategories(subs);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  // Category handlers
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    setIsSaving(true);
    try {
      await categoryApi.createCategory({
        name: newCategoryName,
        description: newCategoryDescription,
        path: newCategoryName,
      });
      setNewCategoryName("");
      setNewCategoryDescription("");
      await onCategoryUpdated();
      await loadAllData();
    } catch (error: any) {
      console.error("Failed to create category:", error);
      alert(`Failed to create category: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await categoryApi.updateCategory(editingCategory.id, {
        name: editCategoryName,
        description: editCategoryDescription,
        path: editCategoryName,
      });
      setEditingCategory(null);
      setEditCategoryName("");
      setEditCategoryDescription("");
      await onCategoryUpdated();
      await loadAllData();
    } catch (error: any) {
      console.error("Failed to update category:", error);
      alert(`Failed to update category: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this category? All subcategories will also be deleted.")) {
      return;
    }

    setIsDeleting(categoryId);
    try {
      await categoryApi.deleteCategory(categoryId);
      await onCategoryUpdated();
      await loadAllData();
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      alert(`Failed to delete category: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description || "");
  };

  // Subcategory handlers
  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategoryId) {
      alert("Please enter subcategory name and select a parent category");
      return;
    }

    setIsSaving(true);
    try {
      await categoryApi.createSubcategory({
        name: newSubcategoryName,
        categoryId: selectedCategoryId,
        description: newSubcategoryDescription,
      });
      setNewSubcategoryName("");
      setNewSubcategoryDescription("");
      setSelectedCategoryId(null);
      await onCategoryUpdated();
      await loadAllData();
    } catch (error: any) {
      console.error("Failed to create subcategory:", error);
      alert(`Failed to create subcategory: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory || !editSubcategoryName.trim() || !editSubcategoryCategoryId) {
      return;
    }

    setIsSaving(true);
    try {
      await categoryApi.updateSubcategory(editingSubcategory.id, {
        name: editSubcategoryName,
        categoryId: editSubcategoryCategoryId,
        description: editSubcategoryDescription,
      });
      setEditingSubcategory(null);
      setEditSubcategoryName("");
      setEditSubcategoryDescription("");
      setEditSubcategoryCategoryId(null);
      await onCategoryUpdated();
      await loadAllData();
    } catch (error: any) {
      console.error("Failed to update subcategory:", error);
      alert(`Failed to update subcategory: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: number) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) {
      return;
    }

    setIsDeleting(subcategoryId);
    try {
      await categoryApi.deleteSubcategory(subcategoryId);
      await onCategoryUpdated();
      await loadAllData();
    } catch (error: any) {
      console.error("Failed to delete subcategory:", error);
      alert(`Failed to delete subcategory: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const startEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setEditSubcategoryName(subcategory.name);
    setEditSubcategoryDescription(subcategory.description || "");
    setEditSubcategoryCategoryId(subcategory.categoryId);
  };

  const getSubcategoriesForCategory = (categoryId: number) => {
    return subcategories.filter(sub => sub.categoryId === categoryId);
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.name || "Unknown";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories & Subcategories</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Left Column: Categories */}
          <div className="space-y-4">
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Add New Category</h3>
              <div className="space-y-3">
                <div>
                  <Label>Category Name *</Label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleCreateCategory}
                  disabled={isSaving || !newCategoryName.trim()}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Existing Categories</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {categories.map((category) => {
                  const categorySubs = getSubcategoriesForCategory(category.id);
                  return (
                    <div key={category.id} className="p-4 border rounded-lg space-y-2">
                      {editingCategory?.id === category.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="w-full"
                          />
                          <Input
                            value={editCategoryDescription}
                            onChange={(e) => setEditCategoryDescription(e.target.value)}
                            placeholder="Description"
                            className="w-full"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleUpdateCategory} disabled={isSaving}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCategory(null);
                                setEditCategoryName("");
                                setEditCategoryDescription("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{category.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {category.description || "No description"}
                              </div>
                              {categorySubs.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {categorySubs.map((sub) => (
                                    <Badge key={sub.id} variant="secondary" className="text-xs">
                                      {sub.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditCategory(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={isDeleting === category.id}
                              >
                                {isDeleting === category.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No categories yet. Create one above.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Subcategories */}
          <div className="space-y-4">
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Add New Subcategory</h3>
              <div className="space-y-3">
                <div>
                  <Label>Parent Category *</Label>
                  <Select
                    value={selectedCategoryId?.toString() || ""}
                    onValueChange={(value) => setSelectedCategoryId(parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subcategory Name *</Label>
                  <Input
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Enter subcategory name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newSubcategoryDescription}
                    onChange={(e) => setNewSubcategoryDescription(e.target.value)}
                    placeholder="Enter subcategory description"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleCreateSubcategory}
                  disabled={isSaving || !newSubcategoryName.trim() || !selectedCategoryId}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subcategory
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">All Subcategories</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="p-4 border rounded-lg">
                    {editingSubcategory?.id === subcategory.id ? (
                      <div className="space-y-2">
                        <Select
                          value={editSubcategoryCategoryId?.toString() || ""}
                          onValueChange={(value) => setEditSubcategoryCategoryId(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={editSubcategoryName}
                          onChange={(e) => setEditSubcategoryName(e.target.value)}
                          className="w-full"
                        />
                        <Input
                          value={editSubcategoryDescription}
                          onChange={(e) => setEditSubcategoryDescription(e.target.value)}
                          placeholder="Description"
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateSubcategory} disabled={isSaving}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSubcategory(null);
                              setEditSubcategoryName("");
                              setEditSubcategoryDescription("");
                              setEditSubcategoryCategoryId(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{subcategory.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Parent: {getCategoryName(subcategory.categoryId)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subcategory.description || "No description"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditSubcategory(subcategory)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSubcategory(subcategory.id)}
                            disabled={isDeleting === subcategory.id}
                          >
                            {isDeleting === subcategory.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {subcategories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No subcategories yet. Create one above.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
