export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-md">
            <span className="text-gray-500 text-sm">Traffic Chart Data Will Appear Here</span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Most Active Classes</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-md">
            <span className="text-gray-500 text-sm">Class Engagement Data Will Appear Here</span>
          </div>
        </div>
      </div>
    </div>
  );
}
