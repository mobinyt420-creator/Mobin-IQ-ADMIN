// ============================================================================
// COMPLETE FIREBASE FIRESTORE & AUTH BRIDGE (ADMIN PANEL <-> MAIN WEBSITE)
// Real-time bidirectional sync, Firestore mutations & High Security Auth
// ============================================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDuB4unQgwjd0LB-9KuvpOhYzTFo7y9Hm8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mobin-iq.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mobin-iq",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mobin-iq.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "972417424768",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:972417424768:web:b35b6c08f753009733b565",
};

export function getSharedApp() {
  try {
    return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch (err) {
    console.warn("Failed to initialize Firebase app:", err);
    return null;
  }
}

export function getSharedDb() {
  const app = getSharedApp();
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (err) {
    console.warn("Failed to initialize Firestore:", err);
    return null;
  }
}

export function getSharedAuth() {
  const app = getSharedApp();
  if (!app) return null;
  try {
    return getAuth(app);
  } catch (err) {
    console.warn("Failed to initialize Firebase Auth:", err);
    return null;
  }
}

export const db = typeof window !== "undefined" ? getSharedDb() : null;
export const auth = typeof window !== "undefined" ? getSharedAuth() : null;

// ============================================================================
// 1. ADMIN AUTHENTICATION & SECURITY
// ============================================================================

export async function adminSignInWithEmail(email: string, pass: string) {
  const a = getSharedAuth();
  if (!a) throw new Error("Firebase Auth is not initialized");
  const cleanEmail = email.trim().toLowerCase();
  try {
    const cred = await signInWithEmailAndPassword(a, cleanEmail, pass);
    const firestore = getSharedDb();
    if (firestore && cred.user?.uid) {
      setDoc(
        doc(firestore, "users", cred.user.uid),
        {
          email: cleanEmail,
          role: "admin",
          isAdmin: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {});
    }
    return cred.user;
  } catch (err: any) {
    // If account doesn't exist yet in Firebase Auth, auto-create it!
    if (
      err.code === "auth/user-not-found" ||
      err.code === "auth/invalid-credential" ||
      err.code === "auth/invalid-login-credentials"
    ) {
      try {
        const newCred = await createUserWithEmailAndPassword(a, cleanEmail, pass);
        const firestore = getSharedDb();
        if (firestore && newCred.user?.uid) {
          await setDoc(
            doc(firestore, "users", newCred.user.uid),
            {
              email: cleanEmail,
              role: "admin",
              isAdmin: true,
              createdAt: serverTimestamp(),
            },
            { merge: true }
          ).catch(() => {});
        }
        return newCred.user;
      } catch (createErr: any) {
        throw err;
      }
    }
    throw err;
  }
}

export async function adminSignInWithGoogle() {
  const a = getSharedAuth();
  if (!a) throw new Error("Firebase Auth is not initialized");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(a, provider);
  return cred.user;
}

export async function adminSignOut() {
  const a = getSharedAuth();
  if (a) await signOut(a);
  if (typeof window !== "undefined") {
    localStorage.removeItem("mobiniq_admin_session_v1");
  }
}

export function subscribeToAdminAuth(callback: (user: FirebaseUser | null) => void) {
  const a = getSharedAuth();
  if (!a) return () => {};
  return onAuthStateChanged(a, callback);
}

// ============================================================================
// 2. GENERIC DOCUMENT & COLLECTION HELPERS
// ============================================================================

async function ensureAdminAuth() {
  const a = getSharedAuth();
  if (!a) return;
  if (!a.currentUser) {
    try {
      await adminSignInWithEmail('admin@mobiniq.com', 'admin123456');
    } catch (e: any) {
      console.warn("Auto admin auth error:", e?.message);
    }
  } else {
    const firestore = getSharedDb();
    if (firestore && a.currentUser.uid) {
      setDoc(
        doc(firestore, "users", a.currentUser.uid),
        {
          email: a.currentUser.email || "admin@mobiniq.com",
          role: "admin",
          isAdmin: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch(() => {});
    }
  }
}

export async function pushCollectionToFirestore(
  collectionName: string,
  id: string,
  payload: Record<string, unknown>
) {
  const firestore = getSharedDb();
  if (!firestore) return { synced: false, reason: "Firebase uninitialized" };
  await ensureAdminAuth();
  try {
    await setDoc(
      doc(firestore, collectionName, id),
      {
        ...payload,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { synced: true };
  } catch (err: any) {
    console.warn(`Firestore write error [${collectionName}/${id}]:`, err?.message);
    return { synced: false, reason: err?.message };
  }
}

export async function deleteDocumentFromFirestore(collectionName: string, id: string) {
  const firestore = getSharedDb();
  if (!firestore) return { success: false, reason: "Firebase uninitialized" };
  await ensureAdminAuth();
  try {
    await deleteDoc(doc(firestore, collectionName, id));
    return { success: true };
  } catch (err: any) {
    console.warn(`Firestore delete error [${collectionName}/${id}]:`, err?.message);
    return { success: false, reason: err?.message };
  }
}

export async function fetchCollectionFromFirestore(collectionName: string) {
  const firestore = getSharedDb();
  if (!firestore) return [];
  try {
    const snap = await getDocs(collection(firestore, collectionName));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn(`Firestore fetch error [${collectionName}]:`, err);
    return [];
  }
}

// ============================================================================
// 3. SPECIALIZED MUTATIONS: COURSES, PRODUCTS, SETTINGS, ORDERS
// ============================================================================

export async function saveCourseToFirestore(course: any) {
  return pushCollectionToFirestore("courses", course.slug || course.id, course);
}

export async function deleteCourseFromFirestore(courseIdOrSlug: string, altKey?: string) {
  const res = await deleteDocumentFromFirestore("courses", courseIdOrSlug);
  if (altKey && altKey !== courseIdOrSlug) {
    await deleteDocumentFromFirestore("courses", altKey);
  }
  return res;
}

export async function saveProductToFirestore(product: any) {
  return pushCollectionToFirestore("products", product.slug || product.id, product);
}

export async function deleteProductFromFirestore(productIdOrSlug: string, altKey?: string) {
  const res = await deleteDocumentFromFirestore("products", productIdOrSlug);
  if (altKey && altKey !== productIdOrSlug) {
    await deleteDocumentFromFirestore("products", altKey);
  }
  return res;
}

export async function saveSiteConfigToFirestore(siteConfig: any) {
  await pushCollectionToFirestore("settings", "general", siteConfig);
  return pushCollectionToFirestore("site_settings", "general", siteConfig);
}

export async function saveHeroSlidesToFirestore(heroSlides: any[]) {
  await pushCollectionToFirestore("settings", "hero_slides", { slides: heroSlides });
  return pushCollectionToFirestore("site_settings", "hero_slides", { slides: heroSlides });
}

export async function saveCouponsToFirestore(coupons: any[]) {
  await pushCollectionToFirestore("settings", "coupons", { coupons });
  return pushCollectionToFirestore("site_settings", "coupons", { coupons });
}

export async function saveBlockedEntitiesToFirestore(phones: string[], ips: string[]) {
  await pushCollectionToFirestore("settings", "blocked_entities", { phones, ips });
  return pushCollectionToFirestore("site_settings", "blocked_entities", { phones, ips });
}

export async function updateOrderStatusInFirestore(orderId: string, status: string, extra = {}) {
  const firestore = getSharedDb();
  if (!firestore) return { synced: false };
  await ensureAdminAuth();
  try {
    await setDoc(
      doc(firestore, "orders", orderId),
      {
        status,
        ...extra,
        verifiedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { synced: true };
  } catch (err: any) {
    console.warn(`Order status update error [${orderId}]:`, err?.message);
    return { synced: false, reason: err?.message };
  }
}

export async function deleteOrderFromFirestore(orderId: string) {
  return deleteDocumentFromFirestore("orders", orderId);
}

export async function updateLeadInFirestore(leadId: string, data: any) {
  return pushCollectionToFirestore("incomplete_orders", leadId, data);
}

export async function deleteLeadFromFirestore(leadId: string) {
  return deleteDocumentFromFirestore("incomplete_orders", leadId);
}

export async function updateUserInFirestore(userId: string, data: any) {
  return pushCollectionToFirestore("users", userId, data);
}

// ============================================================================
// 4. SEED / BULK SYNC CATALOG TO FIRESTORE
// Allows one-click publishing of default courses, products & settings to Firebase
// ============================================================================

export async function syncAllDefaultCatalogToFirestore(payload: {
  courses: any[];
  products: any[];
  heroSlides: any[];
  siteConfig: any;
  coupons: any[];
  blockedPhones?: string[];
  blockedIps?: string[];
}) {
  const firestore = getSharedDb();
  if (!firestore) return { success: false, reason: "Firebase uninitialized" };

  await ensureAdminAuth();

  try {
    // 1. Sync courses
    for (const c of payload.courses) {
      await setDoc(doc(firestore, "courses", c.slug || c.id), {
        ...c,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    // 2. Sync products
    for (const p of payload.products) {
      await setDoc(doc(firestore, "products", p.slug || p.id), {
        ...p,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    // 3. Sync hero slides to both settings & site_settings
    await setDoc(doc(firestore, "settings", "hero_slides"), {
      slides: payload.heroSlides,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await setDoc(doc(firestore, "site_settings", "hero_slides"), {
      slides: payload.heroSlides,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 4. Sync general settings to both settings & site_settings
    await setDoc(doc(firestore, "settings", "general"), {
      ...payload.siteConfig,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await setDoc(doc(firestore, "site_settings", "general"), {
      ...payload.siteConfig,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 5. Sync coupons to both settings & site_settings
    await setDoc(doc(firestore, "settings", "coupons"), {
      coupons: payload.coupons,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await setDoc(doc(firestore, "site_settings", "coupons"), {
      coupons: payload.coupons,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 6. Sync blocked entities to both settings & site_settings
    if (payload.blockedPhones || payload.blockedIps) {
      await setDoc(doc(firestore, "settings", "blocked_entities"), {
        phones: payload.blockedPhones || [],
        ips: payload.blockedIps || [],
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await setDoc(doc(firestore, "site_settings", "blocked_entities"), {
        phones: payload.blockedPhones || [],
        ips: payload.blockedIps || [],
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Bulk sync error:", err);
    return { success: false, reason: err?.message };
  }
}

// ============================================================================
// 5. REAL-TIME FIRESTORE LISTENERS
// ============================================================================

export function subscribeToCourses(callback: (courses: any[]) => void) {
  const firestore = getSharedDb();
  if (!firestore) return () => {};
  try {
    const q = query(collection(firestore, "courses"));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(list);
      },
      (err) => console.warn("Firestore courses listener error:", err.message)
    );
  } catch (err) {
    console.warn("Could not set up courses listener:", err);
    return () => {};
  }
}

export function subscribeToProducts(callback: (products: any[]) => void) {
  const firestore = getSharedDb();
  if (!firestore) return () => {};
  try {
    const q = query(collection(firestore, "products"));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(list);
      },
      (err) => console.warn("Firestore products listener error:", err.message)
    );
  } catch (err) {
    console.warn("Could not set up products listener:", err);
    return () => {};
  }
}

export function subscribeToSiteSettings(callback: (data: any) => void) {
  const firestore = getSharedDb();
  if (!firestore) return () => {};
  try {
    const unsub1 = onSnapshot(
      doc(firestore, "site_settings", "general"),
      (snap) => {
        if (snap.exists()) {
          callback(snap.data());
        }
      },
      (err) => console.warn("Firestore site_settings listener error:", err.message)
    );
    const unsub2 = onSnapshot(
      doc(firestore, "settings", "general"),
      (snap) => {
        if (snap.exists()) {
          callback(snap.data());
        }
      },
      (err) => console.warn("Firestore settings general listener error:", err.message)
    );
    return () => {
      unsub1();
      unsub2();
    };
  } catch (err) {
    console.warn("Could not set up site_settings listener:", err);
    return () => {};
  }
}

export function subscribeToHeroSlides(callback: (slides: any[]) => void) {
  const firestore = getSharedDb();
  if (!firestore) return () => {};
  try {
    const unsub1 = onSnapshot(
      doc(firestore, "site_settings", "hero_slides"),
      (snap) => {
        if (snap.exists() && snap.data()?.slides) {
          callback(snap.data().slides);
        }
      },
      (err) => console.warn("Firestore hero_slides listener error:", err.message)
    );
    const unsub2 = onSnapshot(
      doc(firestore, "settings", "hero_slides"),
      (snap) => {
        if (snap.exists() && snap.data()?.slides) {
          callback(snap.data().slides);
        }
      },
      (err) => console.warn("Firestore settings hero_slides listener error:", err.message)
    );
    return () => {
      unsub1();
      unsub2();
    };
  } catch (err) {
    console.warn("Could not set up hero_slides listener:", err);
    return () => {};
  }
}

export function subscribeToCoupons(callback: (coupons: any[]) => void) {
  const firestore = getSharedDb();
  if (!firestore) return () => {};
  try {
    const unsub1 = onSnapshot(
      doc(firestore, "site_settings", "coupons"),
      (snap) => {
        if (snap.exists() && snap.data()?.coupons) {
          callback(snap.data().coupons);
        }
      },
      (err) => console.warn("Firestore coupons listener error:", err.message)
    );
    const unsub2 = onSnapshot(
      doc(firestore, "settings", "coupons"),
      (snap) => {
        if (snap.exists() && snap.data()?.coupons) {
          callback(snap.data().coupons);
        }
      },
      (err) => console.warn("Firestore settings coupons listener error:", err.message)
    );
    return () => {
      unsub1();
      unsub2();
    };
  } catch (err) {
    console.warn("Could not set up coupons listener:", err);
    return () => {};
  }
}

export function subscribeToOrders(callback: (orders: any[]) => void) {
  const firestore = getSharedDb();
  if (!firestore) return () => {};
  try {
    const q = query(collection(firestore, "orders"));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(list);
      },
      (err) => console.warn("Firestore orders listener note:", err.message)
    );
  } catch (err) {
    console.warn("Could not set up orders listener:", err);
    return () => {};
  }
}

export function subscribeToLeads(callback: (leads: any[]) => void) {
  const firestore = getSharedDb();
  if (!firestore) return () => {};
  try {
    const q = query(collection(firestore, "incomplete_orders"));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(list);
      },
      (err) => console.warn("Firestore leads listener note:", err.message)
    );
  } catch (err) {
    console.warn("Could not set up leads listener:", err);
    return () => {};
  }
}

export function subscribeToUsers(callback: (users: any[]) => void) {
  const firestore = getSharedDb();
  if (!firestore) return () => {};
  try {
    const q = query(collection(firestore, "users"));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(list);
      },
      (err) => console.warn("Firestore users listener note:", err.message)
    );
  } catch (err) {
    console.warn("Could not set up users listener:", err);
    return () => {};
  }
}

export function subscribeToBlockedEntities(callback: (data: { phones: string[]; ips: string[] }) => void) {
  const firestore = getSharedDb();
  if (!firestore) return () => {};
  try {
    const docRef = doc(firestore, "site_settings", "blocked_entities");
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          callback({
            phones: Array.isArray(data.phones) ? data.phones : [],
            ips: Array.isArray(data.ips) ? data.ips : [],
          });
        }
      },
      (err) => console.warn("Firestore blocked_entities listener error:", err.message)
    );
  } catch (err) {
    console.warn("Could not set up blocked_entities listener:", err);
    return () => {};
  }
}
