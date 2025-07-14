
// Mock API per simulare le chiamate backend
// In produzione, queste sarebbero gestite da Cloudflare Workers

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simuliamo un database locale con localStorage
const getStoredData = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const setStoredData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Mock delle API per sviluppo
export const mockApi = {
  async login(email: string, password: string) {
    await delay(500);
    
    // Simuliamo il login
    const users = getStoredData('users');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Credenziali non valide');
    }
    
    const token = `mock-token-${Date.now()}`;
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name }
    };
  },

  async register(email: string, password: string, name: string) {
    await delay(500);
    
    const users = getStoredData('users');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser) {
      throw new Error('Email già registrata');
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    setStoredData('users', users);
    
    const token = `mock-token-${Date.now()}`;
    return {
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name }
    };
  },

  async updateProfile(data: any) {
    await delay(300);
    
    // Simuliamo l'aggiornamento del profilo
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await delay(300);
    
    // Simuliamo il cambio password
    return { success: true };
  },

  async exportData() {
    await delay(500);
    
    // Esportiamo tutti i dati dell'utente
    return {
      recipes: getStoredData('recipes'),
      shoppingList: getStoredData('shoppingList'),
      pantry: getStoredData('pantry'),
      reviews: getStoredData('reviews'),
      profile: JSON.parse(localStorage.getItem('user') || '{}'),
      exportedAt: new Date().toISOString()
    };
  },

  async deleteAllData() {
    await delay(500);
    
    // Eliminiamo tutti i dati
    const keysToDelete = ['recipes', 'shoppingList', 'pantry', 'reviews', 'user', 'authToken'];
    keysToDelete.forEach(key => localStorage.removeItem(key));
    
    return { success: true };
  }
};

// Intercettiamo le chiamate fetch per le API mock
const originalFetch = window.fetch;
window.fetch = async (url: string | URL | Request, options?: RequestInit) => {
  const urlString = url.toString();
  
  if (urlString.includes('/api/auth/login')) {
    const body = JSON.parse(options?.body as string);
    try {
      const result = await mockApi.login(body.email, body.password);
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), { status: 401 });
    }
  }
  
  if (urlString.includes('/api/auth/register')) {
    const body = JSON.parse(options?.body as string);
    try {
      const result = await mockApi.register(body.email, body.password, body.name);
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
    }
  }
  
  if (urlString.includes('/api/profile') && options?.method === 'PUT') {
    const body = JSON.parse(options?.body as string);
    try {
      const result = await mockApi.updateProfile(body);
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
    }
  }
  
  if (urlString.includes('/api/profile/password') && options?.method === 'PUT') {
    const body = JSON.parse(options?.body as string);
    try {
      const result = await mockApi.changePassword(body.currentPassword, body.newPassword);
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
    }
  }
  
  if (urlString.includes('/api/export')) {
    try {
      const result = await mockApi.exportData();
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
  }
  
  if (urlString.includes('/api/profile') && options?.method === 'DELETE') {
    try {
      const result = await mockApi.deleteAllData();
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
  }
  
  // Per tutte le altre chiamate, usa il fetch originale
  return originalFetch(url, options);
};

export default mockApi;
