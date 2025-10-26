import { api } from "./api";
import type { InventoryItem, SupplierPurchaseGroup } from "../components/pharmacist/suppliers/types";
import { buildPharmacistNotifications, type NotificationItem } from "../utils/notifications";

const SIGNATURE_KEY = "pharmacist_notifications_signature";

const getSignature = (ids: string[]) => ids.sort().join("|");

export const fetchPharmacistNotificationsList = async () => {
  const [inventoryRes, purchasesRes] = await Promise.all([
    api.get<{ list: InventoryItem[] }>("/inventory"),
    api.get<{ list: SupplierPurchaseGroup[] }>("/purchases"),
  ]);

  const inventory = inventoryRes.data.list || [];
  const purchases = purchasesRes.data.list || [];
  const notifications = buildPharmacistNotifications(inventory, purchases);
  const signature = getSignature(notifications.map((n) => n.id));

  return { notifications, signature };
};

export const fetchPharmacistNotificationsCount = async () => {
  try {
    const { notifications, signature } = await fetchPharmacistNotificationsList();
    const storedSignature = localStorage.getItem(SIGNATURE_KEY) || "";
    if (storedSignature === signature) return 0;
    return notifications.length;
  } catch (error) {
    console.error("Failed to fetch notifications count", error);
    return 0;
  }
};

export const markNotificationsViewed = async (signature?: string) => {
  try {
    let sig = signature;
    if (!sig) {
      const { signature: fetchedSignature } = await fetchPharmacistNotificationsList();
      sig = fetchedSignature;
    }
    localStorage.setItem(SIGNATURE_KEY, sig ?? "");
  } catch (error) {
    console.error("Failed to mark notifications viewed", error);
  }
};

export const fetchPharmacistNotifications = async (): Promise<NotificationItem[]> => {
  const { notifications, signature } = await fetchPharmacistNotificationsList();
  await markNotificationsViewed(signature);
  return notifications;
};
