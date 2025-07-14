
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

// Check if Firebase environment variables are available
const isFirebaseConfigured = () => {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET &&
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
  );
};

let app: any = null;
let auth: any = null;
let firestore: any = null;

if (isFirebaseConfigured()) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Food categories
export const CATEGORIES = {
  food: [
    'Frutta e Verdura', 'Carne e Pesce', 'Latticini', 'Cereali e Pasta',
    'Pane e Dolci', 'Bevande', 'Condimenti', 'Surgelati', 'Conserve', 'Altro'
  ],
  home: [
    'Pulizia Casa', 'Igiene Personale', 'Articoli per Casa', 'Altro'
  ]
};

// Types
export interface ShoppingItem {
  id: string;
  user_id: string;
  name: string;
  quantity: string;
  category: string;
  priority: 'alta' | 'media' | 'bassa';
  cost?: number;
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
  total_cost?: number;
  created_at: string;
}

export interface DashboardStats {
  shoppingItems: number;
  pantryItems: number;
  recipes: number;
  sharedLists: number;
  expiringSoon: number;
  recentActivity: Array<{
    type: string;
    action: string;
    time: string;
  }>;
}

// Mock data for when Firebase is not configured
const mockShoppingItems: ShoppingItem[] = [
  {
    id: '1',
    user_id: 'demo',
    name: 'Latte',
    quantity: '1L',
    category: 'Latticini',
    priority: 'alta',
    cost: 1.50,
    completed: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'demo',
    name: 'Pane',
    quantity: '1 pagnotta',
    category: 'Pane e Dolci',
    priority: 'media',
    cost: 2.00,
    completed: true,
    purchased_by: 'Demo User',
    created_at: new Date().toISOString()
  }
];

const mockPantryItems: PantryItem[] = [
  {
    id: '1',
    user_id: 'demo',
    name: 'Pasta',
    quantity: 2,
    unit: 'confezioni',
    category: 'Cereali e Pasta',
    expiry_date: '2025-12-31',
    status: 'normale',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'demo',
    name: 'Pomodori',
    quantity: 0.5,
    unit: 'kg',
    category: 'Frutta e Verdura',
    expiry_date: '2025-01-20',
    status: 'scarso',
    created_at: new Date().toISOString()
  }
];

const mockRecipes: Recipe[] = [
  {
    id: '1',
    user_id: 'demo',
    name: 'Pasta al Pomodoro',
    description: 'Un classico della cucina italiana',
    ingredients: ['Pasta 320g', 'Pomodori pelati 400g', 'Aglio 2 spicchi', 'Basilico q.b.', 'Olio EVO q.b.'],
    instructions: ['Bollire la pasta in acqua salata', 'Soffriggere aglio in olio', 'Aggiungere pomodori e basilico', 'Mantecare con la pasta'],
    prep_time: 20,
    servings: 4,
    category: 'Primi Piatti',
    created_at: new Date().toISOString()
  }
];

const mockReviews: Review[] = [
  {
    id: '1',
    user_id: 'demo',
    product_name: 'Pasta Barilla',
    app_review: false,
    rating: 5,
    comment: 'Ottima qualità, sempre al dente',
    category: 'Cereali e Pasta',
    helpful_count: 3,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'demo',
    app_review: true,
    rating: 4,
    comment: 'App molto utile per gestire la dispensa',
    category: 'App',
    helpful_count: 1,
    created_at: new Date().toISOString()
  }
];

const mockSharedLists: SharedList[] = [
  {
    id: '1',
    owner_id: 'demo',
    name: 'Spesa Famiglia',
    type: 'shopping',
    members: ['demo@example.com', 'partner@example.com'],
    items: [],
    total_cost: 0,
    created_at: new Date().toISOString()
  }
];

// Auth helper
export const firebaseAuth = {
  isAuthenticated: () => {
    if (!auth) return true; // Return true for demo mode when Firebase is not configured
    return !!auth.currentUser;
  },
  getCurrentUser: () => {
    if (!auth) return { uid: 'demo', email: 'demo@example.com', name: 'Demo User' };
    return auth.currentUser;
  },
  login: async (email: string, password: string) => {
    if (!auth) {
      // Mock login for demo
      return { user: { uid: 'demo', email, name: 'Demo User' } };
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  },
  register: async (email: string, password: string, name: string) => {
    if (!auth) {
      // Mock register for demo
      return { user: { uid: 'demo', email, name } };
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  },
  logout: async () => {
    if (!auth) return;
    await signOut(auth);
  }
};

// API functions
export const firebaseApi = {
  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    if (!firestore) {
      return {
        shoppingItems: mockShoppingItems.length,
        pantryItems: mockPantryItems.length,
        recipes: mockRecipes.length,
        sharedLists: mockSharedLists.length,
        expiringSoon: 1,
        recentActivity: [
          { type: 'add', action: 'Aggiunto Latte alla lista spesa', time: '2 ore fa' },
          { type: 'share', action: 'Condivisa lista "Spesa Famiglia"', time: '1 giorno fa' },
          { type: 'save', action: 'Salvata ricetta "Pasta al Pomodoro"', time: '2 giorni fa' }
        ]
      };
    }
    
    try {
      // In a real implementation, you would fetch data from Firestore
      // For now, return mock data
      return {
        shoppingItems: mockShoppingItems.length,
        pantryItems: mockPantryItems.length,
        recipes: mockRecipes.length,
        sharedLists: mockSharedLists.length,
        expiringSoon: 1,
        recentActivity: [
          { type: 'add', action: 'Aggiunto Latte alla lista spesa', time: '2 ore fa' },
          { type: 'share', action: 'Condivisa lista "Spesa Famiglia"', time: '1 giorno fa' },
          { type: 'save', action: 'Salvata ricetta "Pasta al Pomodoro"', time: '2 giorni fa' }
        ]
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Profile Management
  updateProfile: async (profileData: any) => {
    if (!firestore) return;
    
    try {
      // Mock implementation
      console.log('Profile updated:', profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    if (!auth) return;
    
    try {
      // Mock implementation
      console.log('Password changed');
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Data Management
  exportData: async () => {
    const data = {
      shoppingItems: mockShoppingItems,
      pantryItems: mockPantryItems,
      recipes: mockRecipes,
      reviews: mockReviews,
      sharedLists: mockSharedLists
    };
    return data;
  },

  deleteAllData: async () => {
    if (!firestore) return;
    
    try {
      // Mock implementation
      console.log('All data deleted');
    } catch (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  },

  // Shopping Items
  getShoppingItems: async (): Promise<ShoppingItem[]> => {
    if (!firestore) return mockShoppingItems;
    
    try {
      const q = query(collection(firestore, 'shopping_items'), where('user_id', '==', auth?.currentUser?.uid || 'demo'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingItem));
    } catch (error) {
      console.error('Error fetching shopping items:', error);
      return mockShoppingItems;
    }
  },

  createShoppingItem: async (item: Omit<ShoppingItem, 'id' | 'user_id' | 'created_at'>): Promise<ShoppingItem> => {
    if (!firestore) {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        user_id: 'demo',
        created_at: new Date().toISOString(),
        ...item
      };
      return newItem;
    }
    
    const newItem = {
      ...item,
      user_id: auth?.currentUser?.uid || 'demo',
      created_at: new Date().toISOString()
    };
    
    try {
      const docRef = await addDoc(collection(firestore, 'shopping_items'), newItem);
      return { id: docRef.id, ...newItem } as ShoppingItem;
    } catch (error) {
      console.error('Error creating shopping item:', error);
      throw error;
    }
  },

  updateShoppingItem: async (id: string, data: Partial<ShoppingItem>): Promise<ShoppingItem> => {
    if (!firestore) {
      const updatedItem = mockShoppingItems.find(item => item.id === id);
      return { ...updatedItem!, ...data } as ShoppingItem;
    }
    
    try {
      await updateDoc(doc(firestore, 'shopping_items', id), data);
      return { id, ...data } as ShoppingItem;
    } catch (error) {
      console.error('Error updating shopping item:', error);
      throw error;
    }
  },

  deleteShoppingItem: async (id: string): Promise<{ id: string }> => {
    if (!firestore) return { id };
    
    try {
      await deleteDoc(doc(firestore, 'shopping_items', id));
      return { id };
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      throw error;
    }
  },

  // Pantry Items
  getPantryItems: async (): Promise<PantryItem[]> => {
    if (!firestore) return mockPantryItems;
    
    try {
      const q = query(collection(firestore, 'pantry_items'), where('user_id', '==', auth?.currentUser?.uid || 'demo'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
    } catch (error) {
      console.error('Error fetching pantry items:', error);
      return mockPantryItems;
    }
  },

  createPantryItem: async (item: Omit<PantryItem, 'id' | 'user_id' | 'created_at'>): Promise<PantryItem> => {
    if (!firestore) {
      const newItem: PantryItem = {
        id: Date.now().toString(),
        user_id: 'demo',
        created_at: new Date().toISOString(),
        ...item
      };
      return newItem;
    }
    
    const newItem = {
      ...item,
      user_id: auth?.currentUser?.uid || 'demo',
      created_at: new Date().toISOString()
    };
    
    try {
      const docRef = await addDoc(collection(firestore, 'pantry_items'), newItem);
      return { id: docRef.id, ...newItem } as PantryItem;
    } catch (error) {
      console.error('Error creating pantry item:', error);
      throw error;
    }
  },

  updatePantryItem: async (id: string, data: Partial<PantryItem>): Promise<PantryItem> => {
    if (!firestore) {
      const updatedItem = mockPantryItems.find(item => item.id === id);
      return { ...updatedItem!, ...data } as PantryItem;
    }
    
    try {
      await updateDoc(doc(firestore, 'pantry_items', id), data);
      return { id, ...data } as PantryItem;
    } catch (error) {
      console.error('Error updating pantry item:', error);
      throw error;
    }
  },

  deletePantryItem: async (id: string): Promise<{ id: string }> => {
    if (!firestore) return { id };
    
    try {
      await deleteDoc(doc(firestore, 'pantry_items', id));
      return { id };
    } catch (error) {
      console.error('Error deleting pantry item:', error);
      throw error;
    }
  },

  // Recipes
  getRecipes: async (): Promise<Recipe[]> => {
    if (!firestore) return mockRecipes;
    
    try {
      const q = query(collection(firestore, 'recipes'), where('user_id', '==', auth?.currentUser?.uid || 'demo'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return mockRecipes;
    }
  },

  createRecipe: async (recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at'>): Promise<Recipe> => {
    if (!firestore) {
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        user_id: 'demo',
        created_at: new Date().toISOString(),
        ...recipe
      };
      return newRecipe;
    }
    
    const newRecipe = {
      ...recipe,
      user_id: auth?.currentUser?.uid || 'demo',
      created_at: new Date().toISOString()
    };
    
    try {
      const docRef = await addDoc(collection(firestore, 'recipes'), newRecipe);
      return { id: docRef.id, ...newRecipe } as Recipe;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  deleteRecipe: async (id: string): Promise<{ id: string }> => {
    if (!firestore) return { id };
    
    try {
      await deleteDoc(doc(firestore, 'recipes', id));
      return { id };
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },

  // Reviews
  getReviews: async (): Promise<Review[]> => {
    if (!firestore) return mockReviews;
    
    try {
      const q = query(collection(firestore, 'reviews'), where('user_id', '==', auth?.currentUser?.uid || 'demo'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return mockReviews;
    }
  },

  createReview: async (review: Omit<Review, 'id' | 'user_id' | 'created_at' | 'helpful_count'>): Promise<Review> => {
    if (!firestore) {
      const newReview: Review = {
        id: Date.now().toString(),
        user_id: 'demo',
        helpful_count: 0,
        created_at: new Date().toISOString(),
        ...review
      };
      return newReview;
    }
    
    const newReview = {
      ...review,
      helpful_count: 0,
      user_id: auth?.currentUser?.uid || 'demo',
      created_at: new Date().toISOString()
    };
    
    try {
      const docRef = await addDoc(collection(firestore, 'reviews'), newReview);
      return { id: docRef.id, ...newReview } as Review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  deleteReview: async (id: string): Promise<{ id: string }> => {
    if (!firestore) return { id };
    
    try {
      await deleteDoc(doc(firestore, 'reviews', id));
      return { id };
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Shared Lists
  getSharedLists: async (): Promise<SharedList[]> => {
    if (!firestore) return mockSharedLists;
    
    try {
      const q = query(collection(firestore, 'shared_lists'), where('owner_id', '==', auth?.currentUser?.uid || 'demo'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedList));
    } catch (error) {
      console.error('Error fetching shared lists:', error);
      return mockSharedLists;
    }
  },

  createSharedList: async (list: Omit<SharedList, 'id' | 'owner_id' | 'created_at'>): Promise<SharedList> => {
    if (!firestore) {
      const newList: SharedList = {
        id: Date.now().toString(),
        owner_id: 'demo',
        created_at: new Date().toISOString(),
        ...list
      };
      return newList;
    }
    
    const newList = {
      ...list,
      owner_id: auth?.currentUser?.uid || 'demo',
      created_at: new Date().toISOString()
    };
    
    try {
      const docRef = await addDoc(collection(firestore, 'shared_lists'), newList);
      return { id: docRef.id, ...newList } as SharedList;
    } catch (error) {
      console.error('Error creating shared list:', error);
      throw error;
    }
  },

  deleteSharedList: async (id: string): Promise<{ id: string }> => {
    if (!firestore) return { id };
    
    try {
      await deleteDoc(doc(firestore, 'shared_lists', id));
      return { id };
    } catch (error) {
      console.error('Error deleting shared list:', error);
      throw error;
    }
  }
};

export { isFirebaseConfigured };
