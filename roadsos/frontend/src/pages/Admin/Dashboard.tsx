import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Activity, Users, MapPin, Database } from 'lucide-react';
import axios from 'axios';

export const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalServices: 0,
    activeSos: 0,
    pendingFlags: 0
  });

  useEffect(() => {
    // Mocking fetch for stats
    setStats({
      totalServices: 142,
      activeSos: 3,
      pendingFlags: 12
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-condensed font-bold text-navy flex items-center">
          <ShieldCheck className="mr-3 text-emergency" size={32} />
          ROADSoS Admin
        </h1>
        <div className="flex items-center space-x-4">
          <span className="font-semibold">Admin User</span>
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">Logout</button>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-medium mb-1">Total Services</h3>
              <p className="text-4xl font-bold text-navy">{stats.totalServices}</p>
            </div>
            <Database size={48} className="text-blue-100" />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-medium mb-1">Active SOS Events</h3>
              <p className="text-4xl font-bold text-emergency">{stats.activeSos}</p>
            </div>
            <Activity size={48} className="text-red-100" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-medium mb-1">Pending Flags</h3>
              <p className="text-4xl font-bold text-amber-600">{stats.pendingFlags}</p>
            </div>
            <Users size={48} className="text-amber-100" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-navy">Recent Services</h2>
            <button className="px-4 py-2 bg-navy text-white rounded hover:bg-opacity-90">Add Service</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-6 py-4 font-medium text-navy">AIIMS Delhi Trauma Centre</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Hospital</span></td>
                <td className="px-6 py-4 text-gray-500 flex items-center"><MapPin size={16} className="mr-1"/> Delhi</td>
                <td className="px-6 py-4"><span className="text-green-600 font-medium">Active</span></td>
                <td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">Edit</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-navy">Delhi Ambulance 102</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Ambulance</span></td>
                <td className="px-6 py-4 text-gray-500 flex items-center"><MapPin size={16} className="mr-1"/> Delhi NCR</td>
                <td className="px-6 py-4"><span className="text-green-600 font-medium">Active</span></td>
                <td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">Edit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
