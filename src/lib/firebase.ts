
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verifica se Firebase è configurato
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId;
};

let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// Types
export interface ShoppingItem {
  id: string;
  user_id: string;
  name: string;
  quantity: string;
  category: string;
  priority: 'alta' | 'media' | 'bassa';
  cost: number;
  completed: boolean;
  purchased_by?: string;
  created_at: string;
}

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiry_date: string;
  status: 'abbondante' | 'normale' | 'scarso' | 'scaduto';
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  servings: number;
  category: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_name?: string;
  app_review: boolean;
  rating: number;
  comment: string;
  category: string;
  helpful_count: number;
  created_at: string;
}

export interface SharedList {
  id: string;
  owner_id: string;
  name: string;
  type: 'shopping' | 'pantry';
  members: string[];
  items: any[];
  total_cost: number;
  created_at: string;
}

export const CATEGORIES = {
  food: [
    'Frutta e Verdura', 'Carne e Pesce', 'Latticini', 'Cereali e Pasta',
    'Pane e Dolci', 'Bevande', 'Condimenti', 'Surgelati', 'Conserve', 'Altro'
  ],
  home: [
    'Pulizia Casa', 'Igiene Personale', 'Farmacia', 'Casa e Giardino', 'Elettronica'
  ]
};

// Auth functions
export const firebaseAuth = {
  isAuthenticated: () => {
    if (!auth) return false;
    return !!auth.currentUser;
  },
  
  getCurrentUser: () => {
    if (!auth) return null;
    const user = auth.currentUser;
    return user ? {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'Utente'
    } : null;
  },

  login: async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase non configurato');
    return await signInWithEmailAndPassword(auth, email, password);
  },

  register: async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase non configurato');
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  logout: async () => {
    if (!auth) return;
    await signOut(auth);
  }
};

// API functions
export const firebaseApi = {
  // Shopping List
  getShoppingItems: async (): Promise<ShoppingItem[]> => {
    if (!db || !auth?.currentUser) return [];
    const q = query(
      collection(db, 'shopping_items'),
      where('user_id', '==', auth.currentUser.uid),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingItem));
  },

  createShoppingItem: async (data: Omit<ShoppingItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    return await addDoc(collection(db, 'shopping_items'), {
      ...data,
      user_id: auth.currentUser.uid,
      created_at: new Date().toISOString()
    });
  },

  updateShoppingItem: async (id: string, data: Partial<ShoppingItem>) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'shopping_items', id);
    return await updateDoc(docRef, data);
  },

  deleteShoppingItem: async (id: string) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'shopping_items', id);
    return await deleteDoc(docRef);
  },

  // Pantry
  getPantryItems: async (): Promise<PantryItem[]> => {
    if (!db || !auth?.currentUser) return [];
    const q = query(
      collection(db, 'pantry_items'),
      where('user_id', '==', auth.currentUser.uid),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
  },

  createPantryItem: async (data: Omit<PantryItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    return await addDoc(collection(db, 'pantry_items'), {
      ...data,
      user_id: auth.currentUser.uid,
      created_at: new Date().toISOString()
    });
  },

  updatePantryItem: async (id: string, data: Partial<PantryItem>) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'pantry_items', id);
    return await updateDoc(docRef, data);
  },

  deletePantryItem: async (id: string) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'pantry_items', id);
    return await deleteDoc(docRef);
  },

  // Recipes
  getRecipes: async (): Promise<Recipe[]> => {
    if (!db || !auth?.currentUser) return [];
    const q = query(
      collection(db, 'recipes'),
      where('user_id', '==', auth.currentUser.uid),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
  },

  createRecipe: async (data: Omit<Recipe, 'id' | 'user_id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    return await addDoc(collection(db, 'recipes'), {
      ...data,
      user_id: auth.currentUser.uid,
      created_at: new Date().toISOString()
    });
  },

  deleteRecipe: async (id: string) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'recipes', id);
    return await deleteDoc(docRef);
  },

  // Reviews
  getReviews: async (): Promise<Review[]> => {
    if (!db || !auth?.currentUser) return [];
    const q = query(
      collection(db, 'reviews'),
      where('user_id', '==', auth.currentUser.uid),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  },

  createReview: async (data: Omit<Review, 'id' | 'user_id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    return await addDoc(collection(db, 'reviews'), {
      ...data,
      user_id: auth.currentUser.uid,
      helpful_count: 0,
      created_at: new Date().toISOString()
    });
  },

  deleteReview: async (id: string) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'reviews', id);
    return await deleteDoc(docRef);
  },

  // Shared Lists
  getSharedLists: async (): Promise<SharedList[]> => {
    if (!db || !auth?.currentUser) return [];
    const q = query(
      collection(db, 'shared_lists'),
      where('members', 'array-contains', auth.currentUser.email),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedList));
  },

  createSharedList: async (data: Omit<SharedList, 'id' | 'owner_id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    return await addDoc(collection(db, 'shared_lists'), {
      ...data,
      owner_id: auth.currentUser.uid,
      created_at: new Date().toISOString()
    });
  },

  deleteSharedList: async (id: string) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'shared_lists', id);
    return await deleteDoc(docRef);
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    if (!db || !auth?.currentUser) return {
      shoppingItems: 0,
      pantryItems: 0,
      recipes: 0,
      sharedLists: 0,
      expiringSoon: 0,
      recentActivity: []
    };

    const [shoppingItems, pantryItems, recipes, sharedLists] = await Promise.all([
      firebaseApi.getShoppingItems(),
      firebaseApi.getPantryItems(),
      firebaseApi.getRecipes(),
      firebaseApi.getSharedLists()
    ]);

    const today = new Date();
    const expiringSoon = pantryItems.filter(item => {
      const expiryDate = new Date(item.expiry_date);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;

    const recentActivity = [
      ...shoppingItems.slice(0, 2).map(item => ({
        type: 'add',
        action: `Aggiunto "${item.name}" alla lista spesa`,
        time: new Date(item.created_at).toLocaleDateString()
      })),
      ...recipes.slice(0, 2).map(recipe => ({
        type: 'save',
        action: `Salvata ricetta "${recipe.name}"`,
        time: new Date(recipe.created_at).toLocaleDateString()
      }))
    ].slice(0, 4);

    return {
      shoppingItems: shoppingItems.length,
      pantryItems: pantryItems.length,
      recipes: recipes.length,
      sharedLists: sharedLists.length,
      expiringSoon,
      recentActivity
    };
  },

  // Settings functions
  updateProfile: async (profile: any) => {
    // Implementazione semplificata
    return Promise.resolve();
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    // Implementazione semplificata
    return Promise.resolve();
  },

  exportData: async () => {
    if (!auth?.currentUser) return {};
    const [shoppingItems, pantryItems, recipes, reviews] = await Promise.all([
      firebaseApi.getShoppingItems(),
      firebaseApi.getPantryItems(),
      firebaseApi.getRecipes(),
      firebaseApi.getReviews()
    ]);
    
    return {
      shoppingItems,
      pantryItems,
      recipes,
      reviews,
      exportedAt: new Date().toISOString()
    };
  },

  deleteAllData: async () => {
    if (!auth?.currentUser) return;
    
    const [shoppingItems, pantryItems, recipes, reviews] = await Promise.all([
      firebaseApi.getShoppingItems(),
      firebaseApi.getPantryItems(),
      firebaseApi.getRecipes(),
      firebaseApi.getReviews()
    ]);

    const deletePromises = [
      ...shoppingItems.map(item => firebaseApi.deleteShoppingItem(item.id)),
      ...pantryItems.map(item => firebaseApi.deletePantryItem(item.id)),
      ...recipes.map(recipe => firebaseApi.deleteRecipe(recipe.id)),
      ...reviews.map(review => firebaseApi.deleteReview(review.id))
    ];

    await Promise.all(deletePromises);
  }
};
