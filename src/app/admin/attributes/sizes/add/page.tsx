import React from 'react';
import { AddSizeForm } from './add-size-form';

const AddSizePage = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add Sizes</h2>
            <p className="text-muted-foreground">Add new size attributes to your product catalog</p>
          </div>
        </div>
        
        <AddSizeForm />
      </div>
    </div>
  );
};

export default AddSizePage; 