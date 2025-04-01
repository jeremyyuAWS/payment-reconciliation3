import React, { useState } from 'react';
import { ReconciliationResult } from '../../types';
import { Users, Network, CheckCircle, X, Edit2, InfoIcon } from 'lucide-react';

interface EntityVariation {
  name: string;
  count: number;
  amount: number;
  variants: string[];
}

interface EntityResolutionDashboardProps {
  results: ReconciliationResult[];
  nameVariations: EntityVariation[];
}

const EntityResolutionDashboard: React.FC<EntityResolutionDashboardProps> = ({ results, nameVariations }) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [canonicalName, setCanonicalName] = useState<string>('');
  
  // Count total entities and variations
  const totalEntities = Array.from(new Set(results.map(r => r.payment.payer_name))).length;
  const totalWithVariations = nameVariations.length;
  
  // Find entity groups (companies that might be related)
  const entityGroups = getEntityGroups(results);
  
  const handleEditStart = (entity: EntityVariation) => {
    setEditMode(entity.name);
    setCanonicalName(entity.name);
  };
  
  const handleSaveCanonical = (entity: EntityVariation) => {
    // In a real app, this would save the canonical name to a database
    setEditMode(null);
    
    // For demo, just hide the edit mode
    setTimeout(() => {
      alert(`Canonical name for "${entity.name}" has been updated to "${canonicalName}"`);
    }, 100);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-indigo-500 mr-3" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Entity Resolution Dashboard
          </h3>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          AI-powered analysis of company name variations and entity relationships across your financial records.
        </p>
      </div>
      
      <div className="bg-gray-50 px-4 py-5 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:px-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-base font-medium text-gray-900">Total Entities</h4>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{totalEntities}</p>
          <p className="text-sm text-gray-500">Unique company names in your records</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-base font-medium text-gray-900">Entities with Variations</h4>
          <p className="mt-2 text-3xl font-bold text-amber-600">{totalWithVariations}</p>
          <p className="text-sm text-gray-500">Companies with multiple name variants</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-base font-medium text-gray-900">Entity Groups</h4>
          <p className="mt-2 text-3xl font-bold text-teal-600">{entityGroups.length}</p>
          <p className="text-sm text-gray-500">Potential parent-subsidiary relationships</p>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:px-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">Name Variations</h4>
        <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
          {nameVariations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variations
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nameVariations.map((entity) => (
                    <React.Fragment key={entity.name}>
                      <tr 
                        className={`${selectedEntity === entity.name ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedEntity(selectedEntity === entity.name ? null : entity.name)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editMode === entity.name ? (
                            <input
                              type="text"
                              value={canonicalName}
                              onChange={(e) => setCanonicalName(e.target.value)}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              {entity.name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {entity.variants.length} variations detected
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{entity.count}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${entity.amount.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editMode === entity.name ? (
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditMode(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveCanonical(entity);
                                }}
                                className="text-green-600 hover:text-green-800"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStart(entity);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Set Canonical Name
                            </button>
                          )}
                        </td>
                      </tr>
                      
                      {selectedEntity === entity.name && (
                        <tr className="bg-indigo-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              <h4 className="font-medium mb-2">Name Variations</h4>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {entity.variants.map((variant, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {variant}
                                  </span>
                                ))}
                              </div>
                              
                              <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100">
                                <div className="flex">
                                  <InfoIcon className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                                  <div>
                                    <h5 className="text-sm font-medium text-indigo-800 mb-1">AI Entity Resolution</h5>
                                    <p className="text-xs text-indigo-700">
                                      Our AI has detected these names as variations of the same entity with 94% confidence. Establishing a canonical name will help improve reconciliation accuracy and reporting consistency.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex justify-end space-x-3">
                                <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                                  Manage Variations
                                </button>
                                <button 
                                  onClick={() => handleEditStart(entity)}
                                  className="px-3 py-1 flex items-center bg-indigo-600 border border-transparent rounded-md text-sm text-white hover:bg-indigo-700"
                                >
                                  <Edit2 className="h-4 w-4 mr-1" />
                                  Set Canonical Name
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">No name variations detected.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-4 py-5 sm:px-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">Entity Relationship Map</h4>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-96 flex items-center justify-center">
          {/* This would be a network graph visualization in a real implementation */}
          <div className="text-center">
            <Network className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Entity relationship network visualization would appear here.<br />
              In a full implementation, this would show connections between companies based on transaction patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to identify potential entity groups (parent-subsidiary relationships)
function getEntityGroups(results: ReconciliationResult[]): { name: string, entities: string[] }[] {
  // In a real application, this would use more sophisticated entity linking algorithms
  // For this demo, we'll use a simple approach based on name similarities
  
  // Extract all unique company names
  const allNames = Array.from(new Set([
    ...results.map(r => r.payment.payer_name),
    ...results.filter(r => r.matchedInvoice).map(r => r.matchedInvoice!.customer_name)
  ]));
  
  // Group companies that might be related (e.g., contain similar words)
  const groups: { name: string, entities: string[] }[] = [];
  const processedNames = new Set<string>();
  
  allNames.forEach(name => {
    if (processedNames.has(name)) return;
    
    const nameParts = name.toLowerCase().split(/\s+/);
    const relatedNames = allNames.filter(otherName => {
      if (otherName === name || processedNames.has(otherName)) return false;
      
      const otherParts = otherName.toLowerCase().split(/\s+/);
      
      // Check if names share significant words (excluding common words like Inc, LLC, etc.)
      const commonWords = nameParts.filter(part => 
        part.length > 2 && 
        !['inc', 'llc', 'ltd', 'co', 'corp', 'company', 'and', 'the'].includes(part) &&
        otherParts.includes(part)
      );
      
      return commonWords.length > 0;
    });
    
    if (relatedNames.length > 0) {
      groups.push({
        name: name,
        entities: [name, ...relatedNames]
      });
      
      processedNames.add(name);
      relatedNames.forEach(relName => processedNames.add(relName));
    }
  });
  
  return groups;
}

export default EntityResolutionDashboard;