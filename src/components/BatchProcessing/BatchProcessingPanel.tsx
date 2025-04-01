import React, { useState } from 'react';
import { BatchOperation, BatchItemStatus } from '../../types';
import { FolderUp, Play, FileCheck, AlertCircle, FileX, FileText, CheckCircle, RotateCw } from 'lucide-react';

interface BatchProcessingPanelProps {
  onClose: () => void;
}

const BatchProcessingPanel: React.FC<BatchProcessingPanelProps> = ({ onClose }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [batchOperation, setBatchOperation] = useState<BatchOperation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startBatchProcess = () => {
    if (uploadedFiles.length === 0) return;
    
    // Create a new batch operation
    const batchItems: BatchItemStatus[] = uploadedFiles.map((file, index) => ({
      id: `item-${index}`,
      name: file.name,
      status: 'pending',
    }));
    
    const newBatchOperation: BatchOperation = {
      id: `batch-${Date.now()}`,
      type: 'import',
      status: 'processing',
      progress: 0,
      startTime: new Date(),
      items: batchItems
    };
    
    setBatchOperation(newBatchOperation);
    setIsProcessing(true);
    
    // Simulate batch processing with a staggered approach
    simulateBatchProcessing(newBatchOperation, 0);
  };
  
  const simulateBatchProcessing = (operation: BatchOperation, currentIndex: number) => {
    if (currentIndex >= operation.items.length) {
      // All items processed
      const updatedOperation = {
        ...operation,
        status: 'completed' as const,
        progress: 100,
        endTime: new Date()
      };
      setBatchOperation(updatedOperation);
      setIsProcessing(false);
      return;
    }
    
    const updatedItems = [...operation.items];
    updatedItems[currentIndex] = {
      ...updatedItems[currentIndex],
      status: 'processing' as const
    };
    
    const updatedOperation = {
      ...operation,
      items: updatedItems,
      progress: Math.round((currentIndex / operation.items.length) * 100)
    };
    
    setBatchOperation(updatedOperation);
    
    // Simulate processing time between 1-3 seconds
    const processingTime = 1000 + Math.random() * 2000;
    
    setTimeout(() => {
      // Randomly succeed or fail (90% success rate)
      const success = Math.random() > 0.1;
      
      const processedItems = [...updatedOperation.items];
      processedItems[currentIndex] = {
        ...processedItems[currentIndex],
        status: success ? 'completed' as const : 'failed' as const,
        message: success ? 'Successfully processed' : 'Error processing file: Invalid format'
      };
      
      const processedOperation = {
        ...updatedOperation,
        items: processedItems,
        progress: Math.round(((currentIndex + 1) / operation.items.length) * 100)
      };
      
      setBatchOperation(processedOperation);
      
      // Process next item
      simulateBatchProcessing(processedOperation, currentIndex + 1);
    }, processingTime);
  };
  
  const resetBatch = () => {
    setBatchOperation(null);
    setUploadedFiles([]);
  };
  
  // Calculate batch status statistics
  const getBatchStats = () => {
    if (!batchOperation) return { completed: 0, failed: 0, total: 0 };
    
    const completed = batchOperation.items.filter(item => item.status === 'completed').length;
    const failed = batchOperation.items.filter(item => item.status === 'failed').length;
    
    return {
      completed,
      failed,
      total: batchOperation.items.length
    };
  };
  
  const batchStats = getBatchStats();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-4 bg-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          <FolderUp className="text-indigo-600 h-5 w-5 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Batch Processing</h2>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {!batchOperation ? (
          <>
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <FolderUp className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Drag and drop files here, or 
                    <label className="ml-1 text-indigo-600 hover:text-indigo-500 cursor-pointer">
                      browse
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Support for CSV files up to 10MB each
                  </p>
                </div>
              </div>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Files to process ({uploadedFiles.length})</h3>
                <ul className="divide-y divide-gray-200 bg-gray-50 rounded-md overflow-hidden">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate" style={{ maxWidth: '15rem' }}>
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FileX className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4">
                  <button
                    onClick={startBatchProcess}
                    disabled={isProcessing}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Batch Process
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Batch Progress</h3>
                <div className="text-sm text-gray-500">
                  {batchOperation.progress}% complete
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    batchOperation.status === 'completed' ? 'bg-green-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${batchOperation.progress}%` }}
                ></div>
              </div>
              
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <div>
                  <span className="font-medium">Started:</span> {batchOperation.startTime.toLocaleTimeString()}
                </div>
                {batchOperation.endTime && (
                  <div>
                    <span className="font-medium">Ended:</span> {batchOperation.endTime.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-md border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between">
                <h3 className="text-sm font-medium text-gray-700">Processing Results</h3>
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-1.5"></div>
                    <span>{batchStats.completed} completed</span>
                  </div>
                  {batchStats.failed > 0 && (
                    <div className="flex items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5"></div>
                      <span>{batchStats.failed} failed</span>
                    </div>
                  )}
                </div>
              </div>
              
              <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {batchOperation.items.map((item) => (
                  <li key={item.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      {item.status === 'pending' && <FileText className="h-5 w-5 text-gray-400 mr-3" />}
                      {item.status === 'processing' && <RotateCw className="h-5 w-5 text-indigo-500 mr-3 animate-spin" />}
                      {item.status === 'completed' && <FileCheck className="h-5 w-5 text-green-500 mr-3" />}
                      {item.status === 'failed' && <AlertCircle className="h-5 w-5 text-red-500 mr-3" />}
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate" style={{ maxWidth: '15rem' }}>
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.status === 'pending' && 'Waiting to process...'}
                          {item.status === 'processing' && 'Processing...'}
                          {item.status === 'completed' && (item.message || 'Successfully processed')}
                          {item.status === 'failed' && (item.message || 'Failed to process')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      {item.status === 'completed' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Success
                        </span>
                      )}
                      {item.status === 'failed' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Failed
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {batchOperation.status === 'completed' && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Batch processing completed. {batchStats.completed} of {batchStats.total} files processed successfully.
                      {batchStats.failed > 0 && ` ${batchStats.failed} files failed.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={resetBatch}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {batchOperation.status === 'completed' ? 'Start New Batch' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BatchProcessingPanel;