import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataPaginationProps<T> {
  data: T[];
  pageSize?: number;
  showPageNumbers?: boolean;
  pageSizeOptions?: number[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  showSummary?: boolean;
}

function DataPagination<T>({
  data,
  pageSize = 10,
  showPageNumbers = true,
  pageSizeOptions = [5, 10, 25, 50, 100],
  renderItem,
  className = '',
  showSummary = true
}: DataPaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [visiblePageNumbers, setVisiblePageNumbers] = useState<number[]>([]);
  
  // Calculate total pages
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  
  // Update visible page numbers when pagination changes
  useEffect(() => {
    // Ensure current page is valid
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
    
    // Calculate visible page numbers
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show limited pages with current page in middle
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust if at the ends
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    setVisiblePageNumbers(pageNumbers);
  }, [currentPage, totalPages, itemsPerPage]);
  
  // Handle page changes
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Handle next/prev page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Handle first/last page
  const goToFirstPage = () => {
    setCurrentPage(1);
  };
  
  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };
  
  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when size changes
  };
  
  // Render pagination summary
  const renderSummary = () => {
    const start = indexOfFirstItem + 1;
    const end = Math.min(indexOfLastItem, data.length);
    return `Showing ${start} to ${end} of ${data.length} results`;
  };
  
  return (
    <div className={className}>
      {/* Render data items */}
      <div>
        {currentItems.map((item, index) => renderItem(item, index))}
      </div>
      
      {/* No results message */}
      {data.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No items to display
        </div>
      )}
      
      {/* Pagination controls */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-2 sm:space-y-0">
          {showSummary && (
            <div className="text-sm text-gray-500">
              {renderSummary()}
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            {/* First page button */}
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="First page"
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
            
            {/* Previous page button */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Page numbers */}
            {showPageNumbers &&
              visiblePageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded ${
                    currentPage === number
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {number}
                </button>
              ))}
            
            {/* Next page button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            {/* Last page button */}
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Last page"
            >
              <ChevronsRight className="h-5 w-5" />
            </button>
            
            {/* Page size options */}
            <div className="ml-4 flex items-center">
              <span className="text-sm text-gray-500 mr-2">Show</span>
              <select
                value={itemsPerPage}
                onChange={handlePageSizeChange}
                className="border-gray-300 rounded-md text-sm shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataPagination;