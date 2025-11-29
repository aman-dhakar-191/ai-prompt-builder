import { useState } from 'react';

export default function SystemInstructionDisplay({ instruction, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInstruction, setEditedInstruction] = useState(instruction);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(instruction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onEdit(editedInstruction);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedInstruction(instruction);
    setIsEditing(false);
  };

  if (!instruction) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-green-100 p-2 rounded-lg">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Step 1: Generated System Instructions</h2>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-colors ${copied ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-violet-600 hover:bg-violet-50'}`}
                title={copied ? 'Copied!' : 'Copy'}
              >
                {copied ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedInstruction}
            onChange={(e) => setEditedInstruction(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors resize-none font-mono text-sm"
            rows={12}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
            {instruction}
          </pre>
        </div>
      )}
    </div>
  );
}
