
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Package, Plus, Search, Filter, Calendar, AlertTriangle, CheckCircle, Edit, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const Pantry = () => {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterQuantity, setFilterQuantity] = useState('all');

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'pz',
    expiryDate: '',
    category: 'Altro',
    type: 'Generico'
  });

  const productTypes = [
    'Latticini', 'Carne', 'Pesce', 'Frutta', 'Verdura', 'Cereali', 
    'Conserve', 'Bevande', 'Condimenti', 'Dolci', 'Surgelati', 'Generico'
  ];

  // Elementi di prova aggiornati con tipo
  const [pantryItems, setPantryItems] = useState([
    {
      id: 'pantry-1',
      name: 'Pasta Spaghetti',
      quantity: 2,
      unit: 'kg',
      expiryDate: '2024-12-31',
      category: 'Pasta e Cereali',
      type: 'Cereali',
      status: 'fresh'
    },
    {
      id: 'pantry-2',
      name: 'Pomodori Pelati',
      quantity: 4,
      unit: 'lattine',
      expiryDate: '2025-06-15',
      category: 'Conserve',
      type: 'Conserve',
      status: 'fresh'
    },
    {
      id: 'pantry-3',
      name: 'Parmigiano Reggiano',
      quantity: 1,
      unit: 'kg',
      expiryDate: '2024-02-28',
      category: 'Latticini',
      type: 'Latticini',
      status: 'expiring'
    },
    {
      id: 'pantry-test',
      name: 'Latte Fresco',
      quantity: 2,
      unit: 'litri',
      expiryDate: '2024-01-25',
      category: 'Latticini',
      type: 'Latticini',
      status: 'expiring'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'expiring': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh': return <CheckCircle className="h-4 w-4" />;
      case 'expiring': return <AlertTriangle className="h-4 w-4" />;
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci il nome del prodotto",
        variant: "destructive"
      });
      return;
    }

    const item = {
      ...newItem,
      id: `pantry-${Date.now()}`,
      status: 'fresh'
    };

    setPantryItems(prev => [...prev, item]);
    toast({
      title: "Prodotto aggiunto",
      description: "Il prodotto è stato aggiunto alla dispensa"
    });
    
    setShowAddDialog(false);
    setNewItem({ name: '', quantity: 1, unit: 'pz', expiryDate: '', category: 'Altro', type: 'Generico' });
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({ ...item });
    setShowEditDialog(true);
  };

  const handleUpdateItem = () => {
    setPantryItems(prev => prev.map(item => 
      item.id === editingItem.id ? { ...newItem, id: editingItem.id } : item
    ));
    
    toast({
      title: "Prodotto aggiornato",
      description: "Le modifiche sono state salvate"
    });
    
    setShowEditDialog(false);
    setEditingItem(null);
    setNewItem({ name: '', quantity: 1, unit: 'pz', expiryDate: '', category: 'Altro', type: 'Generico' });
  };

  const handleAddToShoppingList = (item) => {
    toast({
      title: "Aggiunto alla lista della spesa",
      description: `${item.name} è stato aggiunto alla lista della spesa`
    });
  };

  const handleDeleteItem = (itemId) => {
    setPantryItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Prodotto rimosso",
      description: "Il prodotto è stato rimosso dalla dispensa"
    });
  };

  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesQuantity = filterQuantity === 'all' || 
      (filterQuantity === 'low' && item.quantity <= 2) ||
      (filterQuantity === 'medium' && item.quantity > 2 && item.quantity <= 5) ||
      (filterQuantity === 'high' && item.quantity > 5);
    
    return matchesSearch && matchesType && matchesQuantity;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {t('pantry')}
          </h1>
          <div className="text-muted-foreground">
            Gestisci i tuoi prodotti in dispensa
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
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
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    {productTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterQuantity} onValueChange={setFilterQuantity}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Quantità" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte</SelectItem>
                    <SelectItem value="low">Bassa (≤2)</SelectItem>
                    <SelectItem value="medium">Media (3-5)</SelectItem>
                    <SelectItem value="high">Alta (>5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">
                        {item.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          {item.type}
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
                    <span className="text-muted-foreground">Quantità:</span>
                    <span className="font-medium text-foreground">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Scadenza:</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditItem(item)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifica
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleAddToShoppingList(item)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Item Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Card className="card-hover shadow-lg border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2">Aggiungi Prodotto</h3>
                <div className="text-green-100 mb-4">
                  Aggiungi un nuovo prodotto alla tua dispensa
                </div>
                <div className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                  <Plus className="h-4 w-4" />
                  Aggiungi Prodotto
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Prodotto</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="item-name">Nome Prodotto</Label>
                <Input
                  id="item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Es. Pasta, Pomodori..."
                />
              </div>
              
              <div>
                <Label htmlFor="item-type">Tipo Prodotto</Label>
                <Select value={newItem.type} onValueChange={(value) => setNewItem({...newItem, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-quantity">Quantità</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="item-unit">Unità</Label>
                  <Input
                    id="item-unit"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    placeholder="kg, pz, lt..."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="item-expiry">Data di Scadenza</Label>
                <Input
                  id="item-expiry"
                  type="date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddItem}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Aggiungi Prodotto
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annulla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifica Prodotto</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-item-name">Nome Prodotto</Label>
                <Input
                  id="edit-item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-item-type">Tipo Prodotto</Label>
                <Select value={newItem.type} onValueChange={(value) => setNewItem({...newItem, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-item-quantity">Quantità</Label>
                  <Input
                    id="edit-item-quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-item-unit">Unità</Label>
                  <Input
                    id="edit-item-unit"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-item-expiry">Data di Scadenza</Label>
                <Input
                  id="edit-item-expiry"
                  type="date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateItem}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Salva Modifiche
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Annulla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Pantry;
