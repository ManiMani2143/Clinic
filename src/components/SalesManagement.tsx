import React, { useState } from 'react';
import { Medicine, Customer, Sale } from '../types';
import { Plus, Trash2, ShoppingCart, User, Package, Receipt } from 'lucide-react';

interface SalesManagementProps {
  medicines: Medicine[];
  customers: Customer[];
  sales: Sale[];
  settings: any;
  onAddSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  onUpdateMedicineStock: (medicineId: string, newQuantity: number) => void;
}

interface SaleItem {
  medicineId: string;
  quantity: number;
  price: number;
}

export const SalesManagement: React.FC<SalesManagementProps> = ({
  medicines,
  customers,
  sales,
  settings,
  onAddSale,
  onUpdateMedicineStock
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [consultationCharge, setConsultationCharge] = useState(settings.doctorConsultationCharge || 0);

  const addSaleItem = () => {
    setSaleItems([...saleItems, { medicineId: '', quantity: 1, price: 0 }]);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateSaleItem = (index: number, field: keyof SaleItem, value: string | number) => {
    const updatedItems = [...saleItems];
    if (field === 'medicineId') {
      const medicine = medicines.find(m => m.id === value);
      updatedItems[index] = {
        ...updatedItems[index],
        medicineId: value as string,
        price: medicine ? medicine.sellingPrice : 0
      };
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    setSaleItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return saleItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (settings.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + consultationCharge;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer || saleItems.length === 0) {
      alert('Please select a customer and add at least one item');
      return;
    }

    // Check stock availability
    for (const item of saleItems) {
      const medicine = medicines.find(m => m.id === item.medicineId);
      if (!medicine || medicine.quantity < item.quantity) {
        alert(`Insufficient stock for ${medicine?.name || 'selected medicine'}`);
        return;
      }
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    const saleData = {
      customerId: selectedCustomer,
      customerName: customer.name,
      items: saleItems.map(item => {
        const medicine = medicines.find(m => m.id === item.medicineId);
        return {
          medicineId: item.medicineId,
          medicineName: medicine?.name || '',
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        };
      }),
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      consultationCharge,
      totalAmount: calculateTotal(),
      paymentMethod: 'Cash',
      status: 'Completed'
    };

    // Update medicine stock
    saleItems.forEach(item => {
      const medicine = medicines.find(m => m.id === item.medicineId);
      if (medicine) {
        onUpdateMedicineStock(item.medicineId, medicine.quantity - item.quantity);
      }
    });

    onAddSale(saleData);
    
    // Reset form
    setSelectedCustomer('');
    setSaleItems([]);
    setConsultationCharge(settings.doctorConsultationCharge || 0);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Sale</span>
        </button>
      </div>

      {/* Sales Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Sale</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
              <select
                required
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.patientId}
                  </option>
                ))}
              </select>
            </div>

            {/* Sale Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Sale Items</label>
                <button
                  type="button"
                  onClick={addSaleItem}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Add Item
                </button>
              </div>
              
              {saleItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
                    <select
                      required
                      value={item.medicineId}
                      onChange={(e) => updateSaleItem(index, 'medicineId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Medicine</option>
                      {medicines.filter(m => m.quantity > 0).map(medicine => (
                        <option key={medicine.id} value={medicine.id}>
                          {medicine.name} (Stock: {medicine.quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateSaleItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeSaleItem(index)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Consultation Charge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Charge</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={consultationCharge}
                onChange={(e) => setConsultationCharge(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Bill Summary */}
            {saleItems.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Bill Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({settings.taxRate}%):</span>
                    <span>₹{calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consultation:</span>
                    <span>₹{consultationCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Complete Sale
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedCustomer('');
                  setSaleItems([]);
                  setConsultationCharge(settings.doctorConsultationCharge || 0);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Sales */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.slice(-10).reverse().map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Receipt className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        #{sale.id.slice(-6)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{sale.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{sale.items.length} items</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{sale.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sales.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No sales recorded yet
          </div>
        )}
      </div>
    </div>
  );
};