import { storage } from './storage';
import { Notification } from '../types';

export const updateNotifications = (): Notification[] => {
  const medicines = storage.getMedicines();
  const existingNotifications = storage.getNotifications();
  const newNotifications: Notification[] = [];

  // Check for low stock
  medicines.forEach(medicine => {
    if (medicine.quantity <= medicine.minQuantity) {
      const existingNotification = existingNotifications.find(
        n => n.title.includes('Low Stock') && n.message.includes(medicine.name)
      );

      if (!existingNotification) {
        newNotifications.push({
          id: `low-stock-${medicine.id}-${Date.now()}`,
          title: 'Low Stock Alert',
          message: `${medicine.name} is running low. Current stock: ${medicine.quantity}, Minimum required: ${medicine.minQuantity}`,
          type: 'warning',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  // Check for expiring medicines (within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  medicines.forEach(medicine => {
    const expiryDate = new Date(medicine.expiryDate);
    if (expiryDate <= thirtyDaysFromNow && expiryDate > new Date()) {
      const existingNotification = existingNotifications.find(
        n => n.title.includes('Expiry Alert') && n.message.includes(medicine.name)
      );

      if (!existingNotification) {
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        newNotifications.push({
          id: `expiry-${medicine.id}-${Date.now()}`,
          title: 'Expiry Alert',
          message: `${medicine.name} will expire in ${daysUntilExpiry} days (${medicine.expiryDate}). Current stock: ${medicine.quantity}`,
          type: 'error',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  const allNotifications = [...existingNotifications, ...newNotifications];
  storage.saveNotifications(allNotifications);
  return allNotifications;
};