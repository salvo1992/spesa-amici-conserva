
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, AlertTriangle, CheckCircle, Plus, Search, Minus, ShoppingCart, Trash2, Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api, CATEGORIES } from '@/lib/cloudflare';

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiry_date: string;
  status: 'abbondante' | 'normale' | 'scarso' | 'scaduto';
}

const Pantry = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 0,
    unit: 'pezzi',
    category: 'Alimentari',
    expiry_date: ''
  });

  const allCategories = ['Tutti', ...CATEGORIES.food, ...CATEGORIES.home, ...CATEGORIES.garden, ...CATEGORIES.car, ...CATEGORIES.personal, ...CATEGORIES.tech, ...CATEGORIES.other];
  const units = ['pezzi', 'kg', 'litri', 'grammi', 'barattoli', 'scatole', 'pacchetti', 'bottiglie', 'confezioni'];

  useEffect(() => {
    loadPantryItems();
  }, []);

  const loadPantryItems = async () => {
    try {
      setLoading(true);
      const data = await api.getPantryItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading pantry items:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le conserve",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abbondante': return 'bg-green-500';
      case 'normale': return 'bg-blue-500';
      case 'scarso': return 'bg-yellow-500';
      case 'scaduto': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'abbondante': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'normale': return <Package className="h-4 w-4 text-blue-600" />;
      case 'scarso': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'scaduto': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'abbondante': return 100;
      case 'normale': return 60;
      case 'scarso': return 30;
      case 'scaduto': return 0;
      default: return 50;
    }
  };

  const calculateStatus = (quantity: number, expiryDate: string): 'abbondante' | 'normale' | 'scarso' | 'scaduto' => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'scaduto';
    if (quantity === 0) return 'scaduto';
    if (quantity <= 1 || daysUntilExpiry <= 3) return 'scarso';
    if (quantity <= 3 || daysUntilExpiry <= 7) return 'normale';
    return 'abbondante';
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tutti' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateQuantity = async (id: string, newQuantity: number) => {
    try {
      const item = items.find(i => i.id === id);
      if (!item) return;

      const updatedQuantity = Math.max(0, newQuantity);
      const newStatus = calculateStatus(updatedQuantity, item.expiry_date);
      
      await api.updatePantryItem(id, { 
        quantity: updatedQuantity, 
        status: newStatus 
      });
      
      setItems(items.map(item => 
        item.id === id 
          ? { ...item, quantity: updatedQuantity, status: newStatus }
          : item
      ));
      
      toast({
        title: "Quantità aggiornata",
        description: `${item.name} aggiornato con successo`,
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la quantità",
        variant: "destructive"
      });
    }
  };

  const addToShoppingList = async (item: PantryItem) => {
    try {
      await api.createShoppingItem({
        name: item.name,
        quantity: '1',
        category: item.category,
        completed: false,
        priority: 'media'
      });
      
      toast({
        title: "Aggiunto alla lista spesa",
        description: `${item.name} è stato aggiunto alla lista della spesa`,
      });
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere alla lista spesa",
        variant: "destructive"
      });
    }
  };

  const removeItem = async (id: string) => {
    try {
      await api.deletePantryItem(id);
      setItems(items.filter(item => item.id !== id));
      toast({
        title: "Prodotto eliminato",
        description: "Il prodotto è stato rimosso dalle conserve",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il prodotto",
        variant: "destructive"
      });
    }
  };

  const addNewItem = async () => {
    if (newItem.name.trim() && newItem.quantity > 0 && newItem.expiry_date) {
      try {
        const status = calculateStatus(newItem.quantity, newItem.expiry_date);
        
        const createdItem = await api.createPantryItem({
          name: newItem.name,
          quantity: newItem.quantity,
          unit: newItem.unit,
          category: newItem.category,
          expiry_date: newItem.expiry_date,
          status
        });
        
        setItems([createdItem, ...items]);
        setNewItem({
          name: '',
          quantity: 0,
          unit: 'pezzi',
          category: 'Alimentari',
          expiry_date: ''
        });
        setShowAddDialog(false);
        
        toast({
          title: "Prodotto aggiunto",
          description: `${createdItem.name} è stato aggiunto alle conserve`,
        });
      } catch (error) {
        console.error('Error adding item:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiungere il prodotto",
          variant: "destructive"
        });
      }
    }
  };

  const stats = {
    totale: items.length,
    abbondanti: items.filter(i => i.status === 'abbondante').length,
    scarsi: items.filter(i => i.status === 'scarso').length,
    scaduti: items.filter(i => i.status === 'scaduto').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-primary">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Le Mie Conserve
            </h1>
            <p className="text-muted-foreground mt-1">Gestisci la tua dispensa</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Prodotto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Nuovo Prodotto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome prodotto"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Quantità"
                    value={newItem.quantity || ''}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                  />
                  <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                >
                  {allCategories.filter(cat => cat !== 'Tutti').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Input
                  type="date"
                  value={newItem.expiry_date}
                  onChange={(e) => setNewItem({...newItem, expiry_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Button onClick={addNewItem} className="w-full">
                  Aggiungi alle Conserve
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Totale Articoli', value: stats.totale, color: 'text-foreground', bg: 'bg-white' },
          { title: 'Abbondanti', value: stats.abbondanti, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Scarsi', value: stats.scarsi, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { title: 'Scaduti', value: stats.scaduti, color: 'text-red-600', bg: 'bg-red-50' }
        ].map((stat, index) => (
          <Card key={index} className={`${stat.bg} border-0 shadow-lg`}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtri */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca nelle conserve..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white shadow-lg border-0"
          />
        </div>
        <select
          className="rounded-md border-0 shadow-lg bg-white px-3 py-2 text-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(item.status)}
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      {item.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {item.quantity} {item.unit}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <span className="text-muted-foreground">
                        Scade: {new Date(item.expiry_date).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    
                    <Progress 
                      value={getProgressValue(item.status)} 
                      className="h-2"
                    />
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${
                        item.status === 'scaduto' ? 'text-red-600' :
                        item.status === 'scarso' ? 'text-yellow-600' :
                        item.status === 'normale' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      
                      <div className="flex gap-2">
                        {(item.status === 'scarso' || item.quantity <= 1) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => addToShoppingList(item)}
                            className="hover:bg-accent/10"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Lista Spesa
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchTerm || selectedCategory !== 'Tutti' ? 'Nessun prodotto trovato' : 'Nessuna conserva'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm || selectedCategory !== 'Tutti' ? 'Prova a cambiare i filtri' : 'Inizia aggiungendo i tuoi prodotti!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pantry;
