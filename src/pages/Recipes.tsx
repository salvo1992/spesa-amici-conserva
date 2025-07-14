
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChefHat, Plus, Clock, Users, Edit, Trash2, Filter, Heart, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, type Recipe } from '@/lib/firebase';
import AuthForm from '@/components/AuthForm';

const recipeCategories = [
  'Primi Piatti', 'Secondi Piatti', 'Contorni', 'Antipasti', 
  'Dolci', 'Bevande', 'Salse', 'Zuppe', 'Insalate', 'Pizza'
];

const Recipes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(firebaseAuth.isAuthenticated());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prep_time: 0,
    servings: 4,
    category: ''
  });

  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: firebaseApi.getRecipes,
    enabled: isAuthenticated
  });

  const createMutation = useMutation({
    mutationFn: firebaseApi.createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setShowAddDialog(false);
      setNewRecipe({
        name: '', description: '', ingredients: [''], instructions: [''],
        prep_time: 0, servings: 4, category: ''
      });
      toast({ title: "Ricetta salvata", description: "La ricetta è stata aggiunta alla collezione" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: firebaseApi.deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({ title: "Ricetta eliminata", description: "La ricetta è stata rimossa dalla collezione" });
    }
  });

  const handleAuthSuccess = (userData: any) => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  const addIngredient = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, '']
    });
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = newRecipe.ingredients.filter((_, i) => i !== index);
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients.length > 0 ? updatedIngredients : ['']
    });
  };

  const updateIngredient = (index: number, value: string) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients[index] = value;
    setNewRecipe({
      ...newRecipe,
      ingredients: updatedIngredients
    });
  };

  const addInstruction = () => {
    setNewRecipe({
      ...newRecipe,
      instructions: [...newRecipe.instructions, '']
    });
  };

  const removeInstruction = (index: number) => {
    const updatedInstructions = newRecipe.instructions.filter((_, i) => i !== index);
    setNewRecipe({
      ...newRecipe,
      instructions: updatedInstructions.length > 0 ? updatedInstructions : ['']
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const updatedInstructions = [...newRecipe.instructions];
    updatedInstructions[index] = value;
    setNewRecipe({
      ...newRecipe,
      instructions: updatedInstructions
    });
  };

  const addRecipe = () => {
    if (!newRecipe.name.trim()) return;
    
    const validIngredients = newRecipe.ingredients.filter(ing => ing.trim());
    const validInstructions = newRecipe.instructions.filter(inst => inst.trim());
    
    if (validIngredients.length === 0 || validInstructions.length === 0) {
      toast({
        title: "Errore",
        description: "Aggiungi almeno un ingrediente e un'istruzione",
        variant: "destructive"
      });
      return;
    }
    
    createMutation.mutate({
      name: newRecipe.name,
      description: newRecipe.description,
      ingredients: validIngredients,
      instructions: validInstructions,
      prep_time: newRecipe.prep_time,
      servings: newRecipe.servings,
      category: newRecipe.category || 'Altro'
    });
  };

  const deleteRecipe = (id: string) => {
    deleteMutation.mutate(id);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const categoryMatch = filterCategory === 'all' || recipe.category === filterCategory;
    const searchMatch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-600 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-700 to-orange-900 bg-clip-text text-transparent">
                Ricette
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredRecipes.length} ricette nella tua collezione
              </p>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
                <Plus className="h-4 w-4 mr-2" />
                Nuova Ricetta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crea Nuova Ricetta</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Ricetta</Label>
                    <Input
                      value={newRecipe.name}
                      onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                      placeholder="Es. Pasta al Pomodoro"
                    />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={newRecipe.category} onValueChange={(value) => setNewRecipe({...newRecipe, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipeCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Descrizione</Label>
                  <Textarea
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                    placeholder="Breve descrizione della ricetta..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tempo di Preparazione (minuti)</Label>
                    <Input
                      type="number"
                      value={newRecipe.prep_time}
                      onChange={(e) => setNewRecipe({...newRecipe, prep_time: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Porzioni</Label>
                    <Input
                      type="number"
                      value={newRecipe.servings}
                      onChange={(e) => setNewRecipe({...newRecipe, servings: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Ingredienti</Label>
                    <Button type="button" size="sm" onClick={addIngredient}>
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          placeholder={`Ingrediente ${index + 1}`}
                        />
                        {newRecipe.ingredients.length > 1 && (
                          <Button type="button" size="sm" variant="outline" onClick={() => removeIngredient(index)}>
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Istruzioni</Label>
                    <Button type="button" size="sm" onClick={addInstruction}>
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newRecipe.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2">
                        <Textarea
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          placeholder={`Passaggio ${index + 1}`}
                          rows={2}
                        />
                        {newRecipe.instructions.length > 1 && (
                          <Button type="button" size="sm" variant="outline" onClick={() => removeInstruction(index)}>
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={addRecipe} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? 'Salvando...' : 'Salva Ricetta'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Cerca ricette..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tutte le categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {recipeCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{recipe.name}</CardTitle>
                  <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.prep_time} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} porzioni</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">Ingredienti ({recipe.ingredients.length})</h4>
                  <div className="text-xs text-muted-foreground">
                    {recipe.ingredients.slice(0, 3).join(', ')}
                    {recipe.ingredients.length > 3 && '...'}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Visualizza
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingRecipe(recipe)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteRecipe(recipe.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredRecipes.length === 0 && (
          <div className="col-span-full">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessuna ricetta trovata</h3>
                <p className="text-muted-foreground mb-4">
                  {recipes.length === 0 ? 'Inizia creando la tua prima ricetta!' : 'Prova a modificare i filtri di ricerca.'}
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Ricetta
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
