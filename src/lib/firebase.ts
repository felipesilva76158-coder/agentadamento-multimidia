import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Booking } from '../types/multimedia';
import { getInitialBookings } from '../data/initialData';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
/* CRITICAL: The app will break without specifying firestoreDatabaseId */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as required by Firestore integration skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Collection reference
export const BOOKINGS_COLLECTION = 'bookings';

/**
 * Subscribe to real-time bookings updates from Firestore
 */
export function subscribeToBookings(
  onData: (bookings: Booking[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, BOOKINGS_COLLECTION);
  return onSnapshot(
    colRef,
    async (snapshot) => {
      // If database is completely empty on initial setup, seed it with school initial bookings
      if (snapshot.empty) {
        try {
          const seeds = getInitialBookings();
          const batch = writeBatch(db);
          for (const item of seeds) {
            const cleanDoc = sanitizeBookingForFirestore(item);
            const docRef = doc(db, BOOKINGS_COLLECTION, item.id);
            batch.set(docRef, cleanDoc);
          }
          await batch.commit();
          // The snapshot listener will trigger again with the seeded documents
          return;
        } catch (seedErr) {
          console.error('Erro ao semear dados iniciais no Firestore:', seedErr);
        }
      }

      const list: Booking[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Booking;
        // Never allow 82.01 in the active list
        if (data.classGroup !== '82.01') {
          list.push({
            ...data,
            id: docSnap.id,
          });
        }
      });

      // Sort by date descending and shift
      list.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
      onData(list);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, BOOKINGS_COLLECTION);
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      }
    }
  );
}

/**
 * Remove undefined values to adhere strictly to Firestore requirements
 */
function sanitizeBookingForFirestore(booking: Booking): Record<string, unknown> {
  const clean: Record<string, unknown> = {
    id: booking.id,
    teacherName: booking.teacherName,
    subject: booking.subject,
    classGroup: booking.classGroup,
    date: booking.date,
    shift: booking.shift,
    periods: booking.periods,
    equipments: booking.equipments,
    location: booking.location,
    purpose: booking.purpose,
    status: booking.status,
    createdAt: booking.createdAt,
  };

  if (booking.locationDetails) clean.locationDetails = booking.locationDetails;
  if (booking.completionReason) clean.completionReason = booking.completionReason;
  if (booking.updatedAt) clean.updatedAt = booking.updatedAt;
  if (booking.completedAt) clean.completedAt = booking.completedAt;

  return clean;
}

/**
 * Save or update a booking in Firestore
 */
export async function saveBookingToFirestore(booking: Booking): Promise<void> {
  try {
    const cleanData = sanitizeBookingForFirestore(booking);
    const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
    await setDoc(docRef, cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${BOOKINGS_COLLECTION}/${booking.id}`);
  }
}

/**
 * Delete a booking from Firestore
 */
export async function deleteBookingFromFirestore(bookingId: string): Promise<void> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${BOOKINGS_COLLECTION}/${bookingId}`);
  }
}

/**
 * Reset Firestore collection with school initial demo data
 */
export async function resetBookingsInFirestore(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
    const batch = writeBatch(db);

    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    const seeds = getInitialBookings();
    for (const item of seeds) {
      const cleanDoc = sanitizeBookingForFirestore(item);
      const docRef = doc(db, BOOKINGS_COLLECTION, item.id);
      batch.set(docRef, cleanDoc);
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, BOOKINGS_COLLECTION);
  }
}
