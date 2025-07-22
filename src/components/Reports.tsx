import React, { useState } from 'react';
import { Medicine, Customer, Sale } from '../types';
import { BarChart3, TrendingUp, Calendar, Download, Filter } from 'lucide-react';

interface ReportsProps {
  medicines: Medicine[];
  customers: Customer[];
  sales: Sale[];
}

export const Reports: React.FC<ReportsProps> = ({
  medicines,
  customers,
  sales
}) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    return saleDate >= startDate && saleDate <= endDate;
  });

  // Calculate metrics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalSales = filteredSales.length;
  const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Top selling medicines
  const medicinesSold = filteredSales.flatMap(sale => sale.items);
  const medicineStats = medicinesSold.reduce((acc, item) => {
    if (!acc[item.medicineId]) {
      acc[item.medicineId] = {
        name: item.medicineName,
        quantity: 0,
        revenue: 0
      };
    }
    acc[item.medicineId].quantity += item.quantity;
    acc[item.medicineId].revenue += item.total;
    return acc;
  }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

  const topMedicines = Object.values(medicineStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Low stock medicines
  const lowStockMedicines = medicines.filter(m => m.quantity <= m.minQuantity);

  // Expiring medicines (within 30 days)
  const expiringMedicines = medicines.filter(m => {
    const expiryDate = new Date(m.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  });

  // Daily sales data for the current month
  const dailySales = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.createdAt).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { count: 0, revenue: 0 };
    }
    acc[date].count += 1;
    acc[date].revenue += sale.totalAmount;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const exportReport = () => {
    const reportData = {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      summary: {
        totalRevenue,
        totalSales,
        averageSaleValue,
        totalCustomers: customers.length,
        totalMedicines: medicines.length,
        lowStockItems: lowStockMedicines.length,
        expiringItems: expiringMedicines.length
      },
      topMedicines,
      lowStockMedicines: lowStockMedicines.map(m => ({
        name: m.name,
        currentStock: m.quantity,
        minStock: m.minQuantity
      })),
      expiringMedicines: expiringMedicines.map(m => ({
        name: m.name,
        expiryDate: m.expiryDate,
        stock: m.quantity
      }))
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `clinic-report-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <button
          onClick={exportReport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-3xl font-bold text-blue-600">{totalSales}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Sale Value</p>
              <p className="text-3xl font-bold text-purple-600">₹{averageSaleValue.toFixed(2)}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-red-600">{lowStockMedicines.length}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Medicines */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Selling Medicines</h2>
          <div className="space-y-3">
            {topMedicines.map((medicine, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{medicine.name}</p>
                  <p className="text-sm text-gray-600">Sold: {medicine.quantity} units</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">₹{medicine.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {topMedicines.length === 0 && (
              <p className="text-gray-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Low Stock Alert</h2>
          <div className="space-y-3">
            {lowStockMedicines.map((medicine) => (
              <div key={medicine.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{medicine.name}</p>
                  <p className="text-sm text-gray-600">Current: {medicine.quantity}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Min: {medicine.minQuantity}
                  </span>
                </div>
              </div>
            ))}
            {lowStockMedicines.length === 0 && (
              <p className="text-green-600 text-center py-4">All medicines are well stocked!</p>
            )}
          </div>
        </div>
      </div>

      {/* Expiring Medicines */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Medicines Expiring Soon (Next 30 Days)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Left
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expiringMedicines.map((medicine) => {
                const daysLeft = Math.ceil((new Date(medicine.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {medicine.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(medicine.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {medicine.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        daysLeft <= 7 ? 'bg-red-100 text-red-800' :
                        daysLeft <= 15 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {daysLeft} days
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {expiringMedicines.length === 0 && (
          <div className="text-center py-8 text-green-600">
            No medicines expiring in the next 30 days!
          </div>
        )}
      </div>
    </div>
  );
};