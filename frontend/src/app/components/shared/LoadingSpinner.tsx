import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;