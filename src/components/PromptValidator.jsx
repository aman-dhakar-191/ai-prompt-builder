import { useState, useRef } from 'react';
import { parseFile } from '../utils/fileParser';

export default function PromptValidator({ onValidate, isLoading }) {
  const [testPrompts, setTestPrompts] = useState([
    { id: 1, testPrompt: '', expectedBehavior: '' }
  ]);
  const [viewMode, setViewMode] = useState('form'); // 'form' or 'table'
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  const handleAddPrompt = () => {
    setTestPrompts([
      ...testPrompts,
      { id: Date.now(), testPrompt: '', expectedBehavior: '' }
    ]);
  };

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    try {
      const importedPrompts = await parseFile(file);
      setTestPrompts(importedPrompts);
      setViewMode('table');
    } catch (error) {
      setImportError(error.message || 'Failed to import file');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePrompt = (id) => {
    if (testPrompts.length > 1) {
      setTestPrompts(testPrompts.filter(p => p.id !== id));
    }
  };

  const handlePromptChange = (id, field, value) => {
    setTestPrompts(testPrompts.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validPrompts = testPrompts.filter(
      p => p.testPrompt.trim() && p.expectedBehavior.trim()
    );
    if (validPrompts.length > 0) {
      onValidate(validPrompts);
    }
  };

  const isValid = testPrompts.some(
    p => p.testPrompt.trim() && p.expectedBehavior.trim()
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Step 2: Validate with Test Prompts</h2>
        </div>
        <div className="flex items-center space-x-2">
          {/* Import from CSV/JSON button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".csv,.json"
            className="hidden"
          />
          <button
            type="button"
            onClick={handleImportClick}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            title="Import test prompts from CSV or JSON"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Import</span>
          </button>
          {/* View mode toggle */}
          {testPrompts.length > 1 && (
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'form' ? 'table' : 'form')}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={viewMode === 'form' ? 'Switch to table view' : 'Switch to form view'}
            >
              {viewMode === 'form' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              )}
              <span>{viewMode === 'form' ? 'Table' : 'Form'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleAddPrompt}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Test</span>
          </button>
        </div>
      </div>

      {/* Import Error Message */}
      {importError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{importError}</span>
          <button 
            onClick={() => setImportError('')} 
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Table View */}
        {viewMode === 'table' && testPrompts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Prompt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Behavior
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testPrompts.map((prompt, index) => (
                  <tr key={prompt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="max-w-xs truncate" title={prompt.testPrompt}>
                        {prompt.testPrompt || <span className="text-gray-400 italic">Empty</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="max-w-xs truncate" title={prompt.expectedBehavior}>
                        {prompt.expectedBehavior || <span className="text-gray-400 italic">Empty</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {testPrompts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePrompt(prompt.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove test prompt"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2">
              {testPrompts.length} test prompt{testPrompts.length !== 1 ? 's' : ''} loaded. Switch to form view to edit individual prompts.
            </p>
          </div>
        )}

        {/* Form View */}
        {viewMode === 'form' && (
          <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {testPrompts.map((prompt, index) => (
            <div 
              key={prompt.id} 
              className={`space-y-3 ${testPrompts.length > 1 ? 'p-4 bg-gray-50 rounded-lg border border-gray-200' : ''}`}
            >
              {testPrompts.length > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Test #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePrompt(prompt.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove test prompt"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Prompt *
                </label>
                <textarea
                  value={prompt.testPrompt}
                  onChange={(e) => handlePromptChange(prompt.id, 'testPrompt', e.target.value)}
                  placeholder="Enter a sample user prompt to test the system instruction..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Behavior *
                </label>
                <textarea
                  value={prompt.expectedBehavior}
                  onChange={(e) => handlePromptChange(prompt.id, 'expectedBehavior', e.target.value)}
                  placeholder="Describe what you expect the AI response to look like or contain..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                />
              </div>
            </div>
          ))}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Validating {testPrompts.length > 1 ? `${testPrompts.length} tests` : ''}...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Validate {testPrompts.length > 1 ? `(${testPrompts.length} tests)` : ''}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
