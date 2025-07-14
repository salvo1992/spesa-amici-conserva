
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
  created_at: string;
}

// Auth functions
export const auth = {
  async login(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(email: string, password: string, name: string) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      if (!response.ok) throw new Error('Registration failed');
      
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
};

// CRUD operations
export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  // Recipes
  async getRecipes() {
    return this.request('/recipes');
  },

  async createRecipe(recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at'>) {
    return this.request('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe)
    });
  },

  async updateRecipe(id: string, recipe: Partial<Recipe>) {
    return this.request(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipe)
    });
  },

  async deleteRecipe(id: string) {
    return this.request(`/recipes/${id}`, {
      method: 'DELETE'
    });
  },

  // Shopping List
  async getShoppingItems() {
    return this.request('/shopping');
  },

  async createShoppingItem(item: Omit<ShoppingItem, 'id' | 'user_id' | 'created_at'>) {
    return this.request('/shopping', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  async updateShoppingItem(id: string, item: Partial<ShoppingItem>) {
    return this.request(`/shopping/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  },

  async deleteShoppingItem(id: string) {
    return this.request(`/shopping/${id}`, {
      method: 'DELETE'
    });
  },

  // User Profile
  async updateProfile(data: { name?: string; email?: string; phone?: string }) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  async exportData() {
    return this.request('/export');
  },

  async deleteAllData() {
    return this.request('/profile', {
      method: 'DELETE'
    });
  }
};

export default { auth, api, CLOUDFLARE_CONFIG };
