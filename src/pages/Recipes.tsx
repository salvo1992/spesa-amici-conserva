
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, Users, ChefHat, ShoppingCart, Eye } from 'lucide-react';

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
      description: 'Classica pasta italiana con pomodoro fresco e basilico',
      image: '/placeholder.svg',
      prepTime: 20,
      servings: 4,
      ingredients: ['Pasta 400g', 'Pomodori 500g', 'Basilico fresco', 'Aglio 2 spicchi', 'Olio EVO'],
      instructions: ['Bollire la pasta', 'Preparare il sugo', 'Manteccare'],
      category: 'Primi'
    },
    {
      id: '2',
      name: 'Insalata Mista',
      description: 'Fresca insalata con verdure di stagione',
      image: '/placeholder.svg',
      prepTime: 10,
      servings: 2,
      ingredients: ['Lattuga', 'Pomodorini', 'Carote', 'Cetrioli', 'Olio EVO'],
      instructions: ['Lavare le verdure', 'Tagliare', 'Condire'],
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

  const addToShoppingList = (ingredients: string[]) => {
    // Questa funzionalità sarà implementata quando integreremo con lo stato globale
    console.log('Aggiungendo alla lista:', ingredients);
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
    }
  };

  const categories = ['Primi', 'Secondi', 'Contorni', 'Dolci', 'Antipasti'];

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      {/* Header con gradiente */}
      <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-lg border-l-4 border-primary">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Le Mie Ricette
          </h1>
          <p className="text-muted-foreground mt-1">Crea e gestisci le tue ricette preferite</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Nuova Ricetta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Aggiungi Nuova Ricetta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Nome ricetta"
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
              />
              <Textarea
                placeholder="Descrizione"
                value={newRecipe.description}
                onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Tempo (minuti)"
                  value={newRecipe.prepTime || ''}
                  onChange={(e) => setNewRecipe({...newRecipe, prepTime: parseInt(e.target.value) || 0})}
                />
                <Input
                  type="number"
                  placeholder="Porzioni"
                  value={newRecipe.servings || ''}
                  onChange={(e) => setNewRecipe({...newRecipe, servings: parseInt(e.target.value) || 0})}
                />
              </div>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newRecipe.category}
                onChange={(e) => setNewRecipe({...newRecipe, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Textarea
                placeholder="Ingredienti (uno per riga)"
                value={newRecipe.ingredients}
                onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                rows={4}
              />
              <Textarea
                placeholder="Istruzioni (una per riga)"
                value={newRecipe.instructions}
                onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})}
                rows={4}
              />
              <Button onClick={addRecipe} className="w-full">
                Salva Ricetta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ricette Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
            <div className="h-48 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
              <ChefHat className="h-16 w-16 text-white" />
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-foreground">{recipe.name}</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {recipe.category}
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {recipe.description}
              </p>
              
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {recipe.prepTime} min
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {recipe.servings} porzioni
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  Dettagli
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => addToShoppingList(recipe.ingredients)}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Lista
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recipes.length === 0 && (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
          <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Nessuna ricetta salvata</p>
          <p className="text-sm text-muted-foreground mt-2">
            Inizia aggiungendo la tua prima ricetta!
          </p>
        </Card>
      )}
    </div>
  );
};

export default Recipes;
