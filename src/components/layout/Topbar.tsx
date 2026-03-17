'use client';

import { Search, Bell } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none focus:outline-none ml-2 text-sm w-full"
        />
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
          A
        </div>
      </div>
    </header>
  );
}
