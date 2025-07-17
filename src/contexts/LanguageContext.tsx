
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'it' | 'en' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  it: {
    // Dashboard
    dashboard: 'Dashboard',
    welcome: 'Benvenuto in Food Manager',
    quickActions: 'Azioni Rapide',
    recentActivity: 'Attività Recenti',
    
    // Navigation
    shoppingList: 'Lista Spesa',
    pantry: 'Dispensa',
    recipes: 'Ricette',
    mealPlanning: 'Piano Alimentare',
    shared: 'Condivise',
    reviews: 'Recensioni',
    settings: 'Impostazioni',
    
    // Common
    add: 'Aggiungi',
    cancel: 'Annulla',
    save: 'Salva',
    delete: 'Elimina',
    edit: 'Modifica',
    share: 'Condividi',
    view: 'Visualizza',
    
    // Recipes
    newRecipe: 'Nuova Ricetta',
    ingredients: 'Ingredienti',
    instructions: 'Istruzioni',
    prepTime: 'Tempo Preparazione',
    servings: 'Porzioni',
    
    // Settings
    darkMode: 'Modalità Scura',
    language: 'Lingua',
    notifications: 'Notifiche',
    version: 'Versione',
    lastUpdate: 'Ultimo Aggiornamento',
    cookieSettings: 'Impostazioni Cookie'
  },
  en: {
    // Dashboard
    dashboard: 'Dashboard',
    welcome: 'Welcome to Food Manager',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    
    // Navigation
    shoppingList: 'Shopping List',
    pantry: 'Pantry',
    recipes: 'Recipes',
    mealPlanning: 'Meal Planning',
    shared: 'Shared',
    reviews: 'Reviews',
    settings: 'Settings',
    
    // Common
    add: 'Add',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    share: 'Share',
    view: 'View',
    
    // Recipes
    newRecipe: 'New Recipe',
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    prepTime: 'Prep Time',
    servings: 'Servings',
    
    // Settings
    darkMode: 'Dark Mode',
    language: 'Language',
    notifications: 'Notifications',
    version: 'Version',
    lastUpdate: 'Last Update',
    cookieSettings: 'Cookie Settings'
  },
  es: {
    // Dashboard
    dashboard: 'Panel',
    welcome: 'Bienvenido a Food Manager',
    quickActions: 'Acciones Rápidas',
    recentActivity: 'Actividad Reciente',
    
    // Navigation
    shoppingList: 'Lista de Compras',
    pantry: 'Despensa',
    recipes: 'Recetas',
    mealPlanning: 'Planificación de Comidas',
    shared: 'Compartidas',
    reviews: 'Reseñas',
    settings: 'Configuración',
    
    // Common
    add: 'Añadir',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    share: 'Compartir',
    view: 'Ver',
    
    // Recipes
    newRecipe: 'Nueva Receta',
    ingredients: 'Ingredientes',
    instructions: 'Instrucciones',
    prepTime: 'Tiempo de Preparación',
    servings: 'Porciones',
    
    // Settings
    darkMode: 'Modo Oscuro',
    language: 'Idioma',
    notifications: 'Notificaciones',
    version: 'Versión',
    lastUpdate: 'Última Actualización',
    cookieSettings: 'Configuración de Cookies'
  },
  fr: {
    // Dashboard
    dashboard: 'Tableau de Bord',
    welcome: 'Bienvenue dans Food Manager',
    quickActions: 'Actions Rapides',
    recentActivity: 'Activité Récente',
    
    // Navigation
    shoppingList: 'Liste de Courses',
    pantry: 'Garde-manger',
    recipes: 'Recettes',
    mealPlanning: 'Planification des Repas',
    shared: 'Partagées',
    reviews: 'Avis',
    settings: 'Paramètres',
    
    // Common
    add: 'Ajouter',
    cancel: 'Annuler',
    save: 'Sauvegarder',
    delete: 'Supprimer',
    edit: 'Modifier',
    share: 'Partager',
    view: 'Voir',
    
    // Recipes
    newRecipe: 'Nouvelle Recette',
    ingredients: 'Ingrédients',
    instructions: 'Instructions',
    prepTime: 'Temps de Préparation',
    servings: 'Portions',
    
    // Settings
    darkMode: 'Mode Sombre',
    language: 'Langue',
    notifications: 'Notifications',
    version: 'Version',
    lastUpdate: 'Dernière Mise à Jour',
    cookieSettings: 'Paramètres des Cookies'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('it');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['it']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
