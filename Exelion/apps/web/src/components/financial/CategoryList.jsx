import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryList = ({ categories, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
        Nenhuma categoria cadastrada.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div key={category.id} className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: category.color }}></div>
            <span className="font-medium">{category.name}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(category.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;