// Update the component to handle state changes more efficiently
import React, { useState, useEffect } from 'react';
import { ReconciliationRules } from '../../types';
import { Settings, Check, Info, Sliders, Save, RotateCcw } from 'lucide-react';
import debounce from 'lodash.debounce';

interface ReconciliationRulesPanelProps {
  rules: ReconciliationRules;
  onRulesChange: (rules: ReconciliationRules) => void;
  onClose: () => void;
}

const DEFAULT_RULES: ReconciliationRules = {
  enabledRules: {
    exactReferenceMatch: true,
    fuzzyCustomerMatch: true,
    amountTolerance: true,
    duplicateDetection: true,
    partialPaymentMatching: true,
    dateProximity: true
  },
  thresholds: {
    minConfidenceScore: 50,
    nameMatchSensitivity: 70,
    amountMatchTolerance: 1,
    dateDifferenceThreshold: 7,
    partialPaymentMinPercentage: 25
  },
  weights: {
    referenceMatch: 50,
    amountMatch: 30,
    nameMatch: 20,
    dateMatch: 10
  }
};

const ReconciliationRulesPanel: React.FC<ReconciliationRulesPanelProps> = ({ 
  rules, 
  onRulesChange,
  onClose
}) => {
  const [localRules, setLocalRules] = useState<ReconciliationRules>(rules);
  const [activeTab, setActiveTab] = useState<'rules' | 'thresholds' | 'weights'>('rules');
  const [isDirty, setIsDirty] = useState(false);
  
  useEffect(() => {
    setLocalRules(rules);
  }, [rules]);

  // Create debounced preview update
  const debouncedPreview = debounce(() => {
    setIsDirty(true);
  }, 500);

  const handleRuleToggle = (ruleName: keyof ReconciliationRules['enabledRules']) => {
    const updatedRules = {
      ...localRules,
      enabledRules: {
        ...localRules.enabledRules,
        [ruleName]: !localRules.enabledRules[ruleName]
      }
    };
    setLocalRules(updatedRules);
    setIsDirty(true);
    debouncedPreview();
  };

  const handleThresholdChange = (
    thresholdName: keyof ReconciliationRules['thresholds'],
    value: number
  ) => {
    const updatedRules = {
      ...localRules,
      thresholds: {
        ...localRules.thresholds,
        [thresholdName]: value
      }
    };
    setLocalRules(updatedRules);
    debouncedPreview();
  };

  const handleWeightChange = (
    weightName: keyof ReconciliationRules['weights'],
    value: number
  ) => {
    const updatedRules = {
      ...localRules,
      weights: {
        ...localRules.weights,
        [weightName]: value
      }
    };
    setLocalRules(updatedRules);
    debouncedPreview();
  };

  const handleSave = () => {
    onRulesChange(localRules);
    setIsDirty(false);
  };

  const handleReset = () => {
    setLocalRules(DEFAULT_RULES);
    setIsDirty(true);
  };

  const getTotalWeight = () => {
    return Object.values(localRules.weights).reduce((sum, weight) => sum + weight, 0);
  };

  const isWeightValid = getTotalWeight() === 100;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-4 bg-indigo-50 flex justify-between items-center">
        <div className="flex items-center">
          <Settings className="text-indigo-600 h-5 w-5 mr-2" />
          <h2 className="text-lg font-medium text-gray-800">Reconciliation Rules Configuration</h2>
        </div>
        {isDirty && (
          <div className="text-sm text-amber-600 flex items-center">
            <Info className="h-4 w-4 mr-1" />
            Unsaved changes
          </div>
        )}
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {[
            { id: 'rules', label: 'Enabled Rules', icon: <Check className="h-4 w-4 mr-1" /> },
            { id: 'thresholds', label: 'Thresholds', icon: <Sliders className="h-4 w-4 mr-1" /> },
            { id: 'weights', label: 'Weights', icon: <Settings className="h-4 w-4 mr-1" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-4">
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Enable or disable specific reconciliation rules to customize how payments are matched to invoices.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Exact Reference Match</h3>
                    <p className="text-sm text-gray-500">
                      Match payments to invoices when reference numbers exactly match
                    </p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={localRules.enabledRules.exactReferenceMatch}
                      onChange={() => handleRuleToggle('exactReferenceMatch')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      style={{
                        top: '0',
                        right: '0',
                        transition: 'right 0.2s',
                        right: localRules.enabledRules.exactReferenceMatch ? '0px' : '20px',
                        borderColor: localRules.enabledRules.exactReferenceMatch ? '#4F46E5' : '#CBD5E0'
                      }}
                    />
                    <label
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{ 
                        backgroundColor: localRules.enabledRules.exactReferenceMatch ? '#C7D2FE' : '#CBD5E0' 
                      }}
                    ></label>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Fuzzy Customer Match</h3>
                    <p className="text-sm text-gray-500">
                      Use fuzzy name matching for customers and payers
                    </p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={localRules.enabledRules.fuzzyCustomerMatch}
                      onChange={() => handleRuleToggle('fuzzyCustomerMatch')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      style={{
                        top: '0',
                        right: '0',
                        transition: 'right 0.2s',
                        right: localRules.enabledRules.fuzzyCustomerMatch ? '0px' : '20px',
                        borderColor: localRules.enabledRules.fuzzyCustomerMatch ? '#4F46E5' : '#CBD5E0'
                      }}
                    />
                    <label
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{ 
                        backgroundColor: localRules.enabledRules.fuzzyCustomerMatch ? '#C7D2FE' : '#CBD5E0' 
                      }}
                    ></label>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Amount Tolerance</h3>
                    <p className="text-sm text-gray-500">
                      Allow small variations in payment amounts
                    </p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={localRules.enabledRules.amountTolerance}
                      onChange={() => handleRuleToggle('amountTolerance')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      style={{
                        top: '0',
                        right: '0',
                        transition: 'right 0.2s',
                        right: localRules.enabledRules.amountTolerance ? '0px' : '20px',
                        borderColor: localRules.enabledRules.amountTolerance ? '#4F46E5' : '#CBD5E0'
                      }}
                    />
                    <label
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{ 
                        backgroundColor: localRules.enabledRules.amountTolerance ? '#C7D2FE' : '#CBD5E0' 
                      }}
                    ></label>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Duplicate Detection</h3>
                    <p className="text-sm text-gray-500">
                      Identify potential duplicate payments
                    </p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={localRules.enabledRules.duplicateDetection}
                      onChange={() => handleRuleToggle('duplicateDetection')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      style={{
                        top: '0',
                        right: '0',
                        transition: 'right 0.2s',
                        right: localRules.enabledRules.duplicateDetection ? '0px' : '20px',
                        borderColor: localRules.enabledRules.duplicateDetection ? '#4F46E5' : '#CBD5E0'
                      }}
                    />
                    <label
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{ 
                        backgroundColor: localRules.enabledRules.duplicateDetection ? '#C7D2FE' : '#CBD5E0' 
                      }}
                    ></label>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Partial Payment Matching</h3>
                    <p className="text-sm text-gray-500">
                      Match partial payments to invoices
                    </p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={localRules.enabledRules.partialPaymentMatching}
                      onChange={() => handleRuleToggle('partialPaymentMatching')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      style={{
                        top: '0',
                        right: '0',
                        transition: 'right 0.2s',
                        right: localRules.enabledRules.partialPaymentMatching ? '0px' : '20px',
                        borderColor: localRules.enabledRules.partialPaymentMatching ? '#4F46E5' : '#CBD5E0'
                      }}
                    />
                    <label
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{ 
                        backgroundColor: localRules.enabledRules.partialPaymentMatching ? '#C7D2FE' : '#CBD5E0' 
                      }}
                    ></label>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Date Proximity</h3>
                    <p className="text-sm text-gray-500">
                      Consider payment date proximity to due date
                    </p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={localRules.enabledRules.dateProximity}
                      onChange={() => handleRuleToggle('dateProximity')}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      style={{
                        top: '0',
                        right: '0',
                        transition: 'right 0.2s',
                        right: localRules.enabledRules.dateProximity ? '0px' : '20px',
                        borderColor: localRules.enabledRules.dateProximity ? '#4F46E5' : '#CBD5E0'
                      }}
                    />
                    <label
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{ 
                        backgroundColor: localRules.enabledRules.dateProximity ? '#C7D2FE' : '#CBD5E0' 
                      }}
                    ></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'thresholds' && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Adjust thresholds to fine-tune how strict or lenient the matching algorithm should be.
            </p>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Minimum Confidence Score
                  </label>
                  <span className="text-sm text-gray-500">
                    {localRules.thresholds.minConfidenceScore}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={localRules.thresholds.minConfidenceScore}
                  onChange={(e) => handleThresholdChange('minConfidenceScore', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>0% (Match All)</span>
                  <span>100% (Perfect Match Only)</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Minimum confidence score required to consider a match valid.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Name Match Sensitivity
                  </label>
                  <span className="text-sm text-gray-500">
                    {localRules.thresholds.nameMatchSensitivity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={localRules.thresholds.nameMatchSensitivity}
                  onChange={(e) => handleThresholdChange('nameMatchSensitivity', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>0% (Lenient)</span>
                  <span>100% (Exact)</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  How strictly customer/payer names should match.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Amount Match Tolerance
                  </label>
                  <span className="text-sm text-gray-500">
                    {localRules.thresholds.amountMatchTolerance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={localRules.thresholds.amountMatchTolerance}
                  onChange={(e) => handleThresholdChange('amountMatchTolerance', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>0% (Exact)</span>
                  <span>5% (Lenient)</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Maximum percentage difference allowed between payment and invoice amounts.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Date Difference Threshold
                  </label>
                  <span className="text-sm text-gray-500">
                    {localRules.thresholds.dateDifferenceThreshold} days
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={localRules.thresholds.dateDifferenceThreshold}
                  onChange={(e) => handleThresholdChange('dateDifferenceThreshold', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>0 (Same Day)</span>
                  <span>30 Days</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Maximum days difference between payment date and invoice due date.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Partial Payment Minimum
                  </label>
                  <span className="text-sm text-gray-500">
                    {localRules.thresholds.partialPaymentMinPercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={localRules.thresholds.partialPaymentMinPercentage}
                  onChange={(e) => handleThresholdChange('partialPaymentMinPercentage', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>0% (Any Amount)</span>
                  <span>100% (Full Payment)</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Minimum percentage of invoice amount required for partial payment matching.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'weights' && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Adjust the importance of different factors in the matching algorithm. Total weight should equal 100%.
            </p>
            
            {!isWeightValid && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Total weight should equal 100%. Current total: {getTotalWeight()}%
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Reference Match Weight
                  </label>
                  <span className="text-sm text-gray-500">
                    {localRules.weights.referenceMatch}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={localRules.weights.referenceMatch}
                  onChange={(e) => handleWeightChange('referenceMatch', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Importance of matching invoice reference numbers.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Amount Match Weight
                  </label>
                  <span className="text-sm text-gray-500">
                    {localRules.weights.amountMatch}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={localRules.weights.amountMatch}
                  onChange={(e) => handleWeightChange('amountMatch', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Importance of matching payment amounts.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Name Match Weight
                  </label>
                  <span className="text-sm text-gray-500">
                    {localRules.weights.nameMatch}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={localRules.weights.nameMatch}
                  onChange={(e) => handleWeightChange('nameMatch', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Importance of matching customer/payer names.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Date Match Weight
                  </label>
                  <span className="text-sm text-gray-500">
                    {localRules.weights.dateMatch}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={localRules.weights.dateMatch}
                  onChange={(e) => handleWeightChange('dateMatch', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Importance of proximity between payment date and invoice due date.
                </p>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700">
                  Total Weight
                </div>
                <div className={`font-semibold ${isWeightValid ? 'text-green-500' : 'text-red-500'}`}>
                  {getTotalWeight()}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200 mt-4 flex justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Reset to Defaults
        </button>
        <div className="space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isWeightValid}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isWeightValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'
            }`}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Rules
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationRulesPanel;