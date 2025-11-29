export default function TabNavigation({ activeTab, onTabChange, tabs }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-violet-600 text-violet-600 bg-violet-50'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-violet-200 text-violet-700'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
