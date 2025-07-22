import React, { useState } from 'react';
import { Medicine, Customer, Sale } from '../types';
import { BarChart3, TrendingUp, Calendar, Download, Filter, ShoppingBag, Package2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'sales' | 'purchase'>('sales');
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

  // Sales Report Calculations
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalSales = filteredSales.length;
  const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const totalTax = filteredSales.reduce((sum, sale) => sum + sale.tax, 0);
  const totalConsultation = filteredSales.reduce((sum, sale) => sum + sale.consultationCharge, 0);

  // Purchase Report Calculations
  const totalPurchaseValue = medicines.reduce((sum, medicine) => sum + (medicine.purchasePrice * medicine.quantity), 0);
  const totalSellingValue = medicines.reduce((sum, medicine) => sum + (medicine.sellingPrice * medicine.quantity), 0);
  const potentialProfit = totalSellingValue - totalPurchaseValue;
  const totalStock = medicines.reduce((sum, medicine) => sum + medicine.quantity, 0);

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

  // Category-wise analysis
  const categoryStats = medicines.reduce((acc, medicine) => {
    if (!acc[medicine.category]) {
      acc[medicine.category] = {
        count: 0,
        totalValue: 0,
        totalStock: 0
      };
    }
    acc[medicine.category].count += 1;
    acc[medicine.category].totalValue += medicine.sellingPrice * medicine.quantity;
    acc[medicine.category].totalStock += medicine.quantity;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number; totalStock: number }>);

  const exportReport = () => {
    const reportData = {
      reportType: activeTab === 'sales' ? 'Sales Report' : 'Purchase Report',
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      generatedAt: new Date().toISOString(),
      ...(activeTab === 'sales' ? {
        salesSummary: {
          totalRevenue,
          totalSales,
          averageSaleValue,
          totalTax,
          totalConsultation,
          totalCustomers: customers.length
        },
        topMedicines,
        dailySales: filteredSales.map(sale => ({
          date: sale.createdAt,
          customer: sale.customerName,
          amount: sale.totalAmount,
          items: sale.items.length
        }))
      } : {
        purchaseSummary: {
          totalPurchaseValue,
          totalSellingValue,
          potentialProfit,
          totalStock,
          totalMedicines: medicines.length,
          lowStockItems: lowStockMedicines.length,
          expiringItems: expiringMedicines.length
        },
        categoryStats,
        lowStockMedicines: lowStockMedicines.map(m => ({
          name: m.name,
          currentStock: m.quantity,
          minStock: m.minQuantity,
          purchasePrice: m.purchasePrice,
          sellingPrice: m.sellingPrice
        })),
        expiringMedicines: expiringMedicines.map(m => ({
          name: m.name,
          expiryDate: m.expiryDate,
          stock: m.quantity,
          value: m.sellingPrice * m.quantity
        }))
      })
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${activeTab}-report-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    
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

      {/* Report Type Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Sales Report</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('purchase')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'purchase'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package2 className="w-5 h-5" />
                <span>Purchase Report</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Date Range Filter */}
        <div className="p-6 border-b">
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
      </div>

      {/* Sales Report */}
      {activeTab === 'sales' && (
        <>
          {/* Sales Key Metrics */}
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
                  <p className="text-sm font-medium text-gray-600">Total Tax</p>
                  <p className="text-3xl font-bold text-orange-600">₹{totalTax.toFixed(2)}</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Medicines */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Selling Medicines</h2>
            <div className="space-y-3">
              {topMedicines.map((medicine, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{medicine.name}</p>
                      <p className="text-sm text-gray-600">Sold: {medicine.quantity} units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{medicine.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {topMedicines.length === 0 && (
                <p className="text-gray-500 text-center py-4">No sales data available for selected period</p>
              )}
            </div>
          </div>

          {/* Sales Details Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Sales Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{sale.subtotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{sale.tax.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{sale.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSales.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sales found for the selected period
              </div>
            )}
          </div>
        </>
      )}

      {/* Purchase Report */}
      {activeTab === 'purchase' && (
        <>
          {/* Purchase Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Purchase Value</p>
                  <p className="text-3xl font-bold text-blue-600">₹{totalPurchaseValue.toFixed(2)}</p>
                </div>
                <Package2 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selling Value</p>
                  <p className="text-3xl font-bold text-green-600">₹{totalSellingValue.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Potential Profit</p>
                  <p className="text-3xl font-bold text-purple-600">₹{potentialProfit.toFixed(2)}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">₹</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stock</p>
                  <p className="text-3xl font-bold text-orange-600">{totalStock}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Category Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Category-wise Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryStats).map(([category, stats]) => (
                <div key={category} className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{stats.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-medium">{stats.totalStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium">₹{stats.totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
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
                    <p className="text-sm text-gray-600">Current: {medicine.quantity} | Min: {medicine.minQuantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Purchase: ₹{medicine.purchasePrice}</p>
                    <p className="text-sm text-gray-600">Selling: ₹{medicine.sellingPrice}</p>
                  </div>
                </div>
              ))}
              {lowStockMedicines.length === 0 && (
                <p className="text-green-600 text-center py-4">All medicines are well stocked!</p>
              )}
            </div>
          </div>

          {/* Expiring Medicines */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Medicines Expiring Soon (Next 30 Days)</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value at Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiringMedicines.map((medicine) => {
                    const daysLeft = Math.ceil((new Date(medicine.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const valueAtRisk = medicine.quantity * medicine.sellingPrice;
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{valueAtRisk.toFixed(2)}
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
        </>
      )}
    </div>
  );
};