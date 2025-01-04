import { Product } from "@/types/product";
import { collection, getDocs, query, where, writeBatch } from "firebase/firestore";
import { Firestore } from 'firebase/firestore';

export function formatTimeLeft(endTimestamp: number): string {
  const now = Date.now();
  const timeLeft = endTimestamp - now;

  if (timeLeft <= 0) {
    return 'Listing ended';
  }

  const minutes = Math.floor(timeLeft / (1000 * 60));
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} left`;
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
  }
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`;
  }
  return 'Less than a minute left';
}

// Add at top of file
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const lastGlobalCheck = new Map<string, number>();

export async function handleExpiredProduct(product: Product, db: Firestore) {
  const now = Date.now();
  
  // Check if we've done a global check in the last 24 hours
  const lastCheck = lastGlobalCheck.get('lastCheck') || 0;
  if (now - lastCheck < TWENTY_FOUR_HOURS) {
    return false;
  }

  // If we haven't checked in 24 hours, do a batch update of all expired products
  try {
    const q = query(
      collection(db, 'products'),
      where('is_bought', '==', false),
      where('endDate', '<=', now)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      lastGlobalCheck.set('lastCheck', now);
      return false;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        is_bought: true,
        buyerId: 'expired',
        buyerEmail: 'Listing Expired'
      });
    });

    await batch.commit();
    lastGlobalCheck.set('lastCheck', now);
    return true;
  } catch (error) {
    console.error('Error batch updating expired products:', error);
    return false;
  }
}