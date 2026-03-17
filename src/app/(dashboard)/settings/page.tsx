'use client';

import { Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">App Settings</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="app-name" className="block text-sm font-medium text-gray-700">
                App Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="app-name"
                  id="app-name"
                  defaultValue="Puthi Ghor – Class Wise Learning App"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="support-email" className="block text-sm font-medium text-gray-700">
                Support Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="support-email"
                  id="support-email"
                  defaultValue="support@puthighor.com"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center flex items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => alert('Settings Saved!')}
            >
              <Save className="w-4 h-4 mr-2"/>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
