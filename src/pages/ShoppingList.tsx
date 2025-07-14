
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Share2, Filter, Calendar, Package, Search, Users, Download, Euro, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api, CATEGORIES } from '@/lib/cloudflare';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
  priority: 'alta' | 'media' | 'bassa';
  cost?: number;
  purchased_by?: string;
}

const ShoppingList = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: Object.values(CATEGORIES)[0][0],
    priority: 'media' as 'alta' | 'media' | 'bassa',
    cost: 0
  });

  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten all categories for the dropdown
  const allCategories = Object.values(CATEGORIES).flat();

  useEffect(() => {
    loadShoppingItems();
  }, []);

  const loadShoppingItems = async () => {
    try {
      setLoading(true);
      const data = await api.getShoppingItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading shopping items:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare la lista della spesa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (item && !item.completed) {
      setSelectedItem(item);
    } else {
      try {
        const updatedItem = await api.updateShoppingItem(id, { 
          completed: !item?.completed,
          purchased_by: !item?.completed ? 'Te' : undefined
        });
        
        setItems(items.map(item => 
          item.id === id ? { ...item, ...updatedItem } : item
        ));

        toast({
          title: item?.completed ? "Elemento rimosso" : "Elemento completato",
          description: `${item?.name} ${item?.completed ? 'rimosso dalla' : 'aggiunto alla'} lista completati`,
        });
      } catch (error) {
        console.error('Error updating item:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare l'elemento",
          variant: "destructive"
        });
      }
    }
  };

  const moveItemToPantry = async () => {
    if (selectedItem && expiryDate) {
      try {
        await api.createPantryItem({
          name: selectedItem.name,
          quantity: parseInt(selectedItem.quantity) || 1,
          unit: 'pezzi',
          category: selectedItem.category,
          expiry_date: expiryDate,
          status: 'normale'
        });

        await api.deleteShoppingItem(selectedItem.id);
        
        setItems(items.filter(item => item.id !== selectedItem.id));
        
        toast({
          title: "Prodotto aggiunto alle conserve",
          description: `${selectedItem.name} è stato spostato nella dispensa`,
        });
        
        setSelectedItem(null);
        setExpiryDate('');
      } catch (error) {
        console.error('Error moving item to pantry:', error);
        toast({
          title: "Errore",
          description: "Impossibile spostare l'elemento nelle conserve",
          variant: "destructive"
        });
      }
    }
  };

  const addItem = async () => {
    if (newItem.name.trim()) {
      try {
        const item = await api.createShoppingItem({
          name: newItem.name,
          quantity: newItem.quantity || '1',
          category: newItem.category,
          completed: false,
          priority: newItem.priority,
          cost: newItem.cost > 0 ? newItem.cost : undefined
        });
        
        setItems([...items, item]);
        setNewItem({
          name: '',
          quantity: '',
          category: Object.values(CATEGORIES)[0][0],
          priority: 'media',
          cost: 0
        });
        
        toast({
          title: "Prodotto aggiunto",
          description: `${item.name} aggiunto alla lista`,
        });
      } catch (error) {
        console.error('Error adding item:', error);
        toast({
          title: "Errore",
          description: "Impossibile aggiungere l'elemento",
          variant: "destructive"
        });
      }
    }
  };

  const removeItem = async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      await api.deleteShoppingItem(id);
      setItems(items.filter(item => item.id !== id));
      
      if (item) {
        toast({
          title: "Prodotto rimosso",
          description: `${item.name} rimosso dalla lista`,
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Errore",
        description: "Impossibile rimuovere l'elemento",
        variant: "destructive"
      });
    }
  };

  const shareList = () => {
    if (shareEmail.trim()) {
      // Simulazione condivisione - In produzione usare API reale
      toast({
        title: "Lista condivisa!",
        description: `Lista condivisa con ${shareEmail}`,
      });
      setShareEmail('');
      setShowShareDialog(false);
    }
  };

  const exportList = () => {
    const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);
    const listText = [
      `LISTA DELLA SPESA - ${new Date().toLocaleDateString('it-IT')}`,
      `TOTALE STIMATO: €${totalCost.toFixed(2)}`,
      '',
      ...items.map(item => 
        `${item.completed ? '✅' : '⭕'} ${item.name} - ${item.quantity} (${item.category})${item.cost ? ` - €${item.cost.toFixed(2)}` : ''}${item.purchased_by ? ` - Comprato da: ${item.purchased_by}` : ''}`
      )
    ].join('\n');
    
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-spesa-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    
    toast({
      title: "Lista esportata",
      description: "La lista è stata scaricata",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'bassa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);

  if (loading) {
    return (
      <div className="p-4 space-y-6 bg-gradient-to-br from-red-50 via-orange-50 to-green-50 min-h-screen">
        <div className="bg-white rounded-2xl p-8 shadow-xl animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-red-50 via-orange-50 to-green-50 min-h-screen">
      {/* Header migliorato */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-primary animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
              Lista della Spesa
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {completedItems}/{totalItems} articoli completati
            </p>
            <div className="flex items-center gap-3 mt-3">
              <Badge className="bg-primary/10 text-primary">
                <Euro className="h-3 w-3 mr-1" />
                Totale: €{totalCost.toFixed(2)}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Share2 className="h-4 w-4 mr-2" />
                  Condividi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Condividi Lista</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Email della persona con cui condividere"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={shareList} className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Condividi
                    </Button>
                    <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                      Annulla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              onClick={exportList}
              className="hover:bg-green-50 border-green-500 text-green-700 transform hover:scale-105 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Esporta
            </Button>
          </div>
        </div>
        
        {/* Barra di ricerca e filtri */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca prodotti..."
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
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Bar animata */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-3">
            <span className="font-medium">Progresso</span>
            <span className="font-bold">{Math.round(totalItems > 0 ? (completedItems / totalItems) * 100 : 0)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary via-accent to-green-500 h-4 rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden"
              style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Item migliorato */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Aggiungi Nuovo Prodotto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <Input
              placeholder="Nome prodotto..."
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="md:col-span-2"
            />
            <Input
              placeholder="Quantità"
              value={newItem.quantity}
              onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
            />
            <Input
              type="number"
              placeholder="Costo €"
              value={newItem.cost || ''}
              onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
              step="0.01"
            />
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newItem.priority}
              onChange={(e) => setNewItem({...newItem, priority: e.target.value as 'alta' | 'media' | 'bassa'})}
            >
              <option value="bassa">Bassa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
            <Button 
              onClick={addItem} 
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shopping Items con animazioni */}
      <div className="space-y-4">
        {filteredItems.map((item, index) => (
          <Card 
            key={item.id} 
            className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in ${
              item.completed ? 'bg-white/40 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="data-[state=checked]:bg-primary transform hover:scale-110 transition-transform duration-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`font-semibold text-lg ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.name}
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)} animate-pulse`} />
                    {item.cost && (
                      <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                        <Euro className="h-3 w-3 mr-1" />
                        {item.cost.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-muted-foreground font-medium">{item.quantity}</p>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {item.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.priority === 'alta' ? 'border-red-500 text-red-700 bg-red-50' :
                        item.priority === 'media' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                        'border-green-500 text-green-700 bg-green-50'
                      }`}
                    >
                      {item.priority.toUpperCase()}
                    </Badge>
                    {item.purchased_by && (
                      <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                        <User className="h-3 w-3 mr-1" />
                        {item.purchased_by}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transform hover:scale-110 transition-all duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-12 text-center">
            <Package className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
            <p className="text-muted-foreground text-xl mb-2">
              {searchTerm || filterCategory ? 'Nessun risultato trovato' : 'Nessun articolo nella lista'}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterCategory ? 'Prova a modificare i filtri di ricerca' : 'Aggiungi il tuo primo articolo per iniziare!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog per scadenza */}
      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Sposta in Conserve
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-lg">Stai per spostare</p>
              <p className="text-xl font-bold text-primary">{selectedItem?.name}</p>
              <p className="text-sm text-muted-foreground">nella tua dispensa</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3">Data di scadenza</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={moveItemToPantry} 
                disabled={!expiryDate}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Package className="h-4 w-4 mr-2" />
                Sposta in Conserve
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedItem(null)}
                className="flex-1"
              >
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingList;
