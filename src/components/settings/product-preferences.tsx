
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useActionState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '../ui/badge';
import { createProductCategory, updateProductCategory, deleteProductCategory } from '@/app/settings/preferences/product/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type Subcategory = {
  name: string;
  abbreviation: string;
};

export type ProductCategory = {
  name: string;
  abbreviation: string;
  productType: 'Raw Material' | 'Service' | 'Finished Good';
  subcategories: Subcategory[];
};

const productTypes: ProductCategory['productType'][] = [
  'Raw Material',
  'Service',
  'Finished Good',
];

const formInitialState = { message: '', errors: {} };

function CategoryDialog({ 
    isOpen, 
    setIsOpen, 
    categoryToEdit,
    productType,
} : {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    categoryToEdit?: ProductCategory | null;
    productType: ProductCategory['productType'];
}) {
    const action = categoryToEdit ? updateProductCategory : createProductCategory;
    const [state, dispatch] = useActionState(action, formInitialState);
    const { toast } = useToast();
    const formRef = React.useRef<HTMLFormElement>(null);
    
    const [subcategories, setSubcategories] = React.useState<Subcategory[]>(categoryToEdit?.subcategories || []);
    const [newSubcatName, setNewSubcatName] = React.useState('');
    const [newSubcatAbbr, setNewSubcatAbbr] = React.useState('');

    React.useEffect(() => {
        if (state.message) {
            if (state.errors && Object.keys(state.errors).length > 0) {
                toast({ variant: 'destructive', title: 'Error', description: state.message });
            } else {
                toast({ title: 'Success', description: state.message });
                setIsOpen(false);
            }
        }
    }, [state, toast, setIsOpen]);

    React.useEffect(() => {
        if (isOpen) {
            // Reset state when dialog opens
            setSubcategories(categoryToEdit?.subcategories || []);
            formRef.current?.reset();
        }
    }, [isOpen, categoryToEdit]);

    const handleAddSubcategory = () => {
        if (newSubcatName.trim() && newSubcatAbbr.trim() && !subcategories.some(s => s.name === newSubcatName.trim())) {
            setSubcategories([...subcategories, { name: newSubcatName.trim(), abbreviation: newSubcatAbbr.trim().toUpperCase() }]);
            setNewSubcatName('');
            setNewSubcatAbbr('');
        }
    };

    const handleRemoveSubcategory = (subcatToRemove: string) => {
        setSubcategories(subcategories.filter(sub => sub.name !== subcatToRemove));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{categoryToEdit ? 'Edit' : 'Create'} Category</DialogTitle>
                    <DialogDescription>
                        {categoryToEdit ? 'Update the details for this category.' : 'Add a new category for this product type.'}
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={dispatch} className="space-y-4">
                    {categoryToEdit && <input type="hidden" name="originalName" value={categoryToEdit.name} />}
                    <input type="hidden" name="productType" value={productType} />
                    <input type="hidden" name="subcategories" value={JSON.stringify(subcategories)} />
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input id="name" name="name" defaultValue={categoryToEdit?.name} />
                            {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name[0]}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="abbreviation">Abbreviation (3 letters)</Label>
                            <Input id="abbreviation" name="abbreviation" defaultValue={categoryToEdit?.abbreviation} maxLength={3} />
                             {state.errors?.abbreviation && <p className="text-red-500 text-xs">{state.errors.abbreviation[0]}</p>}
                        </div>
                    </div>
                   
                    <div className="space-y-2">
                        <Label>Subcategories</Label>
                        <div className="space-y-2 rounded-md border p-2">
                             {subcategories.map(sub => (
                                <div key={sub.name} className="flex items-center justify-between p-1 bg-muted/50 rounded-md">
                                    <span>{sub.name} ({sub.abbreviation})</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveSubcategory(sub.name)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Subcategory Name" 
                                    value={newSubcatName} 
                                    onChange={(e) => setNewSubcatName(e.target.value)} 
                                />
                                <Input 
                                    placeholder="Abbr." 
                                    value={newSubcatAbbr} 
                                    onChange={(e) => setNewSubcatAbbr(e.target.value)}
                                    maxLength={3}
                                    className="w-20"
                                />
                                <Button type="button" onClick={handleAddSubcategory}>Add</Button>
                            </div>
                        </div>
                        {state.errors?.subcategories && <p className="text-red-500 text-xs">{state.errors.subcategories[0]}</p>}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit">{categoryToEdit ? 'Save Changes' : 'Create'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


function CategoryCard({ title, categories }: { title: ProductCategory['productType'], categories: ProductCategory[] }) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [categoryToEdit, setCategoryToEdit] = React.useState<ProductCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = React.useState<ProductCategory | null>(null);
    const { toast } = useToast();

    const handleEdit = (category: ProductCategory) => {
        setCategoryToEdit(category);
        setIsDialogOpen(true);
    };

    const handleAddNew = () => {
        setCategoryToEdit(null);
        setIsDialogOpen(true);
    };
    
    const handleDelete = (category: ProductCategory) => {
        setCategoryToDelete(category);
        setIsAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (categoryToDelete) {
            const result = await deleteProductCategory(categoryToDelete.name);
            if (result.message.includes('success')) {
                toast({ title: 'Success', description: result.message });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
            setIsAlertOpen(false);
            setCategoryToDelete(null);
        }
    };


  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Manage categories and subcategories for {title.toLowerCase()} products.</CardDescription>
        </div>
        <Button onClick={handleAddNew}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-start justify-between rounded-lg border p-3">
              <div className="flex-1">
                <h4 className="font-semibold">{cat.name} ({cat.abbreviation})</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {cat.subcategories.map(sub => (
                    <Badge key={sub.name} variant="secondary">{sub.name} ({sub.abbreviation})</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-1">
                 <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                    <Edit className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => handleDelete(cat)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-center text-muted-foreground py-4">No categories created yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
    <CategoryDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        categoryToEdit={categoryToEdit}
        productType={title}
    />
     <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                <span className="font-bold"> "{categoryToDelete?.name}"</span> category and all its subcategories.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ProductPreferencesProps {
    categories: ProductCategory[];
}

export function ProductPreferences({ categories }: ProductPreferencesProps) {
  return (
    <div className="space-y-6">
        {productTypes.map(type => (
            <CategoryCard 
                key={type}
                title={type}
                categories={categories.filter(c => c.productType === type)}
            />
        ))}
    </div>
  );
}
