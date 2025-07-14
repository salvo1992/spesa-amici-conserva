
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ChefHat, Search, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import RecipeCard from '@/components/RecipeCard';
import RecipeDetailsModal from '@/components/RecipeDetailsModal';

interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  prepTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  category: string;
}

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: '1',
      name: 'Pasta al Pomodoro',
      description: 'Classica pasta italiana con pomodoro fresco e basilico. Un piatto semplice ma ricco di sapore che rappresenta la tradizione culinaria italiana.',
      image: '/placeholder.svg',
      prepTime: 20,
      servings: 4,
      ingredients: ['Pasta 400g', 'Pomodori freschi 500g', 'Basilico fresco 10 foglie', 'Aglio 2 spicchi', 'Olio EVO 4 cucchiai', 'Sale q.b.', 'Pepe nero q.b.'],
      instructions: [
        'Portare a ebollizione abbondante acqua salata in una pentola capiente',
        'Nel frattempo, scaldare l\'olio in una padella e rosolare l\'aglio tritato',
        'Aggiungere i pomodori tagliati a pezzi e cuocere per 10 minuti',
        'Cuocere la pasta secondo i tempi di cottura indicati sulla confezione',
        'Scolare la pasta al dente e manteccare con il sugo',
        'Aggiungere il basilico fresco e servire immediatamente'
      ],
      category: 'Primi'
    },
    {
      id: '2',
      name: 'Insalata Mista',
      description: 'Fresca insalata con verdure di stagione, perfetta come contorno leggero e salutare per accompagnare qualsiasi secondo piatto.',
      image: '/placeholder.svg',
      prepTime: 10,
      servings: 2,
      ingredients: ['Lattuga 1 cespo', 'Pomodorini 200g', 'Carote 2 medie', 'Cetrioli 1 grande', 'Olio EVO 3 cucchiai', 'Aceto balsamico 1 cucchiaio', 'Sale q.b.'],
      instructions: [
        'Lavare accuratamente tutte le verdure sotto acqua corrente',
        'Tagliare la lattuga a strisce, i pomodorini a metà',
        'Tagliare le carote a julienne e i cetrioli a rondelle',
        'Mescolare tutte le verdure in una ciotola capiente',
        'Condire con olio, aceto balsamico e sale',
        'Mescolare delicatamente e servire subito'
      ],
      category: 'Contorni'
    }
  ]);

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    prepTime: 0,
    servings: 0,
    ingredients: '',
    instructions: '',
    category: 'Primi'
  });

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const addToShoppingList = (ingredients: string[]) => {
    console.log('Aggiungendo alla lista:', ingredients);
    toast({
      title: "Ingredienti aggiunti alla lista!",
      description: `${ingredients.length} ingredienti sono stati aggiunti alla tua lista della spesa`,
    });
  };

  const shareRecipe = (recipe: Recipe) => {
    // Simulazione condivisione
    const recipeText = `Ricetta: ${recipe.name}\n\nIngredienti:\n${recipe.ingredients.join('\n')}\n\nPreparazione:\n${recipe.instructions.join('\n')}`;
    
    if (navigator.share) {
      navigator.share({
        title: recipe.name,
        text: recipeText,
      });
    } else {
      navigator.clipboard.writeText(recipeText);
      toast({
        title: "Ricetta copiata!",
        description: "La ricetta è stata copiata negli appunti",
      });
    }
  };

  const addRecipe = () => {
    if (newRecipe.name.trim()) {
      const recipe: Recipe = {
        id: Date.now().toString(),
        name: newRecipe.name,
        description: newRecipe.description,
        image: '/placeholder.svg',
        prepTime: newRecipe.prepTime,
        servings: newRecipe.servings,
        ingredients: newRecipe.ingredients.split('\n').filter(i => i.trim()),
        instructions: newRecipe.instructions.split('\n').filter(i => i.trim()),
        category: newRecipe.category
      };
      setRecipes([...recipes, recipe]);
      setNewRecipe({
        name: '',
        description: '',
        prepTime: 0,
        servings: 0,
        ingredients: '',
        instructions: '',
        category: 'Primi'
      });
      setShowAddDialog(false);
      
      toast({
        title: "Ricetta aggiunta!",
        description: `${recipe.name} è stata salvata con successo`,
      });
    }
  };

  const handleViewDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowDetailsModal(true);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCategory || recipe.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const categories = ['Primi', 'Secondi', 'Contorni', 'Dolci', 'Antipasti'];

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header con gradiente migliorato */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-primary animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-green-600 bg-clip-text text-transparent">
              Le Mie Ricette
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Crea e gestisci le tue ricette preferite</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-green-100 text-green-700">{recipes.length} ricette</Badge>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                <Plus className="h-5 w-5 mr-2" />
                Nuova Ricetta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Aggiungi Nuova Ricetta
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome Ricetta</label>
                    <Input
                      placeholder="Es. Spaghetti alla Carbonara"
                      value={newRecipe.name}
                      onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newRecipe.category}
                      onChange={(e) => setNewRecipe({...newRecipe, category: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Descrizione</label>
                  <Textarea
                    placeholder="Descrivi brevemente la tua ricetta..."
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tempo (minuti)</label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={newRecipe.prepTime || ''}
                      onChange={(e) => setNewRecipe({...newRecipe, prepTime: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Porzioni</label>
                    <Input
                      type="number"
                      placeholder="4"
                      value={newRecipe.servings || ''}
                      onChange={(e) => setNewRecipe({...newRecipe, servings: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Ingredienti (uno per riga)</label>
                  <Textarea
                    placeholder="Pasta 400g&#10;Uova 3&#10;Pancetta 150g&#10;Parmigiano grattugiato 80g"
                    value={newRecipe.ingredients}
                    onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                    rows={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Istruzioni (una per riga)</label>
                  <Textarea
                    placeholder="Mettere a bollire l'acqua per la pasta&#10;Nel frattempo rosolare la pancetta&#10;Sbattere le uova con il parmigiano"
                    value={newRecipe.instructions}
                    onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})}
                    rows={6}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={addRecipe} className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Salva Ricetta
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Barra di ricerca e filtri */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca ricette..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[120px]"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Tutte le categorie</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ricette Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe, index) => (
          <div 
            key={recipe.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <RecipeCard
              recipe={recipe}
              onViewDetails={handleViewDetails}
              onAddToShoppingList={addToShoppingList}
              onShare={shareRecipe}
            />
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <ChefHat className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <p className="text-muted-foreground text-xl mb-2">
            {searchTerm || filterCategory ? 'Nessuna ricetta trovata' : 'Nessuna ricetta salvata'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchTerm || filterCategory ? 'Prova a modificare i filtri di ricerca' : 'Inizia aggiungendo la tua prima ricetta!'}
          </p>
        </Card>
      )}

      {/* Modal dettagli ricetta */}
      <RecipeDetailsModal
        recipe={selectedRecipe}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRecipe(null);
        }}
        onAddToShoppingList={addToShoppingList}
        onShare={shareRecipe}
      />
    </div>
  );
};

export default Recipes;
