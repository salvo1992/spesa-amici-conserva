
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Check, X, Edit, Trash2, Filter, DollarSign, Users, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseApi, CATEGORIES, type ShoppingItem } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const ShoppingList = () => {
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: '',
    priority: 'media' as 'alta' | 'media' | 'bassa',
    cost: 0
  });

  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['shopping-items'],
    queryFn: firebaseApi.getShoppingItems,
    enabled: isAuthenticated
  });

  const createMutation = useMutation({
    mutationFn: firebaseApi.createShoppingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      setShowAddDialog(false);
      setNewItem({ name: '', quantity: '', category: '', priority: 'media', cost: 0 });
      toast({ 
        title: "✨ Prodotto aggiunto", 
        description: "Il prodotto è stato aggiunto alla lista con successo!" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ShoppingItem> }) => 
      firebaseApi.updateShoppingItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      toast({ 
        title: "🔄 Prodotto aggiornato", 
        description: "Le modifiche sono state salvate" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: firebaseApi.deleteShoppingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      toast({ 
        title: "🗑️ Prodotto eliminato", 
        description: "Il prodotto è stato rimosso dalla lista" 
      });
    }
  });

  const addItem = () => {
    if (!newItem.name.trim()) return;
    
    createMutation.mutate({
      name: newItem.name,
      quantity: newItem.quantity,
      category: newItem.category || 'Altro',
      priority: newItem.priority,
      cost: newItem.cost,
      completed: false
    });
  };

  const toggleCompleted = (item: ShoppingItem) => {
    updateMutation.mutate({
      id: item.id,
      data: { completed: !item.completed }
    });
  };

  const deleteItem = (id: string) => {
    deleteMutation.mutate(id);
  };

  const filteredItems = items.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'completed' && item.completed) ||
      (filterStatus === 'pending' && !item.completed);
    return categoryMatch && statusMatch;
  });

  const totalCost = filteredItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const completedItems = filteredItems.filter(item => item.completed).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-cyan-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          <ShoppingCart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-teal-600/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                <ShoppingCart className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Lista della Spesa
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  {filteredItems.length} prodotti • {completedItems} completati • €{totalCost.toFixed(2)}
                </p>
              </div>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-200 px-6 py-3 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Aggiungi Prodotto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                    Nuovo Prodotto
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Nome Prodotto</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Es. Latte, Pane, Pomodori..."
                      className="mt-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Quantità</Label>
                      <Input
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                        placeholder="Es. 2kg, 1L, 3 pezzi"
                        className="mt-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Prezzo (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newItem.cost}
                        onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                        className="mt-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Categoria</Label>
                      <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                        <SelectTrigger className="mt-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                          <SelectValue placeholder="Seleziona categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.food.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Priorità</Label>
                      <Select value={newItem.priority} onValueChange={(value: 'alta' | 'media' | 'bassa') => setNewItem({...newItem, priority: value})}>
                        <SelectTrigger className="mt-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">🔴 Alta</SelectItem>
                          <SelectItem value="media">🟡 Media</SelectItem>
                          <SelectItem value="bassa">🟢 Bassa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={addItem} 
                    disabled={createMutation.isPending} 
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 text-lg font-semibold shadow-lg"
                  >
                    {createMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Aggiungendo...
                      </div>
                    ) : (
                      'Aggiungi alla Lista ✨'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-700">Filtri:</span>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-52 border-gray-200">
                <SelectValue placeholder="Tutte le categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {CATEGORIES.food.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-52 border-gray-200">
                <SelectValue placeholder="Tutti gli stati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="pending">Da acquistare</SelectItem>
                <SelectItem value="completed">Completati</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3 ml-auto">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Totale: €{totalCost.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shopping Items */}
      <div className="grid gap-6">
        {filteredItems.map((item, index) => (
          <Card key={item.id} className={`bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${item.completed ? 'opacity-60' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Button
                  size="lg"
                  variant={item.completed ? "default" : "outline"}
                  onClick={() => toggleCompleted(item)}
                  className={`${item.completed ? 
                    "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white" : 
                    "hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400"
                  } shadow-lg transition-all duration-200`}
                >
                  {item.completed ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                </Button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-xl font-bold ${item.completed ? 'line-through text-muted-foreground' : 'text-gray-800'}`}>
                      {item.name}
                    </h3>
                    <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-0">
                      {item.category}
                    </Badge>
                    <Badge 
                      className={`border-0 text-white ${
                        item.priority === 'alta' ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                        item.priority === 'media' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                        'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}
                    >
                      {item.priority === 'alta' ? '🔴' : item.priority === 'media' ? '🟡' : '🟢'} {item.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="font-medium">📦 Quantità: {item.quantity}</span>
                    {item.cost && <span className="font-medium">💰 Prezzo: €{item.cost.toFixed(2)}</span>}
                    {item.purchased_by && <span className="font-medium">👤 Acquistato da: {item.purchased_by}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button size="lg" variant="outline" onClick={() => setEditingItem(item)} className="hover:bg-yellow-50 border-yellow-200 hover:border-yellow-400">
                    <Edit className="h-5 w-5 text-yellow-600" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => deleteItem(item.id)} className="hover:bg-red-50 border-red-200 hover:border-red-400">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredItems.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl">
                  <ShoppingCart className="h-16 w-16 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Nessun prodotto trovato</h3>
              <p className="text-gray-500 text-lg mb-6">
                {items.length === 0 ? 'Inizia aggiungendo il tuo primo prodotto alla lista!' : 'Prova a modificare i filtri di ricerca.'}
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Aggiungi Prodotto ✨
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
