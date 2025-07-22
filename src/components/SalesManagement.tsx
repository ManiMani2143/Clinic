import React, { useState } from 'react';
import { Medicine, Customer, Sale } from '../types';
import { Plus, Trash2, ShoppingCart, User, Package, Receipt, FileText, Search } from 'lucide-react';

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
  const [customerSearch, setCustomerSearch] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [consultationCharge, setConsultationCharge] = useState(settings.doctorConsultationCharge || 0);
  const [showBill, setShowBill] = useState(false);
  const [currentBill, setCurrentBill] = useState<any>(null);

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.patientId.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  );

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

  const generateBill = () => {
    if (!selectedCustomer || saleItems.length === 0) {
      alert('Please select a customer and add at least one item');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    const billData = {
      billNumber: `BILL-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      customer: {
        name: customer.name,
        patientId: customer.patientId,
        phone: customer.phone,
        address: customer.address
      },
      clinic: {
        name: settings.clinicName,
        doctor: settings.doctorName,
        address: settings.clinicAddress,
        phone: settings.clinicPhone,
        license: settings.licenseNumber
      },
      items: saleItems.map(item => {
        const medicine = medicines.find(m => m.id === item.medicineId);
        return {
          name: medicine?.name || '',
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        };
      }),
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      taxRate: settings.taxRate,
      consultationCharge,
      totalAmount: calculateTotal()
    };

    setCurrentBill(billData);
    setShowBill(true);
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
    setCustomerSearch('');
    setSaleItems([]);
    setConsultationCharge(settings.doctorConsultationCharge || 0);
    setShowForm(false);
    setShowBill(false);
  };

  const printBill = () => {
    window.print();
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

      {/* Bill Display Modal */}
      {showBill && currentBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="print:block">
              {/* Bill Header */}
              <div className="text-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-900">{currentBill.clinic.name}</h1>
                <p className="text-gray-600">{currentBill.clinic.doctor}</p>
                <p className="text-sm text-gray-500">{currentBill.clinic.address}</p>
                <p className="text-sm text-gray-500">Phone: {currentBill.clinic.phone}</p>
                <p className="text-sm text-gray-500">License: {currentBill.clinic.license}</p>
              </div>

              {/* Bill Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                  <p className="text-gray-700">{currentBill.customer.name}</p>
                  <p className="text-sm text-gray-600">ID: {currentBill.customer.patientId}</p>
                  <p className="text-sm text-gray-600">Phone: {currentBill.customer.phone}</p>
                  <p className="text-sm text-gray-600">{currentBill.customer.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">Bill #{currentBill.billNumber}</p>
                  <p className="text-sm text-gray-600">Date: {currentBill.date}</p>
                  <p className="text-sm text-gray-600">Time: {currentBill.time}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Qty</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBill.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">₹{item.price.toFixed(2)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bill Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>₹{currentBill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Tax ({currentBill.taxRate}%):</span>
                      <span>₹{currentBill.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Consultation:</span>
                      <span>₹{currentBill.consultationCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{currentBill.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 pt-4 border-t text-sm text-gray-500">
                <p>Thank you for visiting {currentBill.clinic.name}</p>
                <p>Get well soon!</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 print:hidden">
              <button
                onClick={printBill}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Print Bill
              </button>
              <button
                onClick={() => setShowBill(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Sale</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection with Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {customerSearch && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg">
                  {filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(customer.id);
                        setCustomerSearch(customer.name);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.patientId} - {customer.phone}</div>
                    </button>
                  ))}
                </div>
              )}
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
                type="button"
                onClick={generateBill}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Generate Bill</span>
              </button>
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
                  setCustomerSearch('');
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