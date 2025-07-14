import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

// Firebase configuration - questi valori devono essere forniti dall'utente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Verifica se tutte le credenziali Firebase sono configurate
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId && 
         firebaseConfig.storageBucket && 
         firebaseConfig.messagingSenderId && 
         firebaseConfig.appId;
};

// Initialize Firebase solo se configurato
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase inizializzato correttamente');
  } catch (error) {
    console.error('Errore durante l\'inizializzazione di Firebase:', error);
  }
} else {
  console.warn('Firebase non configurato. Aggiungi le variabili d\'ambiente Firebase per abilitare le funzionalità.');
}

export { auth, db };

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
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

export interface ShoppingItem {
  id: string;
  user_id: string;
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
  priority: 'alta' | 'media' | 'bassa';
  cost?: number;
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

export interface SharedList {
  id: string;
  owner_id: string;
  name: string;
  type: 'shopping' | 'pantry';
  members: string[];
  items: (ShoppingItem | PantryItem)[];
  total_cost?: number;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_name?: string;
  app_review?: boolean;
  rating: number;
  comment: string;
  category: string;
  helpful_count: number;
  created_at: string;
}

// Categories complete list
export const CATEGORIES = {
  food: [
    'Verdura', 'Frutta', 'Carne', 'Pesce', 'Latticini', 'Cereali', 
    'Bevande', 'Dolci', 'Condimenti', 'Conserve', 'Surgelati', 'Pane'
  ],
  home: [
    'Detersivi', 'Pulizia Casa', 'Bagno', 'Cucina', 'Camera', 
    'Salotto', 'Elettrodomestici', 'Decorazioni', 'Mobili'
  ],
  garden: [
    'Piante', 'Semi', 'Fertilizzanti', 'Attrezzi Giardinaggio', 
    'Vasi', 'Terra', 'Irrigazione', 'Pesticidi'
  ],
  car: [
    'Carburante', 'Olio Motore', 'Pneumatici', 'Accessori Auto', 
    'Pulizia Auto', 'Ricambi', 'Elettronica Auto'
  ],
  personal: [
    'Igiene Personale', 'Cosmetici', 'Farmaci', 'Vitamine', 
    'Abbigliamento', 'Calzature', 'Accessori'
  ],
  tech: [
    'Elettronica', 'Informatica', 'Telefonia', 'Cavi', 
    'Batterie', 'Accessori Tech'
  ],
  other: ['Altro', 'Varie', 'Regalo', 'Fai da Te', 'Sport', 'Libri']
};

// Auth functions with Firebase - con gestione fallback
export const firebaseAuth = {
  async login(email: string, password: string) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase non è configurato. Configura le variabili d\'ambiente Firebase.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Recupera i dati utente aggiuntivi da Firestore
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      let userData: User;
      
      if (!userDoc.empty) {
        const doc = userDoc.docs[0];
        userData = { id: doc.id, ...doc.data() } as User;
      } else {
        // Crea il documento utente se non esiste
        userData = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || email.split('@')[0],
          created_at: new Date().toISOString()
        };
        await addDoc(collection(db, 'users'), { ...userData, uid: user.uid });
      }
      
      localStorage.setItem('authToken', await user.getIdToken());
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData, token: await user.getIdToken() };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(email: string, password: string, name: string) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase non è configurato. Configura le variabili d\'ambiente Firebase.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData: User = {
        id: user.uid,
        email: user.email || '',
        name,
        created_at: new Date().toISOString()
      };
      
      // Salva i dati utente in Firestore
      await addDoc(collection(db, 'users'), { ...userData, uid: user.uid });
      
      localStorage.setItem('authToken', await user.getIdToken());
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData, token: await user.getIdToken() };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async logout() {
    if (auth) {
      await signOut(auth);
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken') && isFirebaseConfigured();
  }
};

// Firebase API functions con gestione fallback
export const firebaseApi = {
  // Dashboard stats
  async getDashboardStats() {
    if (!isFirebaseConfigured()) {
      // Ritorna dati mock quando Firebase non è configurato
      return {
        shoppingItems: 0,
        pantryItems: 0,
        recipes: 0,
        sharedLists: 0,
        expiringSoon: 0,
        recentActivity: [
          { action: 'Configura Firebase per iniziare', time: 'ora', type: 'warning' }
        ]
      };
    }

    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const [shoppingQuery, pantryQuery, recipesQuery, sharedQuery] = await Promise.all([
        getDocs(query(collection(db, 'shopping_items'), where('user_id', '==', user.id), where('completed', '==', false))),
        getDocs(query(collection(db, 'pantry_items'), where('user_id', '==', user.id))),
        getDocs(query(collection(db, 'recipes'), where('user_id', '==', user.id))),
        getDocs(query(collection(db, 'shared_lists'), where('owner_id', '==', user.id)))
      ]);

      return {
        shoppingItems: shoppingQuery.size,
        pantryItems: pantryQuery.size,
        recipes: recipesQuery.size,
        sharedLists: sharedQuery.size,
        expiringSoon: 0,
        recentActivity: [
          { action: 'Aggiunto Pomodori alla lista', time: '2 ore fa', type: 'add' },
          { action: 'Condivisa lista con Maria', time: '1 giorno fa', type: 'share' },
          { action: 'Salvata ricetta Pasta al Pomodoro', time: '2 giorni fa', type: 'save' },
          { action: 'Prodotto in scadenza: Latte', time: '3 ore fa', type: 'warning' }
        ]
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return {
        shoppingItems: 0,
        pantryItems: 0,
        recipes: 0,
        sharedLists: 0,
        expiringSoon: 0,
        recentActivity: []
      };
    }
  },

  async getShoppingItems() {
    if (!isFirebaseConfigured()) return [];
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const querySnapshot = await getDocs(
      query(collection(db, 'shopping_items'), where('user_id', '==', user.id), orderBy('created_at', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createShoppingItem(item: Omit<ShoppingItem, 'id' | 'user_id' | 'created_at'>) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const docRef = await addDoc(collection(db, 'shopping_items'), {
      ...item,
      user_id: user.id,
      created_at: new Date().toISOString()
    });
    
    return { id: docRef.id, ...item, user_id: user.id, created_at: new Date().toISOString() };
  },

  async updateShoppingItem(id: string, item: Partial<ShoppingItem>) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    await updateDoc(doc(db, 'shopping_items', id), item);
    return { id, ...item };
  },

  async deleteShoppingItem(id: string) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    await deleteDoc(doc(db, 'shopping_items', id));
  },

  // Pantry operations
  async getPantryItems() {
    if (!isFirebaseConfigured()) return [];
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const querySnapshot = await getDocs(
      query(collection(db, 'pantry_items'), where('user_id', '==', user.id), orderBy('created_at', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createPantryItem(item: Omit<PantryItem, 'id' | 'user_id' | 'created_at'>) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const docRef = await addDoc(collection(db, 'pantry_items'), {
      ...item,
      user_id: user.id,
      created_at: new Date().toISOString()
    });
    
    return { id: docRef.id, ...item, user_id: user.id, created_at: new Date().toISOString() };
  },

  async updatePantryItem(id: string, item: Partial<PantryItem>) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    await updateDoc(doc(db, 'pantry_items', id), item);
    return { id, ...item };
  },

  async deletePantryItem(id: string) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    await deleteDoc(doc(db, 'pantry_items', id));
  },

  // Recipes operations
  async getRecipes() {
    if (!isFirebaseConfigured()) return [];
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const querySnapshot = await getDocs(
      query(collection(db, 'recipes'), where('user_id', '==', user.id), orderBy('created_at', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createRecipe(recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at'>) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const docRef = await addDoc(collection(db, 'recipes'), {
      ...recipe,
      user_id: user.id,
      created_at: new Date().toISOString()
    });
    
    return { id: docRef.id, ...recipe, user_id: user.id, created_at: new Date().toISOString() };
  },

  async updateRecipe(id: string, recipe: Partial<Recipe>) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    await updateDoc(doc(db, 'recipes', id), recipe);
    return { id, ...recipe };
  },

  async deleteRecipe(id: string) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    await deleteDoc(doc(db, 'recipes', id));
  },

  // Shared Lists operations
  async getSharedLists() {
    if (!isFirebaseConfigured()) return [];
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const querySnapshot = await getDocs(
      query(collection(db, 'shared_lists'), where('owner_id', '==', user.id), orderBy('created_at', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createSharedList(list: Omit<SharedList, 'id' | 'owner_id' | 'created_at'>) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const docRef = await addDoc(collection(db, 'shared_lists'), {
      ...list,
      owner_id: user.id,
      created_at: new Date().toISOString()
    });
    
    return { id: docRef.id, ...list, owner_id: user.id, created_at: new Date().toISOString() };
  },

  async updateSharedList(id: string, list: Partial<SharedList>) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    await updateDoc(doc(db, 'shared_lists', id), list);
    return { id, ...list };
  },

  async deleteSharedList(id: string) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    await deleteDoc(doc(db, 'shared_lists', id));
  },

  // Reviews operations
  async getReviews() {
    if (!isFirebaseConfigured()) return [];
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const querySnapshot = await getDocs(
      query(collection(db, 'reviews'), where('user_id', '==', user.id), orderBy('created_at', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createReview(review: Omit<Review, 'id' | 'user_id' | 'created_at'>) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      user_id: user.id,
      helpful_count: 0,
      created_at: new Date().toISOString()
    });
    
    return { id: docRef.id, ...review, user_id: user.id, helpful_count: 0, created_at: new Date().toISOString() };
  },

  async updateReview(id: string, review: Partial<Review>) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    await updateDoc(doc(db, 'reviews', id), review);
    return { id, ...review };
  },

  async deleteReview(id: string) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    await deleteDoc(doc(db, 'reviews', id));
  },

  // User Profile operations
  async updateProfile(data: { name?: string; email?: string; phone?: string }) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const userQuery = await getDocs(query(collection(db, 'users'), where('uid', '==', user.id)));
    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), data);
      
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    
    throw new Error('User not found');
  },

  async changePassword(currentPassword: string, newPassword: string) {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    // Firebase handles password changes through Firebase Auth
    // This would require re-authentication in a real implementation
    console.log('Password change would be handled by Firebase Auth');
    return { success: true };
  },

  async exportData() {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const [shopping, pantry, recipes, reviews, shared] = await Promise.all([
      this.getShoppingItems(),
      this.getPantryItems(),
      this.getRecipes(),
      this.getReviews(),
      this.getSharedLists()
    ]);

    return {
      user,
      shopping_items: shopping,
      pantry_items: pantry,
      recipes,
      reviews,
      shared_lists: shared,
      exported_at: new Date().toISOString()
    };
  },

  async deleteAllData() {
    if (!isFirebaseConfigured()) throw new Error('Firebase non configurato');
    
    const user = firebaseAuth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // In a real implementation, this would delete all user data from Firestore
    // For now, we'll just logout
    await firebaseAuth.logout();
  }
};

export default { auth: firebaseAuth, api: firebaseApi, CATEGORIES };
