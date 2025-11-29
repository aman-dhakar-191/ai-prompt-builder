export default function ValidationResults({ results }) {
  if (!results) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Validation Results</h2>
      </div>

      <div className="space-y-6">
        {/* Test Response */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>AI Response</span>
          </h3>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
              {results.response}
            </pre>
          </div>
        </div>

        {/* Analysis */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Validation Analysis</span>
          </h3>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
              {results.analysis}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
