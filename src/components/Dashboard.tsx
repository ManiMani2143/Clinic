import React from 'react';
import { Medicine, Customer, Sale, Notification } from '../types';
import { 
  Pill, Users, ShoppingCart, AlertTriangle, TrendingUp, Calendar, 
  Activity, DollarSign, Package, Clock, Bell, ArrowUp, ArrowDown,
  Eye, Target, Zap
} from 'lucide-react';

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

  const thisMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    const now = new Date();
    return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
  });

  const lastMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return saleDate.getMonth() === lastMonth.getMonth() && saleDate.getFullYear() === lastMonth.getFullYear();
  });

  const thisMonthRevenue = thisMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  const totalStock = medicines.reduce((sum, medicine) => sum + medicine.quantity, 0);
  const totalStockValue = medicines.reduce((sum, medicine) => sum + (medicine.sellingPrice * medicine.quantity), 0);

  // Expiring medicines (within 30 days)
  const expiringMedicines = medicines.filter(m => {
    const expiryDate = new Date(m.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
  });

  const quickStats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      change: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`,
      changeType: revenueGrowth >= 0 ? 'increase' : 'decrease',
      icon: DollarSign,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      onClick: () => onSectionChange('reports')
    },
    {
      title: 'Today\'s Sales',
      value: todaySales.length.toString(),
      change: `${todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}`,
      changeType: 'neutral',
      icon: ShoppingCart,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      onClick: () => onSectionChange('sales')
    },
    {
      title: 'Total Customers',
      value: customers.length.toString(),
      change: 'Active patients',
      changeType: 'neutral',
      icon: Users,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      onClick: () => onSectionChange('customers')
    },
    {
      title: 'Stock Value',
      value: `₹${totalStockValue.toFixed(2)}`,
      change: `${totalStock} units`,
      changeType: 'neutral',
      icon: Package,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      onClick: () => onSectionChange('medicines')
    }
  ];

  const alertStats = [
    {
      title: 'Low Stock',
      value: lowStockMedicines.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: () => onSectionChange('notifications')
    },
    {
      title: 'Expiring Soon',
      value: expiringMedicines.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      onClick: () => onSectionChange('notifications')
    },
    {
      title: 'Notifications',
      value: notifications.filter(n => !n.isRead).length,
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => onSectionChange('notifications')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening at your clinic today.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-md">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={stat.onClick}
              className="relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className={`absolute inset-0 ${stat.color} opacity-5`}></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.changeType !== 'neutral' && (
                    <div className={`flex items-center space-x-1 ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'increase' ? 
                        <ArrowUp className="w-4 h-4" /> : 
                        <ArrowDown className="w-4 h-4" />
                      }
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.changeType === 'neutral' && (
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {alertStats.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <div
              key={index}
              onClick={alert.onClick}
              className={`${alert.bgColor} p-6 rounded-xl border-l-4 border-current cursor-pointer hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${alert.color}`}>{alert.title}</p>
                  <p className={`text-2xl font-bold ${alert.color}`}>{alert.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${alert.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Sales Activity</h2>
              <Activity className="w-6 h-6 text-blue-200" />
            </div>
          </div>
          <div className="p-6">
            {sales.length > 0 ? (
              <div className="space-y-4">
                {sales.slice(-5).reverse().map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{sale.customerName}</p>
                        <p className="text-sm text-gray-600">
                          {sale.items.length} items • {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">₹{sale.totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{new Date(sale.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => onSectionChange('sales')}
                  className="w-full mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View All Sales</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No sales recorded yet</p>
                <button
                  onClick={() => onSectionChange('sales')}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create your first sale
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
                <Zap className="w-6 h-6 text-purple-200" />
              </div>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => onSectionChange('sales')}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center space-x-3"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>New Sale</span>
              </button>
              <button
                onClick={() => onSectionChange('medicines')}
                className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center space-x-3"
              >
                <Pill className="w-5 h-5" />
                <span>Add Medicine</span>
              </button>
              <button
                onClick={() => onSectionChange('customers')}
                className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center space-x-3"
              >
                <Users className="w-5 h-5" />
                <span>Add Customer</span>
              </button>
              <button
                onClick={() => onSectionChange('reports')}
                className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center space-x-3"
              >
                <TrendingUp className="w-5 h-5" />
                <span>View Reports</span>
              </button>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Critical Alerts</h2>
                <Target className="w-6 h-6 text-red-200" />
              </div>
            </div>
            <div className="p-6">
              {lowStockMedicines.length > 0 || expiringMedicines.length > 0 ? (
                <div className="space-y-4">
                  {lowStockMedicines.slice(0, 3).map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-red-900">{medicine.name}</p>
                        <p className="text-sm text-red-600">Stock: {medicine.quantity}</p>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                        Low Stock
                      </span>
                    </div>
                  ))}
                  {expiringMedicines.slice(0, 2).map((medicine) => {
                    const daysLeft = Math.ceil((new Date(medicine.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={medicine.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <p className="font-medium text-yellow-900">{medicine.name}</p>
                          <p className="text-sm text-yellow-600">{daysLeft} days left</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                          Expiring
                        </span>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => onSectionChange('notifications')}
                    className="w-full mt-4 text-red-600 hover:text-red-800 font-medium text-sm flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View All Alerts</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                  <p className="text-green-600 font-medium">All systems normal</p>
                  <p className="text-sm text-gray-500">No critical alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Performance Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{medicines.length}</div>
              <div className="text-sm text-gray-600">Total Medicines</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{thisMonthSales.length}</div>
              <div className="text-sm text-gray-600">This Month Sales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {customers.length > 0 ? (totalRevenue / customers.length).toFixed(0) : '0'}
              </div>
              <div className="text-sm text-gray-600">Avg Revenue/Customer</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {sales.length > 0 ? (totalRevenue / sales.length).toFixed(0) : '0'}
              </div>
              <div className="text-sm text-gray-600">Avg Sale Value</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};