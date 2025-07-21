import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, updateProfile } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, getDoc } from 'firebase/firestore';

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
  const hasConfig = !!(firebaseConfig.apiKey && 
                      firebaseConfig.authDomain && 
                      firebaseConfig.projectId);
  
  if (!hasConfig) {
    console.warn('Firebase config missing:', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasAuthDomain: !!firebaseConfig.authDomain,
      hasProjectId: !!firebaseConfig.projectId
    });
  }
  
  return hasConfig;
};

let app: any = null;
let auth: any = null;
let db: any = null;

// Inizializza Firebase
try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase inizializzato correttamente');
  } else {
    console.warn('Firebase non configurato - usando modalità fallback');
  }
} catch (error) {
  console.error('Errore inizializzazione Firebase:', error);
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

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  avatar?: string;
  created_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  member_id: string;
  date: string;
  meal_type: 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack' | 'dinner';
  recipes: string[];
  custom_meal: {
    name: string;
    description: string;
    ingredients: Array<{
      name: string;
      quantity: string;
      unit: string;
    }>;
  };
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_name?: string;
  product_name?: string;
  app_review: boolean;
  rating: number;
  comment: string;
  category: string;
  helpful_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  review_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface SharedList {
  id: string;
  owner_id: string;
  name: string;
  type: 'shopping' | 'pantry';
  members: string[];
  items: SharedListItem[];
  total_cost: number;
  created_at: string;
  last_modified_by?: string;
  last_modified_at?: string;
  chat_messages?: ChatMessage[];
}

export interface SharedListItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  priority?: 'alta' | 'media' | 'bassa';
  cost: number;
  completed: boolean;
  created_by: string;
  created_at: string;
  last_modified_by: string;
  last_modified_at: string;
}

export interface ChatMessage {
  id: string;
  list_id: string;
  user_email: string;
  user_name: string;
  message: string;
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
  auth,
  isConfigured: () => isFirebaseConfigured() && !!auth,
  
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
    if (!auth) {
      console.error('Firebase auth non configurato');
      throw new Error('Firebase non configurato');
    }
    
    try {
      console.log('Tentativo login per:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', result.user.uid);
      return result;
    } catch (error: any) {
      console.error('Errore login:', error.code, error.message);
      throw error;
    }
  },

  register: async (email: string, password: string, name?: string) => {
    if (!auth) {
      console.error('Firebase auth non configurato');
      throw new Error('Firebase non configurato');
    }
    
    try {
      console.log('Tentativo registrazione per:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Imposta il nome nel profilo se fornito
      if (name && result.user) {
        await updateProfile(result.user, {
          displayName: name
        });
        console.log('Nome utente aggiornato:', name);
      }
      
      console.log('Registrazione successful:', result.user.uid);
      return result;
    } catch (error: any) {
      console.error('Errore registrazione:', error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email già in uso');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password troppo debole');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email non valida');
      }
      throw error;
    }
  },

  logout: async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      console.log('Logout successful');
    } catch (error) {
      console.error('Errore logout:', error);
    }
  }
};

// API functions
export const firebaseApi = {
  // Shopping List
  getShoppingItems: async (): Promise<ShoppingItem[]> => {
    if (!db || !auth?.currentUser) return [];
    try {
      console.log('Recupero shopping items per utente:', auth.currentUser.uid);
      const q = query(
        collection(db, 'shopping_items'),
        where('user_id', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      console.log('Shopping items trovati:', snapshot.docs.length);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingItem));
    } catch (error) {
      console.error('Errore recupero shopping items:', error);
      return [];
    }
  },

  createShoppingItem: async (data: Omit<ShoppingItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    return await addDoc(collection(db, 'shopping_items'), {
      ...data,
      user_id: auth.currentUser.uid,
      created_at: new Date().toISOString()
    });
  },

  addIngredientsToShoppingList: async (ingredients: string[]) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    const promises = ingredients.map(ingredient => 
      addDoc(collection(db, 'shopping_items'), {
        name: ingredient,
        quantity: '1',
        category: 'Altro',
        priority: 'media' as const,
        cost: 0,
        completed: false,
        user_id: auth.currentUser.uid,
        created_at: new Date().toISOString()
      })
    );
    return await Promise.all(promises);
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
    try {
      console.log('Recupero pantry items per utente:', auth.currentUser.uid);
      const q = query(
        collection(db, 'pantry_items'),
        where('user_id', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      console.log('Pantry items trovati:', snapshot.docs.length);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
    } catch (error) {
      console.error('Errore recupero pantry items:', error);
      return [];
    }
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
    try {
      console.log('Recupero ricette per utente:', auth.currentUser.uid);
      const q = query(
        collection(db, 'recipes'),
        where('user_id', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      console.log('Ricette trovate:', snapshot.docs.length);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
    } catch (error) {
      console.error('Errore recupero ricette:', error);
      return [];
    }
  },

  createRecipe: async (data: Omit<Recipe, 'id' | 'user_id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    return await addDoc(collection(db, 'recipes'), {
      ...data,
      user_id: auth.currentUser.uid,
      created_at: new Date().toISOString()
    });
  },

  updateRecipe: async (id: string, data: Partial<Recipe>) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'recipes', id);
    return await updateDoc(docRef, data);
  },

  deleteRecipe: async (id: string) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'recipes', id);
    return await deleteDoc(docRef);
  },

  // Family Members
  getFamilyMembers: async (): Promise<FamilyMember[]> => {
    if (!db || !auth?.currentUser) return [];
    try {
      console.log('Recupero family members per utente:', auth.currentUser.uid);
      const q = query(
        collection(db, 'family_members'),
        where('user_id', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      console.log('Family members trovati:', snapshot.docs.length);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FamilyMember));
    } catch (error) {
      console.error('Errore recupero family members:', error);
      return [];
    }
  },

  createFamilyMember: async (data: Omit<FamilyMember, 'id' | 'user_id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    return await addDoc(collection(db, 'family_members'), {
      ...data,
      user_id: auth.currentUser.uid,
      created_at: new Date().toISOString()
    });
  },

  deleteFamilyMember: async (id: string) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'family_members', id);
    // Prima elimina tutti i piani alimentari di questo membro
    const mealPlansQuery = query(
      collection(db, 'meal_plans'),
      where('member_id', '==', id)
    );
    const mealPlansSnapshot = await getDocs(mealPlansQuery);
    const deletePromises = mealPlansSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    // Poi elimina il membro
    return await deleteDoc(docRef);
  },

  // Meal Plans
  getMealPlans: async (date?: string): Promise<MealPlan[]> => {
    if (!db || !auth?.currentUser) return [];
    let q = query(
      collection(db, 'meal_plans'),
      where('user_id', '==', auth.currentUser.uid),
      orderBy('created_at', 'desc')
    );
    
    if (date) {
      q = query(
        collection(db, 'meal_plans'),
        where('user_id', '==', auth.currentUser.uid),
        where('date', '==', date),
        orderBy('created_at', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealPlan));
  },

  createMealPlan: async (data: Omit<MealPlan, 'id' | 'user_id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    return await addDoc(collection(db, 'meal_plans'), {
      ...data,
      user_id: auth.currentUser.uid,
      created_at: new Date().toISOString()
    });
  },

  updateMealPlan: async (id: string, data: Partial<MealPlan>) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'meal_plans', id);
    return await updateDoc(docRef, data);
  },

  deleteMealPlan: async (id: string) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'meal_plans', id);
    return await deleteDoc(docRef);
  },

  // Reviews
  getReviews: async (): Promise<Review[]> => {
    if (!db) return [];
    try {
      console.log('Recupero tutte le recensioni');
      // Le recensioni sono pubbliche - visibili a tutti
      const q = query(collection(db, 'reviews'));
      const snapshot = await getDocs(q);
      console.log('Recensioni trovate:', snapshot.docs.length);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (error) {
      console.error('Errore recupero recensioni:', error);
      return [];
    }
  },

  // Ottieni solo le recensioni dell'utente corrente (per gestione personale)
  getUserReviews: async (): Promise<Review[]> => {
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
    const currentUser = firebaseAuth.getCurrentUser();
    return await addDoc(collection(db, 'reviews'), {
      ...data,
      user_id: auth.currentUser.uid,
      user_name: currentUser?.name || 'Utente',
      helpful_count: 0,
      created_at: new Date().toISOString()
    });
  },

  deleteReview: async (id: string) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'reviews', id);
    return await deleteDoc(docRef);
  },

  // Comments for Reviews
  getComments: async (reviewId: string): Promise<Comment[]> => {
    if (!db) return [];
    try {
      console.log('Recupero commenti per recensione:', reviewId);
      const q = query(
        collection(db, 'comments'),
        where('review_id', '==', reviewId)
      );
      const snapshot = await getDocs(q);
      console.log('Commenti trovati:', snapshot.docs.length);
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      // Ordina i commenti per data di creazione lato client
      return comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } catch (error) {
      console.error('Errore recupero commenti:', error);
      return [];
    }
  },

  createComment: async (data: Omit<Comment, 'id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    return await addDoc(collection(db, 'comments'), {
      ...data,
      created_at: new Date().toISOString()
    });
  },

  deleteComment: async (id: string) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'comments', id);
    return await deleteDoc(docRef);
  },

  // Update review helpful count
  updateReviewHelpfulCount: async (reviewId: string, increment: boolean) => {
    if (!db) throw new Error('Database non disponibile');
    const docRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(docRef);
    if (reviewDoc.exists()) {
      const currentCount = reviewDoc.data().helpful_count || 0;
      const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
      return await updateDoc(docRef, { helpful_count: newCount });
    }
  },

  // User votes tracking
  getUserVote: async (reviewId: string): Promise<boolean> => {
    if (!db || !auth?.currentUser) return false;
    try {
      const q = query(
        collection(db, 'user_votes'),
        where('user_id', '==', auth.currentUser.uid),
        where('review_id', '==', reviewId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Errore controllo voto utente:', error);
      return false;
    }
  },

  toggleUserVote: async (reviewId: string): Promise<boolean> => {
    if (!db || !auth?.currentUser) throw new Error('Non autenticato');
    
    const q = query(
      collection(db, 'user_votes'),
      where('user_id', '==', auth.currentUser.uid),
      where('review_id', '==', reviewId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Aggiungi voto
      await addDoc(collection(db, 'user_votes'), {
        user_id: auth.currentUser.uid,
        review_id: reviewId,
        created_at: new Date().toISOString()
      });
      await firebaseApi.updateReviewHelpfulCount(reviewId, true);
      return true;
    } else {
      // Rimuovi voto
      const voteDoc = snapshot.docs[0];
      await deleteDoc(voteDoc.ref);
      await firebaseApi.updateReviewHelpfulCount(reviewId, false);
      return false;
    }
  },

  // Shared Lists
  getSharedLists: async (): Promise<SharedList[]> => {
    if (!db || !auth?.currentUser) return [];
    try {
      console.log('Recupero liste condivise per utente:', auth.currentUser.email);
      const q = query(
        collection(db, 'shared_lists'),
        where('members', 'array-contains', auth.currentUser.email)
      );
      const snapshot = await getDocs(q);
      console.log('Liste condivise trovate:', snapshot.docs.length);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedList));
    } catch (error) {
      console.error('Errore recupero liste condivise:', error);
      return [];
    }
  },

  // Notifica Push/POST per richieste
  sendListInviteNotification: async (recipientEmail: string, listName: string, requesterName: string): Promise<void> => {
    try {
      // Simula una notifica push/POST (in produzione useresti un servizio come Firebase Cloud Messaging)
      const notificationData = {
        title: `📋 Nuovo invito per lista condivisa`,
        body: `${requesterName} ti ha invitato a collaborare sulla lista "${listName}"`,
        data: {
          type: 'list_invite',
          listName,
          requesterName,
          timestamp: new Date().toISOString()
        }
      };
      
      // POST notification to user's device (mock implementation)
      console.log('📬 Notifica inviata:', notificationData);
      
      // In un'app reale, qui faresti una chiamata API al tuo backend
      // che invia la notifica push al dispositivo dell'utente
      
      return Promise.resolve();
    } catch (error) {
      console.error('Errore invio notifica:', error);
    }
  },

  createSharedList: async (listData: Omit<SharedList, 'id' | 'created_at'>) => {
    if (!db || !auth?.currentUser) {
      throw new Error('Non autenticato');
    }

    const newList = {
      ...listData,
      owner_id: auth.currentUser.uid,
      created_at: new Date().toISOString(),
      last_modified_by: auth.currentUser.email || auth.currentUser.uid,
      members: [auth.currentUser.email], // Solo il creatore inizialmente
      last_modified_at: new Date().toISOString(),
      chat_messages: []
    };

    const docRef = await addDoc(collection(db, 'shared_lists'), newList);
    
    // Invia richieste POST e notifiche a tutti i membri
    for (const memberEmail of listData.members) {
      if (memberEmail && memberEmail !== auth.currentUser.email) {
        // Crea richiesta nel database
        await addDoc(collection(db, 'list_requests'), {
          list_id: docRef.id,
          list_name: listData.name,
          requester_email: auth.currentUser.email,
          requester_name: auth.currentUser.displayName || auth.currentUser.email,
          recipient_email: memberEmail,
          status: 'pending',
          created_at: new Date().toISOString(),
          type: listData.type
        });
        
        // Invia notifica POST
        await firebaseApi.sendListInviteNotification(
          memberEmail, 
          listData.name, 
          auth.currentUser.displayName || auth.currentUser.email || 'Utente'
        );
      }
    }

    return { id: docRef.id, ...newList };
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
      recentActivity: [],
      activeCost: 0,
      totalSpent: 0,
      averageSpent: 0,
      completedItems: 0,
      pendingRecipeRequests: 0
    };

    const [shoppingItems, pantryItems, recipes, sharedLists, pendingRecipes] = await Promise.all([
      firebaseApi.getShoppingItems(),
      firebaseApi.getPantryItems(),
      firebaseApi.getRecipes(),
      firebaseApi.getSharedLists(),
      getPendingSharedRecipes()
    ]);

    const today = new Date();
    const expiringSoon = pantryItems.filter(item => {
      const expiryDate = new Date(item.expiry_date);
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;

    // Calcoli per i costi della spesa
    const activeItems = shoppingItems.filter(item => !item.completed);
    const completedItems = shoppingItems.filter(item => item.completed);
    const activeCost = activeItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const totalSpent = completedItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const averageSpent = completedItems.length > 0 ? totalSpent / completedItems.length : 0;

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
      recentActivity,
      activeCost,
      totalSpent,
      averageSpent,
      completedItems: completedItems.length,
      pendingRecipeRequests: pendingRecipes.length
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
      firebaseApi.getUserReviews()
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
      firebaseApi.getUserReviews()
    ]);

    const deletePromises = [
      ...shoppingItems.map(item => firebaseApi.deleteShoppingItem(item.id)),
      ...pantryItems.map(item => firebaseApi.deletePantryItem(item.id)),
      ...recipes.map(recipe => firebaseApi.deleteRecipe(recipe.id)),
      ...reviews.map(review => firebaseApi.deleteReview(review.id))
    ];

    await Promise.all(deletePromises);
  },

  // Shared List Detail functions
  getSharedList: async (id: string): Promise<SharedList | null> => {
    if (!db) return null;
    try {
      const docRef = doc(db, 'shared_lists', id);
      const docSnap = await getDocs(query(collection(db, 'shared_lists'), where('__name__', '==', id)));
      if (!docSnap.empty) {
        return { id: docSnap.docs[0].id, ...docSnap.docs[0].data() } as SharedList;
      }
      return null;
    } catch (error) {
      console.error('Error fetching shared list:', error);
      return null;
    }
  },

  updateSharedListItem: async (listId: string, itemId: string, updates: any) => {
    if (!db) throw new Error('Database non disponibile');
    try {
      const listRef = doc(db, 'shared_lists', listId);
      // In una implementazione reale, aggiorneremmo l'array degli items
      // Per ora simuliamo l'aggiornamento
      return Promise.resolve();
    } catch (error) {
      console.error('Error updating shared list item:', error);
      throw error;
    }
  },

  addSharedListItem: async (listId: string, itemData: any) => {
    if (!db) throw new Error('Database non disponibile');
    try {
      const listRef = doc(db, 'shared_lists', listId);
      // In una implementazione reale, aggiungeremmo l'item all'array degli items
      // Per ora simuliamo l'aggiunta
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding shared list item:', error);
      throw error;
    }
  },

  deleteSharedListItem: async (listId: string, itemId: string) => {
    if (!db) throw new Error('Database non disponibile');
    try {
      const listRef = doc(db, 'shared_lists', listId);
      // In una implementazione reale, rimuoveremmo l'item dall'array degli items
      // Per ora simuliamo la rimozione
      return Promise.resolve();
    } catch (error) {
      console.error('Error deleting shared list item:', error);
      throw error;
    }
  },

  // Funzione per ottenere utenti registrati con nome e cognome
  getRegisteredUsers: async (): Promise<{id: string, name: string, surname: string}[]> => {
    // In una implementazione reale, questo recupererebbe la lista degli utenti registrati dal database
    // Per ora simuliamo alcuni utenti di esempio con nome e cognome
    return [
      {id: 'user1', name: 'Marco', surname: 'Rossi'},
      {id: 'user2', name: 'Giulia', surname: 'Bianchi'}, 
      {id: 'user3', name: 'Alessandro', surname: 'Verdi'},
      {id: 'user4', name: 'Francesca', surname: 'Neri'},
      {id: 'user5', name: 'Luca', surname: 'Ferrari'}
    ];
  },

  // Funzione per condividere ricetta con utente registrato
  shareRecipeWithUser: async (recipeData: Recipe, userId: string, userName: string) => {
    if (!db) throw new Error('Database non disponibile');
    try {
      // In una implementazione reale, questo invierebbe una notifica all'utente
      // e aggiungerebbe la ricetta alle sue ricette condivise
      console.log(`Condividendo ricetta "${recipeData.name}" con ${userName} (ID: ${userId})`);
      return Promise.resolve();
    } catch (error) {
      console.error('Error sharing recipe with user:', error);
      throw error;
    }
  },

  // List sharing functions
  getPendingListRequests: async () => {
    return getPendingListRequests();
  },

  shareListWithUser: async (listData: any, userEmail: string) => {
    return shareListWithUser(listData, userEmail);
  },

  respondToListRequest: async (requestId: string, accept: boolean) => {
    return respondToListRequest(requestId, accept);
  },

  // Funzioni per la collaborazione in tempo reale
  addItemToSharedList: async (listId: string, item: Omit<SharedListItem, 'id' | 'created_by' | 'created_at' | 'last_modified_by' | 'last_modified_at'>) => {
    return addItemToSharedList(listId, item);
  },

  deleteSharedListForUser: async (listId: string) => {
    return deleteSharedListForUser(listId);
  },

  addChatMessage: async (listId: string, message: string) => {
    return addChatMessage(listId, message);
  },

  getSharedListById: async (listId: string) => {
    return getSharedListById(listId);
  },
};

// Funzioni aggiuntive per ricerca utenti e condivisione ricette
export const searchUsers = async (email: string) => {
  if (!db) {
    // Simulazione ricerca utenti quando Firebase non è configurato - ora per email
    const allUsers = [
      { id: 'user1', firstName: 'Marco', lastName: 'Rossi', email: 'marco.rossi@email.com' },
      { id: 'user2', firstName: 'Giulia', lastName: 'Bianchi', email: 'giulia.bianchi@email.com' },
      { id: 'user3', firstName: 'Alessandro', lastName: 'Verdi', email: 'alessandro.verdi@email.com' },
      { id: 'user4', firstName: 'Francesca', lastName: 'Neri', email: 'francesca.neri@email.com' },
      { id: 'user5', firstName: 'Luca', lastName: 'Ferrari', email: 'luca.ferrari@email.com' }
    ];
    
    return allUsers.filter(user =>
      user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  try {
    // Cerca tra gli utenti registrati nel database
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      firstName: doc.data().firstName || doc.data().name?.split(' ')[0] || 'Utente',
      lastName: doc.data().lastName || doc.data().name?.split(' ')[1] || '',
      email: doc.data().email || ''
    }));
    
    return users.filter(user => 
      user.email && user.email.toLowerCase() === email.toLowerCase()
    );
  } catch (error) {
    console.error('Errore nella ricerca utenti:', error);
    return [];
  }
};

export const shareRecipeWithUser = async (recipeId: string, targetUserEmail: string, recipeName: string) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const shareData = {
    recipeId,
    recipeName,
    fromUserId: auth.currentUser.uid,
    fromUserEmail: auth.currentUser.email,
    toUserEmail: targetUserEmail,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  if (db) {
    await addDoc(collection(db, 'recipe_requests'), shareData);
  } else {
    // Simulazione per Firebase non configurato
    console.log('Ricetta condivisa:', shareData);
  }
};

// Funzione per accettare/rifiutare ricette condivise
export const respondToSharedRecipe = async (shareId: string, accept: boolean) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  if (db) {
    const shareRef = doc(db, 'recipe_requests', shareId);
    
    if (accept) {
      // Prima ottieni i dati della richiesta per copiare la ricetta
      const shareDoc = await getDoc(shareRef);
      if (shareDoc.exists()) {
        const shareData = shareDoc.data();
        
        // Ottieni la ricetta originale
        const recipeRef = doc(db, 'recipes', shareData.recipeId);
        const recipeDoc = await getDoc(recipeRef);
        
        if (recipeDoc.exists()) {
          const recipeData = recipeDoc.data();
          console.log('Salvando ricetta accettata:', recipeData.name);
          
          // Crea una copia della ricetta per l'utente destinatario
          await firebaseApi.createRecipe({
            name: recipeData.name,
            description: recipeData.description,
            ingredients: recipeData.ingredients,
            instructions: recipeData.instructions,
            prep_time: recipeData.prep_time,
            servings: recipeData.servings,
            category: recipeData.category
          });
        }
      }
    }
    
    // Aggiorna lo status della richiesta dopo aver salvato la ricetta
    await updateDoc(shareRef, {
      status: accept ? 'accepted' : 'rejected',
      respondedAt: new Date().toISOString()
    });
  } else {
    // Simulazione per Firebase non configurato
    console.log('Risposta simulata alla ricetta condivisa:', { shareId, accept });
  }
};

// Funzione per ottenere le ricette condivise in attesa
export const getPendingSharedRecipes = async () => {
  if (!auth.currentUser) return [];
  
  if (!db) {
    // Simulazione per Firebase non configurato
    return [
      {
        id: 'req1',
        recipeId: 'default-1',
        fromUserEmail: 'marco.rossi@email.com',
        toUserEmail: auth.currentUser.email,
        recipeName: 'Carbonara Autentica',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];
  }
  
  const q = query(
    collection(db, 'recipe_requests'),
    where('toUserEmail', '==', auth.currentUser.email),
    where('status', '==', 'pending')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Lista Share Requests
export const getPendingListRequests = async () => {
  if (!db || !auth?.currentUser) {
    return [];
  }
  
  const q = query(
    collection(db, 'list_requests'),
    where('receiver_email', '==', auth.currentUser.email),
    where('status', '==', 'pending')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const shareListWithUser = async (listData: any, userEmail: string) => {
  if (!db || !auth?.currentUser) {
    throw new Error('Non autenticato');
  }

  // Crea una richiesta di condivisione
  const request = {
    list_id: listData.id,
    list_name: listData.name,
    list_type: listData.type,
    sender_email: auth.currentUser.email,
    receiver_email: userEmail,
    status: 'pending',
    created_at: new Date().toISOString(),
    list_data: listData // Salva i dati della lista per crearla quando accettata
  };

  await addDoc(collection(db, 'list_requests'), request);
};

export const respondToListRequest = async (requestId: string, accept: boolean) => {
  if (!db || !auth?.currentUser) {
    throw new Error('Non autenticato');
  }

  const requestDoc = doc(db, 'list_requests', requestId);
  const requestSnapshot = await getDoc(requestDoc);
  
  if (!requestSnapshot.exists()) {
    throw new Error('Richiesta non trovata');
  }

  const requestData = requestSnapshot.data();

  if (accept) {
    // Crea la lista condivisa nell'account dell'utente che accetta
    const newList = {
      ...requestData.list_data,
      owner_id: auth.currentUser.uid,
      created_at: new Date().toISOString(),
      shared_from: requestData.sender_email,
      last_modified_by: auth.currentUser.email,
      last_modified_at: new Date().toISOString(),
      chat_messages: []
    };
    
    delete newList.id; // Rimuove l'ID originale per crearne uno nuovo
    await addDoc(collection(db, 'shared_lists'), newList);
  }

  // Aggiorna lo status della richiesta
  await updateDoc(requestDoc, {
    status: accept ? 'accepted' : 'rejected',
    responded_at: new Date().toISOString()
  });
};

// Funzioni per la collaborazione in tempo reale delle liste
export const addItemToSharedList = async (listId: string, item: Omit<SharedListItem, 'id' | 'created_by' | 'created_at' | 'last_modified_by' | 'last_modified_at'>) => {
  if (!db || !auth?.currentUser) {
    throw new Error('Non autenticato');
  }

  const listRef = doc(db, 'shared_lists', listId);
  const listDoc = await getDoc(listRef);
  
  if (!listDoc.exists()) {
    throw new Error('Lista non trovata');
  }

  const currentUser = auth.currentUser;
  const newItem: SharedListItem = {
    ...item,
    id: Date.now().toString(),
    created_by: currentUser.email || currentUser.uid,
    created_at: new Date().toISOString(),
    last_modified_by: currentUser.email || currentUser.uid,
    last_modified_at: new Date().toISOString()
  };

  const listData = listDoc.data();
  const updatedItems = [...(listData.items || []), newItem];
  const updatedTotalCost = updatedItems.reduce((sum, item) => sum + (item.cost || 0), 0);

  await updateDoc(listRef, {
    items: updatedItems,
    total_cost: updatedTotalCost,
    last_modified_by: currentUser.email || currentUser.uid,
    last_modified_at: new Date().toISOString()
  });
};

export const updateSharedListItem = async (listId: string, itemId: string, updates: Partial<SharedListItem>) => {
  if (!db || !auth?.currentUser) {
    throw new Error('Non autenticato');
  }

  const listRef = doc(db, 'shared_lists', listId);
  const listDoc = await getDoc(listRef);
  
  if (!listDoc.exists()) {
    throw new Error('Lista non trovata');
  }

  const currentUser = auth.currentUser;
  const listData = listDoc.data();
  const updatedItems = (listData.items || []).map((item: SharedListItem) => 
    item.id === itemId 
      ? { 
          ...item, 
          ...updates,
          last_modified_by: currentUser.email || currentUser.uid,
          last_modified_at: new Date().toISOString()
        }
      : item
  );

  const updatedTotalCost = updatedItems.reduce((sum, item) => sum + (item.cost || 0), 0);

  await updateDoc(listRef, {
    items: updatedItems,
    total_cost: updatedTotalCost,
    last_modified_by: currentUser.email || currentUser.uid,
    last_modified_at: new Date().toISOString()
  });
};

export const deleteSharedListItem = async (listId: string, itemId: string) => {
  if (!db || !auth?.currentUser) {
    throw new Error('Non autenticato');
  }

  const listRef = doc(db, 'shared_lists', listId);
  const listDoc = await getDoc(listRef);
  
  if (!listDoc.exists()) {
    throw new Error('Lista non trovata');
  }

  const currentUser = auth.currentUser;
  const listData = listDoc.data();
  const updatedItems = (listData.items || []).filter((item: SharedListItem) => item.id !== itemId);
  const updatedTotalCost = updatedItems.reduce((sum, item) => sum + (item.cost || 0), 0);

  await updateDoc(listRef, {
    items: updatedItems,
    total_cost: updatedTotalCost,
    last_modified_by: currentUser.email || currentUser.uid,
    last_modified_at: new Date().toISOString()
  });
};

export const deleteSharedListForUser = async (listId: string) => {
  if (!db || !auth?.currentUser) {
    throw new Error('Non autenticato');
  }

  const listRef = doc(db, 'shared_lists', listId);
  await deleteDoc(listRef);
};

export const addChatMessage = async (listId: string, message: string) => {
  if (!db || !auth?.currentUser) {
    throw new Error('Non autenticato');
  }

  const listRef = doc(db, 'shared_lists', listId);
  const listDoc = await getDoc(listRef);
  
  if (!listDoc.exists()) {
    throw new Error('Lista non trovata');
  }

  const currentUser = auth.currentUser;
  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    list_id: listId,
    user_email: currentUser.email || currentUser.uid,
    user_name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Utente',
    message,
    created_at: new Date().toISOString()
  };

  const listData = listDoc.data();
  const updatedMessages = [...(listData.chat_messages || []), newMessage];

  await updateDoc(listRef, {
    chat_messages: updatedMessages,
    last_modified_by: currentUser.email || currentUser.uid,
    last_modified_at: new Date().toISOString()
  });
};

export const getSharedListById = async (listId: string): Promise<SharedList | null> => {
  if (!db) {
    throw new Error('Database non disponibile');
  }

  const listRef = doc(db, 'shared_lists', listId);
  const listDoc = await getDoc(listRef);
  
  if (!listDoc.exists()) {
    return null;
  }

  return { id: listDoc.id, ...listDoc.data() } as SharedList;
};
