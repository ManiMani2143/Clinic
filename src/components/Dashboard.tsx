import React from 'react';
import { Medicine, Customer, Sale, Notification } from '../types';
import { Pill, Users, ShoppingCart, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

interface DashboardProps {
  medicines: Medicine[];
  customers: Customer[];
  sales: Sale[];
  notifications: Notification[];
  onSectionChange: (section: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  medicines,
  customers,
  sales,
  notifications,
  onSectionChange
}) => {
  const lowStockMedicines = medicines.filter(m => m.quantity <= m.minQuantity);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const todaySales = sales.filter(sale => {
    const today = new Date().toDateString();
    return new Date(sale.createdAt).toDateString() === today;
  });

  const stats = [
    {
      title: 'Total Medicines',
      value: medicines.length,
      icon: Pill,
      color: 'bg-blue-500',
      onClick: () => onSectionChange('medicines')
    },
    {
      title: 'Total Customers',
      value: customers.length,
      icon: Users,
      color: 'bg-green-500',
      onClick: () => onSectionChange('customers')
    },
    {
      title: 'Total Sales',
      value: sales.length,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      onClick: () => onSectionChange('sales')
    },
    {
      title: 'Low Stock Items',
      value: lowStockMedicines.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      onClick: () => onSectionChange('notifications')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-5 h-5" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Card */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Revenue Overview</h2>
          <TrendingUp className="w-6 h-6 text-green-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Today's Sales</p>
            <p className="text-2xl font-bold text-blue-600">{todaySales.length}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Low Stock Alerts</h2>
          {lowStockMedicines.length > 0 ? (
            <div className="space-y-3">
              {lowStockMedicines.slice(0, 5).map((medicine) => (
                <div key={medicine.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-sm text-gray-600">Stock: {medicine.quantity}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Low Stock
                  </span>
                </div>
              ))}
              {lowStockMedicines.length > 5 && (
                <button
                  onClick={() => onSectionChange('notifications')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all {lowStockMedicines.length} alerts
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No low stock alerts</p>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sales</h2>
          {sales.length > 0 ? (
            <div className="space-y-3">
              {sales.slice(-5).reverse().map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Sale #{sale.id.slice(-6)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-semibold text-green-600">
                    ₹{sale.totalAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent sales</p>
          )}
        </div>
      </div>
    </div>
  );
};