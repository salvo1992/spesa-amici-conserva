
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Package, Plus, Search, Filter, Calendar, AlertTriangle, CheckCircle, Edit, ShoppingCart, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { firebaseApi, PantryItem } from '@/lib/firebase';

const Pantry = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterQuantity, setFilterQuantity] = useState('all');
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'pz',
    expiry_date: '',
    category: 'Altro',
    status: 'normale' as 'abbondante' | 'normale' | 'scarso' | 'scaduto'
  });

  // Carica i prodotti della dispensa all'avvio
  useEffect(() => {
    if (isAuthenticated) {
      loadPantryItems();
    }
  }, [isAuthenticated]);

  const loadPantryItems = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await firebaseApi.getPantryItems();
      setItems(data);
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile caricare i prodotti della dispensa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check expiry status
  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'scaduto';
    if (diffDays <= 5) return 'scarso';
    return 'normale';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abbondante': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'normale': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'scarso': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'scaduto': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'abbondante': return <CheckCircle className="h-4 w-4" />;
      case 'normale': return <Package className="h-4 w-4" />;
      case 'scarso': return <Clock className="h-4 w-4" />;
      case 'scaduto': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getExpiryAlertIcon = (status: string) => {
    if (status === 'scarso') {
      return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
    }
    if (status === 'scaduto') {
      return <AlertTriangle className="h-5 w-5 text-red-500 animate-bounce" />;
    }
    return null;
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleAddToShoppingList = (item: any) => {
    toast({
      title: "✅ Aggiunto alla lista spesa",
      description: `${item.name} è stato aggiunto alla lista della spesa`
    });
  };

  const handleAddItem = async () => {
    if (!isAuthenticated) {
      toast({
        title: "❌ Accesso richiesto",
        description: "Devi effettuare l'accesso per aggiungere prodotti",
        variant: "destructive"
      });
      return;
    }

    if (!newItem.name.trim()) {
      toast({
        title: "⚠️ Errore",
        description: "Inserisci il nome del prodotto",
        variant: "destructive"
      });
      return;
    }

    try {
      await firebaseApi.createPantryItem({
        name: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        category: newItem.category,
        expiry_date: newItem.expiry_date,
        status: getExpiryStatus(newItem.expiry_date) as 'abbondante' | 'normale' | 'scarso' | 'scaduto'
      });

      toast({
        title: "✅ Prodotto aggiunto",
        description: "Il prodotto è stato aggiunto alla dispensa"
      });
      
      setShowAddDialog(false);
      setNewItem({ 
        name: '', 
        quantity: 1, 
        unit: 'pz', 
        expiry_date: '', 
        category: 'Altro', 
        status: 'normale' 
      });
      
      // Ricarica i prodotti
      loadPantryItems();
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile aggiungere il prodotto alla dispensa",
        variant: "destructive"
      });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.category === filterType;
    const matchesQuantity = filterQuantity === 'all' || 
      (filterQuantity === 'low' && item.quantity <= 2) ||
      (filterQuantity === 'medium' && item.quantity > 2 && item.quantity <= 5) ||
      (filterQuantity === 'high' && item.quantity > 5);
    
    return matchesSearch && matchesType && matchesQuantity;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h2 className="text-2xl font-bold mb-2">Accesso Richiesto</h2>
          <p className="text-muted-foreground">Effettua l'accesso per gestire la tua dispensa</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento dispensa...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Animated Header */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Package className="h-12 w-12 text-green-600 animate-bounce" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 bg-clip-text text-transparent animate-pulse">
              🥫 {t('pantry')} 🥫
            </h1>
          </div>
          <div className="text-muted-foreground text-lg animate-slide-up">
            ✨ Gestisci i tuoi prodotti in dispensa con stile ✨
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg animate-fade-in hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="h-4 w-4 text-muted-foreground animate-pulse" />
                <Input
                  placeholder="🔍 Cerca prodotti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-transparent focus:ring-2 focus:ring-green-500 transition-all duration-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48 hover:border-green-500 transition-colors duration-300">
                    <SelectValue placeholder="Tipo prodotto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🍽️ Tutte le categorie</SelectItem>
                    <SelectItem value="Frutta e Verdura">🥬 Frutta e Verdura</SelectItem>
                    <SelectItem value="Carne e Pesce">🥩 Carne e Pesce</SelectItem>
                    <SelectItem value="Latticini">🧀 Latticini</SelectItem>
                    <SelectItem value="Cereali e Pasta">🍝 Cereali e Pasta</SelectItem>
                    <SelectItem value="Conserve">🥫 Conserve</SelectItem>
                    <SelectItem value="Condimenti">🫒 Condimenti</SelectItem>
                    <SelectItem value="Altro">📦 Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={filterQuantity} onValueChange={setFilterQuantity}>
                <SelectTrigger className="w-48 hover:border-green-500 transition-colors duration-300">
                  <SelectValue placeholder="Quantità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📊 Tutte le quantità</SelectItem>
                  <SelectItem value="low">📉 Bassa (≤2)</SelectItem>
                  <SelectItem value="medium">📈 Media (3-5)</SelectItem>
                  <SelectItem value="high">📊 Alta (&gt;5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredItems.map((item, index) => (
            <Card 
              key={item.id} 
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-green-500 card-hover animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg text-foreground">
                          {item.name}
                        </CardTitle>
                        {getExpiryAlertIcon(item.status)}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusIcon(item.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">📦 Quantità:</span>
                    <span className="font-medium text-foreground">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">📅 Scadenza:</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={`font-medium ${
                        item.status === 'scaduto' ? 'text-red-600' : 
                        item.status === 'scarso' ? 'text-yellow-600' : 'text-foreground'
                      }`}>
                        {new Date(item.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditItem(item)}
                      className="flex-1 hover:border-green-500 hover:text-green-600 transition-all duration-300"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      ✏️ Modifica
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-all duration-300"
                      onClick={() => handleAddToShoppingList(item)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      🛒 Lista
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Spectacular Add Item Button */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <div className="relative group">
              <Card className="card-hover shadow-lg border-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white cursor-pointer overflow-hidden animate-fade-in hover:scale-105 transition-all duration-500">
                {/* Animated particles background */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping" style={{top: '20%', left: '10%', animationDelay: '0s'}}></div>
                  <div className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping" style={{top: '60%', left: '80%', animationDelay: '1s'}}></div>
                  <div className="absolute w-3 h-3 bg-white/10 rounded-full animate-ping" style={{top: '80%', left: '20%', animationDelay: '2s'}}></div>
                </div>
                
                <CardContent className="p-8 text-center relative z-10">
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <Plus className="h-16 w-16 mx-auto animate-spin" style={{animationDuration: '3s'}} />
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 animate-bounce">
                    ✨ Aggiungi Prodotto ✨
                  </h3>
                  
                  <div className="text-green-100 mb-6 text-lg">
                    🌟 Aggiungi un nuovo prodotto alla tua dispensa magica 🌟
                  </div>
                  
                  <div className="group-hover:scale-110 transition-all duration-300">
                    <div className="inline-flex items-center gap-3 bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-50 transition-all duration-300 shadow-lg">
                      <Plus className="h-6 w-6 animate-pulse" />
                      🚀 Aggiungi Prodotto 🚀
                    </div>
                  </div>
                </CardContent>
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-green-400/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              </Card>
            </div>
          </DialogTrigger>
          
          <DialogContent className="max-w-md animate-scale-in">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ✨ Aggiungi Nuovo Prodotto ✨
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="item-name" className="text-green-700 font-medium">📝 Nome Prodotto</Label>
                <Input
                  id="item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Es. Pasta, Pomodori..."
                  className="focus:ring-2 focus:ring-green-500 border-green-300"
                />
              </div>
              
              <div>
                <Label htmlFor="item-category" className="text-green-700 font-medium">🏷️ Categoria</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                  <SelectTrigger className="border-green-300 focus:ring-green-500">
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Frutta e Verdura">🥬 Frutta e Verdura</SelectItem>
                    <SelectItem value="Carne e Pesce">🥩 Carne e Pesce</SelectItem>
                    <SelectItem value="Latticini">🧀 Latticini</SelectItem>
                    <SelectItem value="Cereali e Pasta">🍝 Cereali e Pasta</SelectItem>
                    <SelectItem value="Conserve">🥫 Conserve</SelectItem>
                    <SelectItem value="Condimenti">🫒 Condimenti</SelectItem>
                    <SelectItem value="Altro">📦 Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-quantity" className="text-green-700 font-medium">🔢 Quantità</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    className="focus:ring-2 focus:ring-green-500 border-green-300"
                  />
                </div>
                <div>
                  <Label htmlFor="item-unit" className="text-green-700 font-medium">📏 Unità</Label>
                  <Input
                    id="item-unit"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    placeholder="kg, pz, lt..."
                    className="focus:ring-2 focus:ring-green-500 border-green-300"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="item-expiry" className="text-green-700 font-medium">📅 Data di Scadenza</Label>
                <Input
                  id="item-expiry"
                  type="date"
                    value={newItem.expiry_date}
                    onChange={(e) => setNewItem({...newItem, expiry_date: e.target.value})}
                  className="focus:ring-2 focus:ring-green-500 border-green-300"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddItem}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  ✅ Aggiungi Prodotto
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  ❌ Annulla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md animate-scale-in">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ✏️ Modifica Prodotto ✏️
              </DialogTitle>
            </DialogHeader>
            
            {editingItem && (
              <div className="space-y-4">
                <div>
                  <Label className="text-green-700 font-medium">📝 Nome Prodotto</Label>
                  <Input
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    className="focus:ring-2 focus:ring-green-500 border-green-300"
                  />
                </div>
                
                <div>
                  <Label className="text-green-700 font-medium">🏷️ Categoria</Label>
                  <Select value={editingItem.category} onValueChange={(value) => setEditingItem({...editingItem, category: value})}>
                    <SelectTrigger className="border-green-300 focus:ring-green-500">
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frutta e Verdura">🥬 Frutta e Verdura</SelectItem>
                      <SelectItem value="Carne e Pesce">🥩 Carne e Pesce</SelectItem>
                      <SelectItem value="Latticini">🧀 Latticini</SelectItem>
                      <SelectItem value="Cereali e Pasta">🍝 Cereali e Pasta</SelectItem>
                      <SelectItem value="Conserve">🥫 Conserve</SelectItem>
                      <SelectItem value="Condimenti">🫒 Condimenti</SelectItem>
                      <SelectItem value="Altro">📦 Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-green-700 font-medium">🔢 Quantità</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value)})}
                      className="focus:ring-2 focus:ring-green-500 border-green-300"
                    />
                  </div>
                  <div>
                    <Label className="text-green-700 font-medium">📏 Unità</Label>
                    <Input
                      value={editingItem.unit}
                      onChange={(e) => setEditingItem({...editingItem, unit: e.target.value})}
                      className="focus:ring-2 focus:ring-green-500 border-green-300"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-green-700 font-medium">📅 Data di Scadenza</Label>
                  <Input
                    type="date"
                    value={editingItem.expiry_date}
                    onChange={(e) => setEditingItem({...editingItem, expiry_date: e.target.value})}
                    className="focus:ring-2 focus:ring-green-500 border-green-300"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      toast({
                        title: "✅ Prodotto modificato",
                        description: "Le modifiche sono state salvate"
                      });
                      setShowEditDialog(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    💾 Salva Modifiche
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditDialog(false)}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    ❌ Annulla
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Pantry;
