
// Cloudflare configuration and API handlers
const CLOUDFLARE_CONFIG = {
  accountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '',
  apiToken: import.meta.env.VITE_CLOUDFLARE_API_TOKEN || '',
  databaseId: import.meta.env.VITE_CLOUDFLARE_D1_DATABASE_ID || '',
  baseUrl: 'https://api.cloudflare.com/client/v4'
};

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

// Auth functions with real Cloudflare integration
export const auth = {
  async login(email: string, password: string) {
    try {
      // If in development, use mock data
      if (!CLOUDFLARE_CONFIG.accountId) {
        const mockUser = { 
          id: '1', 
          email, 
          name: email.split('@')[0], 
          created_at: new Date().toISOString() 
        };
        localStorage.setItem('authToken', 'mock-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { user: mockUser, token: 'mock-token' };
      }

      const response = await fetch(`${CLOUDFLARE_CONFIG.baseUrl}/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: 'SELECT * FROM users WHERE email = ? AND password = ?',
          params: [email, password]
        })
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      if (data.result[0]?.results?.length > 0) {
        const user = data.result[0].results[0];
        const token = btoa(`${user.id}:${Date.now()}`);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token };
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(email: string, password: string, name: string) {
    try {
      // If in development, use mock data
      if (!CLOUDFLARE_CONFIG.accountId) {
        const mockUser = { 
          id: Date.now().toString(), 
          email, 
          name, 
          created_at: new Date().toISOString() 
        };
        localStorage.setItem('authToken', 'mock-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { user: mockUser, token: 'mock-token' };
      }

      const response = await fetch(`${CLOUDFLARE_CONFIG.baseUrl}/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: 'INSERT INTO users (email, password, name, created_at) VALUES (?, ?, ?, ?) RETURNING *',
          params: [email, password, name, new Date().toISOString()]
        })
      });
      
      if (!response.ok) throw new Error('Registration failed');
      
      const data = await response.json();
      const user = data.result[0].results[0];
      const token = btoa(`${user.id}:${Date.now()}`);
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
};

// Enhanced API with real database operations
export const api = {
  async request(sql: string, params: any[] = []) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');

    // If in development mode, return mock data
    if (!CLOUDFLARE_CONFIG.accountId) {
      console.log('Mock API call:', sql, params);
      return { results: [] };
    }

    const response = await fetch(`${CLOUDFLARE_CONFIG.baseUrl}/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql, params })
    });

    if (!response.ok) {
      throw new Error(`Database error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result[0];
  },

  // Dashboard stats
  async getDashboardStats() {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      if (!CLOUDFLARE_CONFIG.accountId) {
        // Mock data for development
        return {
          shoppingItems: 12,
          pantryItems: 24,
          recipes: 8,
          sharedLists: 3,
          expiringSoon: 2,
          recentActivity: [
            { action: 'Aggiunto Pomodori alla lista', time: '2 ore fa', type: 'add' },
            { action: 'Condivisa lista con Maria', time: '1 giorno fa', type: 'share' },
            { action: 'Salvata ricetta Pasta al Pomodoro', time: '2 giorni fa', type: 'save' },
            { action: 'Prodotto in scadenza: Latte', time: '3 ore fa', type: 'warning' }
          ]
        };
      }

      const [shopping, pantry, recipes, shared] = await Promise.all([
        this.request('SELECT COUNT(*) as count FROM shopping_items WHERE user_id = ? AND completed = false', [user.id]),
        this.request('SELECT COUNT(*) as count FROM pantry_items WHERE user_id = ?', [user.id]),
        this.request('SELECT COUNT(*) as count FROM recipes WHERE user_id = ?', [user.id]),
        this.request('SELECT COUNT(*) as count FROM shared_lists WHERE owner_id = ? OR members LIKE ?', [user.id, `%${user.id}%`])
      ]);

      return {
        shoppingItems: shopping.results[0]?.count || 0,
        pantryItems: pantry.results[0]?.count || 0,
        recipes: recipes.results[0]?.count || 0,
        sharedLists: shared.results[0]?.count || 0,
        expiringSoon: 0,
        recentActivity: []
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

  // Shopping List operations
  async getShoppingItems() {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const result = await this.request(
      'SELECT * FROM shopping_items WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    return result.results || [];
  },

  async createShoppingItem(item: Omit<ShoppingItem, 'id' | 'user_id' | 'created_at'>) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const result = await this.request(
      'INSERT INTO shopping_items (user_id, name, quantity, category, completed, priority, cost, purchased_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [user.id, item.name, item.quantity, item.category, item.completed, item.priority, item.cost || null, item.purchased_by || null, new Date().toISOString()]
    );
    return result.results[0];
  },

  async updateShoppingItem(id: string, item: Partial<ShoppingItem>) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const updates = Object.entries(item)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `${key} = ?`);
    
    const values = Object.values(item).filter(value => value !== undefined);
    values.push(id, user.id);

    const result = await this.request(
      `UPDATE shopping_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`,
      values
    );
    return result.results[0];
  },

  async deleteShoppingItem(id: string) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    await this.request(
      'DELETE FROM shopping_items WHERE id = ? AND user_id = ?',
      [id, user.id]
    );
  },

  // Pantry operations
  async getPantryItems() {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const result = await this.request(
      'SELECT * FROM pantry_items WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    return result.results || [];
  },

  async createPantryItem(item: Omit<PantryItem, 'id' | 'user_id' | 'created_at'>) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const result = await this.request(
      'INSERT INTO pantry_items (user_id, name, quantity, unit, category, expiry_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [user.id, item.name, item.quantity, item.unit, item.category, item.expiry_date, item.status, new Date().toISOString()]
    );
    return result.results[0];
  },

  async updatePantryItem(id: string, item: Partial<PantryItem>) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const updates = Object.entries(item)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `${key} = ?`);
    
    const values = Object.values(item).filter(value => value !== undefined);
    values.push(id, user.id);

    const result = await this.request(
      `UPDATE pantry_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`,
      values
    );
    return result.results[0];
  },

  async deletePantryItem(id: string) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    await this.request(
      'DELETE FROM pantry_items WHERE id = ? AND user_id = ?',
      [id, user.id]
    );
  },

  // Recipes operations
  async getRecipes() {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const result = await this.request(
      'SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    return result.results || [];
  },

  async createRecipe(recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at'>) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const result = await this.request(
      'INSERT INTO recipes (user_id, name, description, ingredients, instructions, prep_time, servings, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [user.id, recipe.name, recipe.description, JSON.stringify(recipe.ingredients), JSON.stringify(recipe.instructions), recipe.prep_time, recipe.servings, recipe.category, new Date().toISOString()]
    );
    return result.results[0];
  },

  async updateRecipe(id: string, recipe: Partial<Recipe>) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const updates = Object.entries(recipe)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `${key} = ?`);
    
    const values = Object.values(recipe).map(value => 
      Array.isArray(value) ? JSON.stringify(value) : value
    ).filter(value => value !== undefined);
    values.push(id, user.id);

    const result = await this.request(
      `UPDATE recipes SET ${updates.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`,
      values
    );
    return result.results[0];
  },

  async deleteRecipe(id: string) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    await this.request(
      'DELETE FROM recipes WHERE id = ? AND user_id = ?',
      [id, user.id]
    );
  },

  // Shared Lists operations
  async getSharedLists() {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const result = await this.request(
      'SELECT * FROM shared_lists WHERE owner_id = ? OR members LIKE ? ORDER BY created_at DESC',
      [user.id, `%${user.id}%`]
    );
    return result.results || [];
  },

  async createSharedList(list: Omit<SharedList, 'id' | 'owner_id' | 'created_at'>) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const result = await this.request(
      'INSERT INTO shared_lists (owner_id, name, type, members, items, total_cost, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [user.id, list.name, list.type, JSON.stringify(list.members), JSON.stringify(list.items), list.total_cost || 0, new Date().toISOString()]
    );
    return result.results[0];
  },

  async updateSharedList(id: string, list: Partial<SharedList>) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const updates = Object.entries(list)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `${key} = ?`);
    
    const values = Object.values(list).map(value => 
      Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : value
    ).filter(value => value !== undefined);
    values.push(id, user.id);

    const result = await this.request(
      `UPDATE shared_lists SET ${updates.join(', ')} WHERE id = ? AND (owner_id = ? OR members LIKE ?) RETURNING *`,
      [...values, `%${user.id}%`]
    );
    return result.results[0];
  },

  async deleteSharedList(id: string) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    await this.request(
      'DELETE FROM shared_lists WHERE id = ? AND owner_id = ?',
      [id, user.id]
    );
  },

  // Reviews operations
  async getReviews() {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const result = await this.request(
      'SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    return result.results || [];
  },

  async createReview(review: Omit<Review, 'id' | 'user_id' | 'created_at'>) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const result = await this.request(
      'INSERT INTO reviews (user_id, product_name, app_review, rating, comment, category, helpful_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [user.id, review.product_name, review.app_review || false, review.rating, review.comment, review.category, 0, new Date().toISOString()]
    );
    return result.results[0];
  },

  async updateReview(id: string, review: Partial<Review>) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const updates = Object.entries(review)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `${key} = ?`);
    
    const values = Object.values(review).filter(value => value !== undefined);
    values.push(id, user.id);

    const result = await this.request(
      `UPDATE reviews SET ${updates.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`,
      values
    );
    return result.results[0];
  },

  async deleteReview(id: string) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    await this.request(
      'DELETE FROM reviews WHERE id = ? AND user_id = ?',
      [id, user.id]
    );
  },

  // User Profile operations
  async updateProfile(data: { name?: string; email?: string; phone?: string }) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, _]) => `${key} = ?`);
    
    const values = Object.values(data).filter(value => value !== undefined && value !== '');
    values.push(user.id);

    const result = await this.request(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ? RETURNING *`,
      values
    );
    
    if (result.results[0]) {
      localStorage.setItem('user', JSON.stringify(result.results[0]));
    }
    
    return result.results[0];
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // If in development mode, just return success
    if (!CLOUDFLARE_CONFIG.accountId) {
      console.log('Mock password change for user:', user.id);
      return { success: true };
    }

    // First verify current password
    const verifyResult = await this.request(
      'SELECT id FROM users WHERE id = ? AND password = ?',
      [user.id, currentPassword]
    );

    if (!verifyResult.results || verifyResult.results.length === 0) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const result = await this.request(
      'UPDATE users SET password = ? WHERE id = ? RETURNING id',
      [newPassword, user.id]
    );

    return { success: true };
  },

  async exportData() {
    const user = auth.getCurrentUser();
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
    const user = auth.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    await Promise.all([
      this.request('DELETE FROM shopping_items WHERE user_id = ?', [user.id]),
      this.request('DELETE FROM pantry_items WHERE user_id = ?', [user.id]),
      this.request('DELETE FROM recipes WHERE user_id = ?', [user.id]),
      this.request('DELETE FROM reviews WHERE user_id = ?', [user.id]),
      this.request('DELETE FROM shared_lists WHERE owner_id = ?', [user.id]),
      this.request('DELETE FROM users WHERE id = ?', [user.id])
    ]);

    auth.logout();
  }
};

export default { auth, api, CLOUDFLARE_CONFIG, CATEGORIES };
