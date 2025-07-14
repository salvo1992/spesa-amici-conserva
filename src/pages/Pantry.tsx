
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Package, Plus, AlertTriangle, CheckCircle, Clock, Edit, Trash2, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, CATEGORIES, type PantryItem } from '@/lib/firebase';
import AuthForm from '@/components/AuthForm';

const Pantry = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(firebaseAuth.isAuthenticated());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 0,
    unit: '',
    category: '',
    expiry_date: '',
    status: 'normale' as 'abbondante' | 'normale' | 'scarso' | 'scaduto'
  });

  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['pantry-items'],
    queryFn: firebaseApi.getPantryItems,
    enabled: isAuthenticated
  });

  const createMutation = useMutation({
    mutationFn: firebaseApi.createPantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      setShowAddDialog(false);
      setNewItem({ name: '', quantity: 0, unit: '', category: '', expiry_date: '', status: 'normale' });
      toast({ title: "Prodotto aggiunto", description: "Il prodotto è stato aggiunto alla dispensa" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PantryItem> }) => 
      firebaseApi.updatePantryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      toast({ title: "Prodotto aggiornato", description: "Le modifiche sono state salvate" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: firebaseApi.deletePantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      toast({ title: "Prodotto eliminato", description: "Il prodotto è stato rimosso dalla dispensa" });
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
      unit: newItem.unit,
      category: newItem.category || 'Altro',
      expiry_date: newItem.expiry_date,
      status: newItem.status
    });
  };

  const deleteItem = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'abbondante': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'scarso': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'scaduto': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abbondante': return 'bg-green-100 text-green-800';
      case 'scarso': return 'bg-orange-100 text-orange-800';
      case 'scaduto': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredItems = items.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

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
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-600 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
                Dispensa
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredItems.length} prodotti disponibili
              </p>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Prodotto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuovo Prodotto in Dispensa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome Prodotto</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Es. Pasta, Riso, Olio..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantità</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Unità</Label>
                    <Input
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      placeholder="kg, L, pezzi, confezioni..."
                    />
                  </div>
                </div>
                <div>
                  <Label>Data di Scadenza</Label>
                  <Input
                    type="date"
                    value={newItem.expiry_date}
                    onChange={(e) => setNewItem({...newItem, expiry_date: e.target.value})}
                  />
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
                    <Label>Stato</Label>
                    <Select value={newItem.status} onValueChange={(value: 'abbondante' | 'normale' | 'scarso' | 'scaduto') => setNewItem({...newItem, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abbondante">Abbondante</SelectItem>
                        <SelectItem value="normale">Normale</SelectItem>
                        <SelectItem value="scarso">Scarso</SelectItem>
                        <SelectItem value="scaduto">Scaduto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addItem} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? 'Aggiungendo...' : 'Aggiungi alla Dispensa'}
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
                <SelectItem value="abbondante">Abbondante</SelectItem>
                <SelectItem value="normale">Normale</SelectItem>
                <SelectItem value="scarso">Scarso</SelectItem>
                <SelectItem value="scaduto">Scaduto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pantry Items */}
      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <Card 
            key={item.id} 
            className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl ${
              item.status === 'scaduto' ? 'border-l-4 border-red-500' :
              isExpiringSoon(item.expiry_date) ? 'border-l-4 border-orange-500' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge variant="secondary">{item.category}</Badge>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    {isExpiringSoon(item.expiry_date) && (
                      <Badge variant="destructive">In scadenza</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>Quantità: {item.quantity} {item.unit}</span>
                    <span>Scadenza: {new Date(item.expiry_date).toLocaleDateString()}</span>
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
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun prodotto trovato</h3>
              <p className="text-muted-foreground mb-4">
                {items.length === 0 ? 'Inizia aggiungendo i tuoi primi prodotti alla dispensa!' : 'Prova a modificare i filtri di ricerca.'}
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

export default Pantry;
