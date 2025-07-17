import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChefHat, Plus, Clock, Users, Search, Heart, Filter, BookOpen, Eye, Share2, Facebook, Twitter, Instagram } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, type Recipe } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Recipes = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prep_time: 30,
    servings: 4,
    category: ''
  });

  // Ricette di default migliorate
  const defaultRecipes: Recipe[] = [
    {
      id: 'default-1',
      name: 'Spaghetti alla Carbonara Autentica',
      description: 'La vera ricetta romana della carbonara, preparata con guanciale croccante, uova fresche, pecorino romano DOP e pepe nero macinato al momento. Un piatto che rappresenta l\'essenza della cucina romana tradizionale.',
      ingredients: ['400g spaghetti o tonnarelli', '200g guanciale tagliato a listarelle', '4 uova intere + 2 tuorli', '100g pecorino romano DOP grattugiato', 'Pepe nero macinato fresco', 'Sale marino grosso'],
      instructions: [
        'Metti l\'acqua salata a bollire in una pentola capiente. Quando bolle, butta la pasta.',
        'Nel frattempo, taglia il guanciale a listarelle di circa 1cm di spessore. Non serve olio.',
        'Metti il guanciale in una padella antiaderente fredda e accendi il fuoco medio-basso. Fallo rosolare lentamente fino a renderlo croccante (circa 10-12 minuti).',
        'In una ciotola, sbatti le uova intere con i tuorli, aggiungi il pecorino grattugiato e una generosa macinata di pepe nero. Mescola bene.',
        'Quando la pasta è al dente, scolala conservando un po\' di acqua di cottura calda.',
        'Spegni il fuoco sotto il guanciale e aggiungi subito la pasta scolata nella padella. Mescola velocemente.',
        'Aggiungi il composto di uova e pecorino fuori dal fuoco, mantecando energicamente. Se serve, aggiungi acqua di cottura per rendere cremoso.',
        'Servi immediatamente con una spolverata di pecorino e pepe nero macinato fresco.'
      ],
      prep_time: 25,
      servings: 4,
      category: 'Primi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-2', 
      name: 'Tiramisù della Nonna Perfetto',
      description: 'Il dolce italiano più amato al mondo, preparato con mascarpone cremoso, caffè espresso forte, savoiardi di Saronno e cacao olandese. La ricetta della nonna per un tiramisù che si scioglie in bocca.',
      ingredients: ['500g mascarpone a temperatura ambiente', '6 uova fresche (separate)', '150g zucchero semolato', '400g savoiardi di Saronno', '4 tazzine caffè espresso forte (freddo)', '3 cucchiai marsala o rum', 'Cacao amaro in polvere', 'Zucchero a velo'],
      instructions: [
        'Separa gli albumi dai tuorli. Monta gli albumi a neve ferma con un pizzico di sale.',
        'In una ciotola, sbatti i tuorli con lo zucchero fino ad ottenere un composto chiaro e spumoso.',
        'Aggiungi il mascarpone ai tuorli e mescola delicatamente con una spatola dal basso verso l\'alto.',
        'Incorpora gli albumi montati al composto di tuorli e mascarpone, mescolando sempre dal basso verso l\'alto.',
        'Prepara il caffè e fallo raffreddare. Aggiungi il marsala o rum.',
        'Intingi velocemente i savoiardi nel caffè e disponili in una pirofila in un unico strato.',
        'Copri con metà della crema al mascarpone, livellando bene.',
        'Ripeti con un altro strato di savoiardi intinti e la restante crema.',
        'Copri con pellicola e lascia riposare in frigorifero per almeno 4 ore (meglio una notte).',
        'Prima di servire, spolvera abbondantemente con cacao amaro setacciato.'
      ],
      prep_time: 45,
      servings: 8,
      category: 'Dolci',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-3',
      name: 'Risotto ai Funghi Porcini Mantecato',
      description: 'Un risotto cremoso e profumato con funghi porcini freschi, brodo vegetale aromatico e mantecatura finale con burro e Parmigiano. La tecnica perfetta per un risotto all\'onda.',
      ingredients: ['320g riso Carnaroli o Arborio', '300g funghi porcini freschi', '1 cipolla dorata media', '1,2L brodo vegetale caldo', '100ml vino bianco secco', '80g burro', '100g Parmigiano grattugiato', 'Prezzemolo tritato', 'Olio extravergine', 'Sale e pepe'],
      instructions: [
        'Pulisci i funghi porcini con un coltello e un panno umido. Tagliali a fette spesse.',
        'Tieni il brodo vegetale sempre caldo a fuoco basso.',
        'Trita finemente la cipolla e falla appassire in una casseruola con olio e una noce di burro.',
        'Aggiungi i funghi e falli saltare a fuoco alto per 5 minuti. Sala, pepa e metti da parte.',
        'Nella stessa casseruola, tosta il riso per 2-3 minuti mescolando.',
        'Sfuma con il vino bianco e lascia evaporare l\'alcol.',
        'Aggiungi il brodo caldo un mestolo alla volta, mescolando continuamente.',
        'A metà cottura (circa 10 minuti), aggiungi i funghi saltati.',
        'Continua ad aggiungere brodo fino a cottura (18-20 minuti totali). Il riso deve essere all\'onda.',
        'Manteca fuori dal fuoco con burro freddo e Parmigiano. Aggiungi prezzemolo e servi subito.'
      ],
      prep_time: 35,
      servings: 4,
      category: 'Primi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-4',
      name: 'Pizza Napoletana Margherita DOP',
      description: 'La pizza napoletana autentica con impasto a lunga lievitazione, pomodoro San Marzano DOP, mozzarella di bufala campana e basilico fresco. Cotta in forno a legna a 450°C.',
      ingredients: ['Per l\'impasto: 1kg farina 00 W300', '650ml acqua', '20g sale marino', '3g lievito di birra fresco', 'Per il condimento: 400g pomodori San Marzano DOP', '400g mozzarella di bufala', 'Basilico fresco', 'Olio extravergine', 'Sale'],
      instructions: [
        'Sciogli il lievito in 100ml di acqua tiepida.',
        'In una ciotola, mescola la farina con il sale. Crea una fontana.',
        'Aggiungi l\'acqua con il lievito e il resto dell\'acqua gradualmente, impastando.',
        'Lavora l\'impasto per 10-15 minuti fino a renderlo liscio ed elastico.',
        'Metti in una ciotola oliata, copri e fai lievitare per 2 ore a temperatura ambiente.',
        'Dividi in panetti da 250g e fai lievitare per altre 4-6 ore.',
        'Stendi ogni panetto con le mani formando un disco di 30cm (bordo più alto).',
        'Condisci con pomodori schiacciati, sale, olio e inforna a 250°C per 2-3 minuti.',
        'Aggiungi la mozzarella a pezzi e cuoci per altri 5-7 minuti.',
        'Sforna e completa con basilico fresco e un filo d\'olio.'
      ],
      prep_time: 150,
      servings: 4,
      category: 'Pizze',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-5',
      name: 'Osso Buco alla Milanese Tradizionale',
      description: 'Il classico secondo piatto lombardo con fette di stinco di vitello brasate nel vino bianco, servite con gremolada aromatica. Perfetto con risotto giallo o polenta.',
      ingredients: ['4 fette di osso buco di vitello', '1 carota', '1 costa di sedano', '1 cipolla', '400ml vino bianco', '400ml brodo di carne', 'Farina 00', 'Burro', 'Olio', 'Per la gremolada: scorza di limone, aglio, prezzemolo'],
      instructions: [
        'Infarinare le fette di osso buco e legarle con lo spago da cucina.',
        'Scaldare burro e olio in una casseruola e rosolare la carne su tutti i lati.',
        'Rimuovere la carne e rosolare il soffritto di carota, sedano e cipolla tritati.',
        'Rimettere la carne, sfumare con vino bianco e far evaporare l\'alcol.',
        'Aggiungere il brodo caldo, coprire e cuocere a fuoco basso per 1,5-2 ore.',
        'Girare la carne ogni 30 minuti e aggiungere brodo se necessario.',
        'Preparare la gremolada tritando finemente scorza di limone, aglio e prezzemolo.',
        'A cottura ultimata, cospargere con la gremolada e servire con risotto alla milanese.'
      ],
      prep_time: 120,
      servings: 4,
      category: 'Secondi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    }
  ];

  const queryClient = useQueryClient();

  const { data: userRecipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: firebaseApi.getRecipes,
    enabled: isAuthenticated
  });

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

  const handleShareRecipe = (recipe: Recipe, platform?: string) => {
    const appName = "Food Manager - Il Vikingo del Web";
    const appUrl = window.location.origin;
    const text = `🍽️ ${appName}\n\n📝 Ricetta: ${recipe.name}\n\n${recipe.description}\n\n⏱️ Tempo: ${recipe.prep_time} min | 👥 Porzioni: ${recipe.servings}\n\n📱 Scopri altre ricette: ${appUrl}`;
    
    if (platform) {
      let shareUrl = '';
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(text)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
          break;
        case 'instagram':
          navigator.clipboard.writeText(text);
          toast({
            title: "Testo copiato!",
            description: "Condividi la ricetta su Instagram incollando il testo"
          });
          return;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "Ricetta condivisa!",
        description: "Il testo è stato copiato negli appunti"
      });
    }
  };

  const toggleFavorite = (recipeId: string) => {
    setFavorites(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
    toast({ 
      title: favorites.includes(recipeId) ? "Rimosso dai preferiti" : "Aggiunto ai preferiti",
      description: "Le tue preferenze sono state aggiornate"
    });
  };

  const viewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowDetailsDialog(true);
  };

  const addIngredient = () => {
    setNewRecipe({...newRecipe, ingredients: [...newRecipe.ingredients, '']});
  };

  const addInstruction = () => {
    setNewRecipe({...newRecipe, instructions: [...newRecipe.instructions, '']});
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...newRecipe.ingredients];
    updated[index] = value;
    setNewRecipe({...newRecipe, ingredients: updated});
  };

  const updateInstruction = (index: number, value: string) => {
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-orange-600 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-700 to-orange-900 bg-clip-text text-transparent">
                {t('recipes')}
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
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
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
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1 flex items-center gap-2 text-foreground">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                    {recipe.name}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                    {recipe.category}
                  </Badge>
                  {recipe.user_id === 'default' && (
                    <Badge variant="outline" className="ml-2 border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                      Ricetta Tradizionale
                    </Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`${favorites.includes(recipe.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                  onClick={() => toggleFavorite(recipe.id)}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(recipe.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                  <div className="text-xs font-semibold text-muted-foreground uppercase">Ingredienti principali:</div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
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
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    onClick={() => viewRecipe(recipe)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizza
                  </Button>
                  <div className="relative">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                      onClick={() => handleShareRecipe(recipe)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recipe Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-700 to-orange-900 bg-clip-text text-transparent">
                {selectedRecipe?.name}
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareRecipe(selectedRecipe!, 'facebook')}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareRecipe(selectedRecipe!, 'twitter')}
                  className="hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                  <Twitter className="h-4 w-4 text-sky-500" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareRecipe(selectedRecipe!, 'instagram')}
                  className="hover:bg-pink-50 dark:hover:bg-pink-900/20"
                >
                  <Instagram className="h-4 w-4 text-pink-600" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {selectedRecipe && (
            <div className="space-y-6 mt-6">
              <div className="flex items-center gap-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-foreground">{selectedRecipe.prep_time} minuti</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-foreground">{selectedRecipe.servings} porzioni</span>
                </div>
                <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                  {selectedRecipe.category}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Descrizione</h3>
                <p className="text-muted-foreground leading-relaxed">{selectedRecipe.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Ingredienti</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-sm text-foreground">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Preparazione</h3>
                <div className="space-y-4">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <div 
                      key={index}
                      className="flex gap-4 p-4 bg-white dark:bg-gray-700 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {filteredRecipes.length === 0 && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">Nessuna ricetta trovata</h3>
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
