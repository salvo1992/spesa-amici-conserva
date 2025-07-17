
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Package, Plus, Calendar, AlertTriangle, Search, Filter, Trash2, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, CATEGORIES, type PantryItem } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const Pantry = () => {
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'pz',
    category: '',
    expiry_date: '',
    status: 'normale' as const
  });

  const queryClient = useQueryClient();

  const { data: pantryItems = [], isLoading } = useQuery({
    queryKey: ['pantry'],
    queryFn: firebaseApi.getPantryItems,
    enabled: isAuthenticated
  });

  const createMutation = useMutation({
    mutationFn: firebaseApi.createPantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
      setShowAddDialog(false);
      setNewItem({
        name: '', quantity: 1, unit: 'pz', category: '', 
        expiry_date: '', status: 'normale'
      });
      toast({ title: "Prodotto aggiunto", description: "Il prodotto è stato aggiunto alla dispensa" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: firebaseApi.deletePantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
      toast({ title: "Prodotto rimosso", description: "Il prodotto è stato rimosso dalla dispensa" });
    }
  });

  const createItem = () => {
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

  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abbondante': return 'bg-green-100 text-green-700 border-green-300';
      case 'normale': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'scarso': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'scaduto': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Scaduto', color: 'text-red-600' };
    if (diffDays <= 3) return { text: `Scade tra ${diffDays} giorni`, color: 'text-orange-600' };
    if (diffDays <= 7) return { text: `Scade tra ${diffDays} giorni`, color: 'text-yellow-600' };
    return { text: `Scade il ${expiry.toLocaleDateString()}`, color: 'text-green-600' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 min-h-screen">
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
                {filteredItems.length} prodotti in dispensa
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
                <DialogTitle>Aggiungi Nuovo Prodotto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome Prodotto</Label>
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Es. Pasta, Latte, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantità</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label>Unità</Label>
                    <Select value={newItem.unit} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pz">Pezzi</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="g">Grammi</SelectItem>
                        <SelectItem value="l">Litri</SelectItem>
                        <SelectItem value="ml">Millilitri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                  <Label>Data Scadenza</Label>
                  <Input
                    type="date"
                    value={newItem.expiry_date}
                    onChange={(e) => setNewItem({...newItem, expiry_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Stato</Label>
                  <Select value={newItem.status} onValueChange={(value: any) => setNewItem({...newItem, status: value})}>
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

                <Button onClick={createItem} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? 'Salvando...' : 'Salva Prodotto'}
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
                placeholder="Cerca prodotti..."
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
                  {CATEGORIES.food.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
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
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const expiryStatus = getExpiryStatus(item.expiry_date);
          return (
            <Card 
              key={item.id} 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg mb-2">{item.name}</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="text-lg font-semibold">
                    {item.quantity} {item.unit}
                  </div>
                  
                  <div className={`text-sm flex items-center gap-2 ${expiryStatus.color}`}>
                    <Calendar className="h-4 w-4" />
                    <span>{expiryStatus.text}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredItems.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun prodotto trovato</h3>
            <p className="text-muted-foreground mb-4">
              Aggiungi i tuoi primi prodotti alla dispensa!
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Prodotto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pantry;
