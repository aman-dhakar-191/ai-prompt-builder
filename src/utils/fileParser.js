/**
 * Parse CSV content into an array of test prompt objects
 * Expected CSV format: testPrompt,expectedBehavior (with header row)
 * @param {string} content - CSV file content
 * @returns {Array<{id: string, testPrompt: string, expectedBehavior: string}>}
 */
export function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must have a header row and at least one data row');
  }

  // Parse header to find column indices
  const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const testPromptIndex = header.findIndex(h => 
    h === 'testprompt' || h === 'test_prompt' || h === 'test prompt' || h === 'prompt'
  );
  const expectedBehaviorIndex = header.findIndex(h => 
    h === 'expectedbehavior' || h === 'expected_behavior' || h === 'expected behavior' || h === 'expected' || h === 'behavior'
  );

  if (testPromptIndex === -1) {
    throw new Error('CSV must have a "testPrompt" or "prompt" column');
  }
  if (expectedBehaviorIndex === -1) {
    throw new Error('CSV must have an "expectedBehavior" or "expected" column');
  }

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const testPrompt = values[testPromptIndex]?.trim() || '';
    const expectedBehavior = values[expectedBehaviorIndex]?.trim() || '';
    
    if (testPrompt && expectedBehavior) {
      result.push({
        id: crypto.randomUUID(),
        testPrompt,
        expectedBehavior,
      });
    }
  }

  if (result.length === 0) {
    throw new Error('No valid test prompts found in CSV file');
  }

  return result;
}

/**
 * Parse a single CSV line, handling quoted values
 * @param {string} line - A single CSV line
 * @returns {string[]}
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result;
}

/**
 * Parse JSON content into an array of test prompt objects
 * Expected JSON format: Array of objects with testPrompt and expectedBehavior properties
 * @param {string} content - JSON file content
 * @returns {Array<{id: string, testPrompt: string, expectedBehavior: string}>}
 */
export function parseJSON(content) {
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw e;
  }

  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of test prompt objects');
  }

  if (data.length === 0) {
    throw new Error('JSON array is empty');
  }

  const result = data.map((item) => {
    // Support various property name formats
    const testPrompt = 
      item.testPrompt || item.test_prompt || item['test prompt'] || item.prompt || '';
    const expectedBehavior = 
      item.expectedBehavior || item.expected_behavior || item['expected behavior'] || 
      item.expected || item.behavior || '';

    if (!testPrompt || !expectedBehavior) {
      return null;
    }

    return {
      id: crypto.randomUUID(),
      testPrompt: String(testPrompt).trim(),
      expectedBehavior: String(expectedBehavior).trim(),
    };
  }).filter(item => item !== null);

  if (result.length === 0) {
    throw new Error('No valid test prompts found in JSON file. Each object must have "testPrompt" and "expectedBehavior" properties.');
  }

  return result;
}

/**
 * Parse file content based on file extension
 * @param {File} file - File object
 * @returns {Promise<Array<{id: string, testPrompt: string, expectedBehavior: string}>>}
 */
export async function parseFile(file) {
  const content = await file.text();
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSV(content);
  } else if (extension === 'json') {
    return parseJSON(content);
  } else {
    throw new Error('Unsupported file format. Please use CSV or JSON files.');
  }
}
