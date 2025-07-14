
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Check, X, Edit, Trash2, Filter, DollarSign, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, CATEGORIES, type ShoppingItem } from '@/lib/firebase';
import AuthForm from '@/components/AuthForm';

const ShoppingList = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(firebaseAuth.isAuthenticated());
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
      toast({ title: "Prodotto aggiunto", description: "Il prodotto è stato aggiunto alla lista" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ShoppingItem> }) => 
      firebaseApi.updateShoppingItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      toast({ title: "Prodotto aggiornato", description: "Le modifiche sono state salvate" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: firebaseApi.deleteShoppingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      toast({ title: "Prodotto eliminato", description: "Il prodotto è stato rimosso dalla lista" });
    }
  });

  const handleAuthSuccess = (userData: any) => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-600 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                Lista della Spesa
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredItems.length} prodotti • {completedItems} completati • €{totalCost.toFixed(2)}
              </p>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Prodotto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuovo Prodotto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome Prodotto</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Es. Latte, Pane, Pomodori..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantità</Label>
                    <Input
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                      placeholder="Es. 2kg, 1L, 3 pezzi"
                    />
                  </div>
                  <div>
                    <Label>Prezzo (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newItem.cost}
                      onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                      <SelectTrigger>
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
                    <Label>Priorità</Label>
                    <Select value={newItem.priority} onValueChange={(value: 'alta' | 'media' | 'bassa') => setNewItem({...newItem, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="bassa">Bassa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addItem} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? 'Aggiungendo...' : 'Aggiungi alla Lista'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtri:</span>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
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
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tutti gli stati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="pending">Da acquistare</SelectItem>
                <SelectItem value="completed">Completati</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 ml-auto">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-600">Totale: €{totalCost.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shopping Items */}
      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl ${item.completed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant={item.completed ? "default" : "outline"}
                  onClick={() => toggleCompleted(item)}
                  className={item.completed ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}
                >
                  {item.completed ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                </Button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.name}
                    </h3>
                    <Badge variant="secondary">{item.category}</Badge>
                    <Badge 
                      variant={item.priority === 'alta' ? 'destructive' : 
                               item.priority === 'media' ? 'default' : 'secondary'}
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Quantità: {item.quantity}</span>
                    {item.cost && <span>Prezzo: €{item.cost.toFixed(2)}</span>}
                    {item.purchased_by && <span>Acquistato da: {item.purchased_by}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingItem(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredItems.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun prodotto trovato</h3>
              <p className="text-muted-foreground mb-4">
                {items.length === 0 ? 'Inizia aggiungendo il tuo primo prodotto alla lista!' : 'Prova a modificare i filtri di ricerca.'}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Prodotto
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
