
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChefHat, Plus, Clock, Users, Search, Heart, Star, Filter, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, CATEGORIES, type Recipe } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const Recipes = () => {
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prep_time: 30,
    servings: 4,
    category: ''
  });

  // Ricette di default
  const defaultRecipes = [
    {
      id: 'default-1',
      name: 'Spaghetti alla Carbonara',
      description: 'La classica ricetta romana con guanciale, uova e pecorino',
      ingredients: ['400g spaghetti', '200g guanciale', '4 uova', '100g pecorino romano', 'pepe nero'],
      instructions: ['Cuoci la pasta', 'Rosola il guanciale', 'Mescola uova e pecorino', 'Manteca tutto insieme'],
      prep_time: 25,
      servings: 4,
      category: 'Primi Piatti',
      user_id: 'default'
    },
    {
      id: 'default-2', 
      name: 'Tiramisù',
      description: 'Il dolce italiano più famoso al mondo',
      ingredients: ['500g mascarpone', '6 uova', '200g savoiardi', 'caffè', 'cacao', 'zucchero'],
      instructions: ['Prepara il caffè', 'Monta le uova', 'Alterna strati', 'Lascia riposare'],
      prep_time: 45,
      servings: 8,
      category: 'Dolci',
      user_id: 'default'
    },
    {
      id: 'default-3',
      name: 'Risotto ai Funghi Porcini',
      description: 'Cremoso risotto con funghi porcini freschi',
      ingredients: ['320g riso Carnaroli', '300g funghi porcini', '1L brodo vegetale', 'cipolla', 'vino bianco', 'parmigiano'],
      instructions: ['Tosta il riso', 'Aggiungi brodo gradualmente', 'Incorpora i funghi', 'Manteca con burro e parmigiano'],
      prep_time: 35,
      servings: 4,
      category: 'Primi Piatti',
      user_id: 'default'
    },
    {
      id: 'default-4',
      name: 'Pizza Margherita',
      description: 'La pizza napoletana per eccellenza',
      ingredients: ['400g farina 00', '250ml acqua', '10g lievito', 'pomodori pelati', 'mozzarella', 'basilico'],
      instructions: ['Prepara l\'impasto', 'Lievitazione 2 ore', 'Stendi la pizza', 'Cuoci a 250°C'],
      prep_time: 150,
      servings: 4,
      category: 'Pizze',
      user_id: 'default'
    },
    {
      id: 'default-5',
      name: 'Osso Buco alla Milanese',
      description: 'Piatto tipico lombardo con midollo e gremolada',
      ingredients: ['4 ossi buco', 'carote', 'sedano', 'cipolla', 'vino bianco', 'brodo', 'gremolada'],
      instructions: ['Infarinare la carne', 'Rosolare tutto', 'Brasare lentamente', 'Servire con risotto'],
      prep_time: 120,
      servings: 4,
      category: 'Secondi Piatti',
      user_id: 'default'
    },
    {
      id: 'default-6',
      name: 'Parmigiana di Melanzane',
      description: 'Classico piatto del sud Italia a strati',
      ingredients: ['3 melanzane', 'pomodoro', 'mozzarella', 'parmigiano', 'basilico', 'olio'],
      instructions: ['Grigliale melanzane', 'Prepara il sugo', 'Componi a strati', 'Cuoci in forno'],
      prep_time: 90,
      servings: 6,
      category: 'Contorni',
      user_id: 'default'
    },
    {
      id: 'default-7',
      name: 'Gelato alla Vaniglia',
      description: 'Cremoso gelato artigianale alla vaniglia',
      ingredients: ['500ml latte', '250ml panna', '150g zucchero', '6 tuorli', 'bacca di vaniglia'],
      instructions: ['Scalda latte e panna', 'Monta tuorli e zucchero', 'Prepara la crema', 'Manteca in gelatiera'],
      prep_time: 60,
      servings: 8,
      category: 'Dolci',
      user_id: 'default'
    },
    {
      id: 'default-8',
      name: 'Lasagne alla Bolognese',
      description: 'Le lasagne emiliane con ragù e besciamella',
      ingredients: ['sfoglia fresca', 'ragù bolognese', 'besciamella', 'parmigiano', 'mozzarella'],
      instructions: ['Prepara il ragù', 'Fai la besciamella', 'Componi le lasagne', 'Cuoci 45 minuti'],
      prep_time: 180,
      servings: 8,
      category: 'Primi Piatti',
      user_id: 'default'
    },
    {
      id: 'default-9',
      name: 'Cacio e Pepe',
      description: 'Pasta romana con solo cacio e pepe',
      ingredients: ['400g tonnarelli', '200g pecorino romano', 'pepe nero', 'acqua di cottura'],
      instructions: ['Cuoci la pasta', 'Tosta il pepe', 'Manteca con pecorino', 'Usa acqua di cottura'],
      prep_time: 15,
      servings: 4,
      category: 'Primi Piatti',
      user_id: 'default'
    },
    {
      id: 'default-10',
      name: 'Cannoli Siciliani',
      description: 'Dolci siciliani con ricotta e pistacchi',
      ingredients: ['scorze per cannoli', '500g ricotta', 'zucchero a velo', 'pistacchi', 'gocce cioccolato'],
      instructions: ['Friggi le scorze', 'Prepara la ricotta', 'Riempi i cannoli', 'Decora con pistacchi'],
      prep_time: 60,
      servings: 12,
      category: 'Dolci',
      user_id: 'default'
    }
  ];

  const queryClient = useQueryClient();

  const { data: userRecipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: firebaseApi.getRecipes,
    enabled: isAuthenticated
  });

  // Combina ricette default con quelle dell'utente
  const allRecipes = [...defaultRecipes, ...userRecipes];

  const createMutation = useMutation({
    mutationFn: firebaseApi.createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setShowAddDialog(false);
      setNewRecipe({
        name: '', description: '', ingredients: [''], instructions: [''],
        prep_time: 30, servings: 4, category: ''
      });
      toast({ title: "Ricetta aggiunta", description: "La ricetta è stata salvata con successo" });
    }
  });

  const addIngredient = () => {
    setNewRecipe({...newRecipe, ingredients: [...newRecipe.ingredients, '']});
  };

  const addInstruction = () => {
    setNewRecipe({...newRecipe, instructions: [...newRecipe.instructions, '']});
  };

  const updateIngredient = (index, value) => {
    const updated = [...newRecipe.ingredients];
    updated[index] = value;
    setNewRecipe({...newRecipe, ingredients: updated});
  };

  const updateInstruction = (index, value) => {
    const updated = [...newRecipe.instructions];
    updated[index] = value;
    setNewRecipe({...newRecipe, instructions: updated});
  };

  const createRecipe = () => {
    if (!newRecipe.name.trim()) return;
    
    createMutation.mutate({
      name: newRecipe.name,
      description: newRecipe.description,
      ingredients: newRecipe.ingredients.filter(i => i.trim()),
      instructions: newRecipe.instructions.filter(i => i.trim()),
      prep_time: newRecipe.prep_time,
      servings: newRecipe.servings,
      category: newRecipe.category || 'Altro'
    });
  };

  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 min-h-screen">
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
                {filteredRecipes.length} ricette disponibili
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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crea Nuova Ricetta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Ricetta</Label>
                    <Input
                      value={newRecipe.name}
                      onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                      placeholder="Es. Pasta alla Carbonara"
                    />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={newRecipe.category} onValueChange={(value) => setNewRecipe({...newRecipe, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Primi Piatti">Primi Piatti</SelectItem>
                        <SelectItem value="Secondi Piatti">Secondi Piatti</SelectItem>
                        <SelectItem value="Contorni">Contorni</SelectItem>
                        <SelectItem value="Dolci">Dolci</SelectItem>
                        <SelectItem value="Antipasti">Antipasti</SelectItem>
                        <SelectItem value="Pizze">Pizze</SelectItem>
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
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tempo Preparazione (min)</Label>
                    <Input
                      type="number"
                      value={newRecipe.prep_time}
                      onChange={(e) => setNewRecipe({...newRecipe, prep_time: parseInt(e.target.value) || 30})}
                    />
                  </div>
                  <div>
                    <Label>Porzioni</Label>
                    <Input
                      type="number"
                      value={newRecipe.servings}
                      onChange={(e) => setNewRecipe({...newRecipe, servings: parseInt(e.target.value) || 4})}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Ingredienti</Label>
                    <Button type="button" size="sm" onClick={addIngredient}>
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi
                    </Button>
                  </div>
                  {newRecipe.ingredients.map((ingredient, index) => (
                    <Input
                      key={index}
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder={`Ingrediente ${index + 1}`}
                      className="mb-2"
                    />
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Istruzioni</Label>
                    <Button type="button" size="sm" onClick={addInstruction}>
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi
                    </Button>
                  </div>
                  {newRecipe.instructions.map((instruction, index) => (
                    <Textarea
                      key={index}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Passo ${index + 1}`}
                      className="mb-2"
                    />
                  ))}
                </div>

                <Button onClick={createRecipe} disabled={createMutation.isPending} className="w-full">
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
            <div className="flex items-center gap-2 flex-1 min-w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca ricette..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent"
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
                  <SelectItem value="Primi Piatti">Primi Piatti</SelectItem>
                  <SelectItem value="Secondi Piatti">Secondi Piatti</SelectItem>
                  <SelectItem value="Contorni">Contorni</SelectItem>
                  <SelectItem value="Dolci">Dolci</SelectItem>
                  <SelectItem value="Antipasti">Antipasti</SelectItem>
                  <SelectItem value="Pizze">Pizze</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card 
            key={recipe.id} 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                    {recipe.name}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {recipe.category}
                  </Badge>
                  {recipe.user_id === 'default' && (
                    <Badge variant="outline" className="ml-2 border-green-300 text-green-700">
                      Ricetta Tradizionale
                    </Badge>
                  )}
                </div>
                <Button size="sm" variant="ghost" className="text-red-500">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prep_time} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} porzioni</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-600 uppercase">Ingredienti principali:</div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-orange-50 border-orange-200">
                        {ingredient.length > 15 ? ingredient.substring(0, 15) + '...' : ingredient}
                      </Badge>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.ingredients.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                    Visualizza
                  </Button>
                  <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredRecipes.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna ricetta trovata</h3>
            <p className="text-muted-foreground mb-4">
              Prova a modificare i filtri di ricerca o aggiungi la tua prima ricetta!
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crea Ricetta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Recipes;
