import { useState } from 'react';

/**
 * Export data as JSON file
 * @param {Object} data - Data to export
 * @param {string} filename - Filename without extension
 */
function exportAsJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export data as Markdown file
 * @param {string} content - Markdown content
 * @param {string} filename - Filename without extension
 */
function exportAsMarkdown(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate Markdown content from prompt data
 * @param {Object} data - Export data
 * @returns {string} - Markdown content
 */
function generateMarkdown(data) {
  let md = `# AI Prompt Builder Export\n\n`;
  md += `**Exported at:** ${new Date().toISOString()}\n\n`;
  
  if (data.systemInstruction) {
    md += `## System Instruction\n\n`;
    md += `\`\`\`\n${data.systemInstruction}\n\`\`\`\n\n`;
  }
  
  if (data.desiredOutput) {
    md += `## Desired Output\n\n${data.desiredOutput}\n\n`;
  }
  
  if (data.context) {
    md += `## Additional Context\n\n${data.context}\n\n`;
  }
  
  if (data.model) {
    md += `## Model Used\n\n${data.model}\n\n`;
  }
  
  if (data.validationResults && data.validationResults.length > 0) {
    md += `## Validation Results\n\n`;
    
    // Calculate average score
    const scores = data.validationResults
      .map(r => {
        const match = r.analysis?.match(/SCORE:\s*(\d+\.?\d*)/i);
        return match ? parseFloat(match[1]) : null;
      })
      .filter(s => s !== null);
    
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      md += `**Average Score:** ${avg.toFixed(1)}/10\n\n`;
    }
    
    data.validationResults.forEach((result, index) => {
      md += `### Test ${index + 1}\n\n`;
      
      if (result.testPrompt) {
        md += `**Test Prompt:**\n${result.testPrompt}\n\n`;
      }
      
      if (result.expectedBehavior) {
        md += `**Expected Behavior:**\n${result.expectedBehavior}\n\n`;
      }
      
      if (result.response) {
        md += `**AI Response:**\n\`\`\`\n${result.response}\n\`\`\`\n\n`;
      }
      
      if (result.analysis) {
        md += `**Analysis:**\n\`\`\`\n${result.analysis}\n\`\`\`\n\n`;
      }
      
      md += `---\n\n`;
    });
  }
  
  return md;
}

export default function ExportButton({ 
  systemInstruction, 
  validationResults, 
  desiredOutput, 
  context, 
  model 
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [exported, setExported] = useState(false);
  
  const handleExport = (format) => {
    const data = {
      systemInstruction,
      validationResults,
      desiredOutput,
      context,
      model,
      exportedAt: new Date().toISOString(),
    };
    
    const filename = `prompt-export-${Date.now()}`;
    
    if (format === 'json') {
      exportAsJSON(data, filename);
    } else if (format === 'markdown') {
      const markdown = generateMarkdown(data);
      exportAsMarkdown(markdown, filename);
    }
    
    setExported(true);
    setTimeout(() => setExported(false), 2000);
    setShowDropdown(false);
  };
  
  const canExport = systemInstruction || (validationResults && validationResults.length > 0);
  
  if (!canExport) {
    return null;
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          exported 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {exported ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Exported!</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>
      
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
            <button
              onClick={() => handleExport('json')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Export as JSON</span>
            </button>
            <button
              onClick={() => handleExport('markdown')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export as Markdown</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
