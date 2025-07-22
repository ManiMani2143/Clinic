import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MedicineManagement } from './components/MedicineManagement';
import { CustomerManagement } from './components/CustomerManagement';
import { SalesManagement } from './components/SalesManagement';
import { NotificationCenter } from './components/NotificationCenter';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Medicine, Customer, Sale, Notification } from './types';
import { storage } from './utils/storage';
import { updateNotifications } from './utils/notifications';
import { generatePatientId } from './utils/patientId';

interface SettingsData {
  doctorConsultationCharge: number;
  clinicName: string;
  doctorName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  licenseNumber: string;
  categories: string[];
  taxRate: number;
  currency: string;
  businessHours: {
    openTime: string;
    closeTime: string;
    workingDays: string[];
  };
  notifications: {
    lowStockAlert: boolean;
    expiryAlert: boolean;
    emailNotifications: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
  };
}

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<SettingsData>({
    doctorConsultationCharge: 200,
    clinicName: 'GN Clinic',
    doctorName: 'Dr. Naveen Kumar',
    clinicAddress: '123 Medical Street, Health City',
    clinicPhone: '+91 944855105',
    clinicEmail: 'info@clinicpro.com',
    licenseNumber: 'MED123456789',
    categories: [
      'Antibiotics', 'Analgesics', 'Antacids', 'Antihistamines', 'Antiseptics',
      'Cardiovascular', 'Dermatology', 'Diabetes', 'Gastroenterology', 'Neurology',
      'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Respiratory', 'Vitamins & Supplements', 'Others'
    ],
    taxRate: 0,
    currency: 'INR',
    businessHours: {
      openTime: '09:00',
      closeTime: '18:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    notifications: {
      lowStockAlert: true,
      expiryAlert: true,
      emailNotifications: false
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily'
    }
  });

  // Load data on component mount
  useEffect(() => {
    setMedicines(storage.getMedicines());
    setCustomers(storage.getCustomers());
    setSales(storage.getSales());
    setNotifications(storage.getNotifications());
    
    // Load settings
    const savedSettings = localStorage.getItem('clinic_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      // Ensure categories exist, use defaults if not
      if (!parsedSettings.categories) {
        parsedSettings.categories = [
          'Antibiotics', 'Analgesics', 'Antacids', 'Antihistamines', 'Antiseptics',
          'Cardiovascular', 'Dermatology', 'Diabetes', 'Gastroenterology', 'Neurology',
          'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Respiratory', 'Vitamins & Supplements', 'Others'
        ];
      }
      setSettings(parsedSettings);
    }
  }, []);

  // Update notifications when medicines change
  useEffect(() => {
    const updatedNotifications = updateNotifications();
    setNotifications(updatedNotifications);
  }, [medicines]);

  // Medicine management
  const handleAddMedicine = (medicineData: Omit<Medicine, 'id' | 'createdAt'>) => {
    const newMedicine: Medicine = {
      ...medicineData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedMedicines = [...medicines, newMedicine];
    setMedicines(updatedMedicines);
    storage.saveMedicines(updatedMedicines);
  };

  const handleEditMedicine = (id: string, medicineData: Omit<Medicine, 'id' | 'createdAt'>) => {
    const updatedMedicines = medicines.map(medicine =>
      medicine.id === id ? { ...medicine, ...medicineData } : medicine
    );
    setMedicines(updatedMedicines);
    storage.saveMedicines(updatedMedicines);
  };

  const handleDeleteMedicine = (id: string) => {
    const updatedMedicines = medicines.filter(medicine => medicine.id !== id);
    setMedicines(updatedMedicines);
    storage.saveMedicines(updatedMedicines);
  };

  const handleUpdateMedicineStock = (medicineId: string, newQuantity: number) => {
    const updatedMedicines = medicines.map(medicine =>
      medicine.id === medicineId ? { ...medicine, quantity: newQuantity } : medicine
    );
    setMedicines(updatedMedicines);
    storage.saveMedicines(updatedMedicines);
  };

  // Customer management
  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    storage.saveCustomers(updatedCustomers);
  };

  const handleEditCustomer = (id: string, customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const updatedCustomers = customers.map(customer =>
      customer.id === id ? { ...customer, ...customerData } : customer
    );
    setCustomers(updatedCustomers);
    storage.saveCustomers(updatedCustomers);
  };

  const handleDeleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    setCustomers(updatedCustomers);
    storage.saveCustomers(updatedCustomers);
  };

  // Sales management
  const handleAddSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    storage.saveSales(updatedSales);
  };

  // Notification management
  const handleMarkAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    );
    setNotifications(updatedNotifications);
    storage.saveNotifications(updatedNotifications);
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true,
    }));
    setNotifications(updatedNotifications);
    storage.saveNotifications(updatedNotifications);
  };

  const handleDeleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);
    storage.saveNotifications(updatedNotifications);
  };

  // Settings management
  const handleSettingsChange = (newSettings: SettingsData) => {
    setSettings(newSettings);
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard
            medicines={medicines}
            customers={customers}
            sales={sales}
            notifications={notifications}
            onSectionChange={setActiveSection}
          />
        );
      case 'medicines':
        return (
          <MedicineManagement
            medicines={medicines}
            onAddMedicine={handleAddMedicine}
            onEditMedicine={handleEditMedicine}
            onDeleteMedicine={handleDeleteMedicine}
          />
        );
      case 'customers':
        return (
          <CustomerManagement
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );
      case 'sales':
        return (
          <SalesManagement
            medicines={medicines}
            customers={customers}
            sales={sales}
            settings={settings}
            onAddSale={handleAddSale}
            onUpdateMedicineStock={handleUpdateMedicineStock}
          />
        );
      case 'notifications':
        return (
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
          />
        );
      case 'reports':
        return (
          <Reports
            medicines={medicines}
            customers={customers}
            sales={sales}
          />
        );
      case 'settings':
        return (
          <Settings
            onSettingsChange={handleSettingsChange}
          />
        );
      default:
        return <Dashboard medicines={medicines} customers={customers} sales={sales} notifications={notifications} onSectionChange={setActiveSection} />;
    }
  };

  return (
    <Layout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      notificationCount={unreadNotificationCount}
    >
      {renderActiveSection()}
    </Layout>
  );
}

export default App;