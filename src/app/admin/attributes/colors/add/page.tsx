import React from 'react';
import { AddColorForm } from './add-color-form';

const AddColorPage = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add Colors</h2>
            <p className="text-muted-foreground">Add new color attributes to your product catalog</p>
          </div>
        </div>
        
        <AddColorForm />
      </div>
    </div>
  );
};

export default AddColorPage; 