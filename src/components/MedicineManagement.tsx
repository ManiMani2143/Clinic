import React, { useState } from 'react';
import { Medicine } from '../types';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';

interface MedicineManagementProps {
  medicines: Medicine[];
  onAddMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt'>) => void;
  onEditMedicine: (id: string, medicine: Omit<Medicine, 'id' | 'createdAt'>) => void;
  onDeleteMedicine: (id: string) => void;
}

export const MedicineManagement: React.FC<MedicineManagementProps> = ({
  medicines,
  onAddMedicine,
  onEditMedicine,
  onDeleteMedicine
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    quantity: 0,
    minQuantity: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    description: ''
  });

  // Get settings from localStorage
  const getSettings = () => {
    const savedSettings = localStorage.getItem('clinic_settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      categories: [
        'Antibiotics', 'Analgesics', 'Antacids', 'Antihistamines', 'Antiseptics',
        'Cardiovascular', 'Dermatology', 'Diabetes', 'Gastroenterology', 'Neurology',
        'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Respiratory', 'Vitamins & Supplements', 'Others'
      ],
      medicineNames: [
        'Paracetamol', 'Aspirin', 'Ibuprofen', 'Amoxicillin', 'Azithromycin',
        'Omeprazole', 'Metformin', 'Atorvastatin', 'Lisinopril', 'Amlodipine',
        'Cetirizine', 'Loratadine', 'Dextromethorphan', 'Guaifenesin', 'Salbutamol'
      ]
    };
  };

  const settings = getSettings();
  const categories = settings.categories || [];
  const medicineNames = settings.medicineNames || [];

  // Filter suggestions based on input
  const filteredMedicineNames = medicineNames.filter((name: string) =>
    name.toLowerCase().includes(formData.name.toLowerCase())
  );

  const filteredCategories = categories.filter((category: string) =>
    category.toLowerCase().includes(formData.category.toLowerCase())
  );

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMedicine) {
      onEditMedicine(editingMedicine.id, formData);
      setEditingMedicine(null);
    } else {
      onAddMedicine(formData);
    }
    setFormData({
      name: '',
      category: '',
      manufacturer: '',
      batchNumber: '',
      expiryDate: '',
      quantity: 0,
      minQuantity: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      description: ''
    });
    setShowForm(false);
    setShowNameSuggestions(false);
    setShowCategorySuggestions(false);
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      batchNumber: medicine.batchNumber,
      expiryDate: medicine.expiryDate,
      quantity: medicine.quantity,
      minQuantity: medicine.minQuantity,
      purchasePrice: medicine.purchasePrice,
      sellingPrice: medicine.sellingPrice,
      description: medicine.description || ''
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMedicine(null);
    setShowNameSuggestions(false);
    setShowCategorySuggestions(false);
    setFormData({
      name: '',
      category: '',
      manufacturer: '',
      batchNumber: '',
      expiryDate: '',
      quantity: 0,
      minQuantity: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      description: ''
    });
  };

  const handleNameSelect = (name: string) => {
    setFormData({ ...formData, name });
    setShowNameSuggestions(false);
  };

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, category });
    setShowCategorySuggestions(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Medicine Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Medicine Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setShowNameSuggestions(true);
                }}
                onFocus={() => setShowNameSuggestions(true)}
                onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showNameSuggestions && filteredMedicineNames.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredMedicineNames.map((name: string, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleNameSelect(name)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  setShowCategorySuggestions(true);
                }}
                onFocus={() => setShowCategorySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                placeholder="Enter or select category"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showCategorySuggestions && filteredCategories.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredCategories.map((category: string, index: number) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input
                type="text"
                required
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
              <input
                type="text"
                required
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medicine List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-500">{medicine.manufacturer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {medicine.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{medicine.quantity}</div>
                    {medicine.quantity <= medicine.minQuantity && (
                      <div className="text-xs text-red-600">Low Stock</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{medicine.sellingPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(medicine.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(medicine)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMedicine(medicine.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMedicines.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No medicines found
          </div>
        )}
      </div>
    </div>
  );
};