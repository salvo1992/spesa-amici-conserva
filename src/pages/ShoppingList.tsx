
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Trash2, Check, X, Share2, Package, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const ShoppingList = () => {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPantryDialog, setShowPantryDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [checkedItems, setCheckedItems] = useState<{[key: string]: boolean}>({});
  
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'pz',
    category: 'Altro',
    type: 'Generico',
    priority: 'normal'
  });

  const [pantryItem, setPantryItem] = useState({
    expiryDate: '',
    type: 'Generico'
  });

  const productTypes = [
    'Latticini', 'Carne', 'Pesce', 'Frutta', 'Verdura', 'Cereali', 
    'Conserve', 'Bevande', 'Condimenti', 'Dolci', 'Surgelati', 'Generico'
  ];

  // Lista aggiornata con tipo
  const [shoppingItems, setShoppingItems] = useState([
    {
      id: 'shop-1',
      name: 'Latte Fresco',
      quantity: 2,
      unit: 'litri',
      category: 'Latticini',
      type: 'Latticini',
      priority: 'normal'
    },
    {
      id: 'shop-2',
      name: 'Pane Integrale',
      quantity: 1,
      unit: 'pagnotta',
      category: 'Panetteria',
      type: 'Cereali',
      priority: 'high'
    },
    {
      id: 'shop-3',
      name: 'Mozzarella di Bufala',
      quantity: 3,
      unit: 'confezioni',
      category: 'Latticini',
      type: 'Latticini',
      priority: 'normal'
    },
    {
      id: 'shop-test',
      name: 'Pasta Integrale',
      quantity: 2,
      unit: 'kg',
      category: 'Pasta e Cereali',
      type: 'Cereali',
      priority: 'normal'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const toggleItemCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
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
      id: `shop-${Date.now()}`
    };

    setShoppingItems(prev => [...prev, item]);
    toast({
      title: "Prodotto aggiunto",
      description: "Il prodotto è stato aggiunto alla lista della spesa"
    });
    
    setShowAddDialog(false);
    setNewItem({ name: '', quantity: 1, unit: 'pz', category: 'Altro', type: 'Generico', priority: 'normal' });
  };

  const handleAddToPantry = (item) => {
    setSelectedItem(item);
    setPantryItem({ expiryDate: '', type: item.type });
    setShowPantryDialog(true);
  };

  const confirmAddToPantry = () => {
    toast({
      title: "Aggiunto alla dispensa!",
      description: `${selectedItem.name} è stato aggiunto alla dispensa con scadenza ${new Date(pantryItem.expiryDate).toLocaleDateString()}`
    });
    setShowPantryDialog(false);
    setSelectedItem(null);
  };

  const handleShareWhatsApp = () => {
    const appName = "Food Manager - Il Vikingo del Web";
    const appUrl = window.location.origin;
    const uncheckedItems = shoppingItems.filter(item => !checkedItems[item.id]);
    const itemsList = uncheckedItems.map(item => `• ${item.name} (${item.quantity} ${item.unit})`).join('\n');
    
    const text = `🛒 *${appName}*\n\n📝 *Lista della Spesa:*\n\n${itemsList}\n\n📱 Gestisci le tue liste: ${appUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleShareList = () => {
    const uncheckedItems = shoppingItems.filter(item => !checkedItems[item.id]);
    const itemsList = uncheckedItems.map(item => `• ${item.name} (${item.quantity} ${item.unit})`).join('\n');
    
    const text = `🛒 Food Manager - Lista della Spesa\n\n${itemsList}\n\n📱 App: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Lista condivisa!",
      description: "Il testo della lista è stato copiato negli appunti"
    });
  };

  // Ordina per tipo
  const sortedItems = [...shoppingItems].sort((a, b) => a.type.localeCompare(b.type));
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = shoppingItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {t('shoppingList')}
          </h1>
          <div className="text-muted-foreground mb-4">
            La tua lista della spesa intelligente
          </div>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
              {completedCount}/{totalCount} completati
            </Badge>
            <Button variant="outline" size="sm" onClick={handleShareList}>
              <Share2 className="h-4 w-4 mr-2" />
              Condividi Lista
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="text-green-600 hover:text-green-700">
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Shopping Items */}
        <div className="space-y-4 mb-8">
          {sortedItems.map((item) => (
            <Card key={item.id} className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 border-l-4 border-blue-500 ${checkedItems[item.id] ? 'opacity-60' : 'hover:shadow-xl'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={() => toggleItemCheck(item.id)}
                    className="w-5 h-5"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold text-foreground ${checkedItems[item.id] ? 'line-through' : ''}`}>
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit}
                          </span>
                          <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                            {item.type}
                          </Badge>
                          {item.priority === 'high' && (
                            <Badge className={getPriorityColor(item.priority)}>
                              Priorità Alta
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {checkedItems[item.id] ? (
                          <div className="flex items-center text-green-600 dark:text-green-400">
                            <Check className="h-5 w-5 mr-1" />
                            <span className="text-sm font-medium">Completato</span>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAddToPantry(item)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Dispensa
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Item Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Card className="card-hover shadow-lg border-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2">Aggiungi Prodotto</h3>
                <div className="text-blue-100 mb-4">
                  Aggiungi un nuovo prodotto alla lista
                </div>
                <div className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                  <Plus className="h-4 w-4" />
                  Aggiungi alla Lista
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
                  placeholder="Es. Latte, Pane, Frutta..."
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
                <Label htmlFor="item-priority">Priorità</Label>
                <Select value={newItem.priority} onValueChange={(value) => setNewItem({...newItem, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddItem}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Aggiungi alla Lista
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annulla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add to Pantry Dialog */}
        <Dialog open={showPantryDialog} onOpenChange={setShowPantryDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aggiungi alla Dispensa</DialogTitle>
            </DialogHeader>
            
            {selectedItem && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-foreground">{selectedItem.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.quantity} {selectedItem.unit} - {selectedItem.type}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="pantry-expiry">Data di Scadenza</Label>
                  <Input
                    id="pantry-expiry"
                    type="date"
                    value={pantryItem.expiryDate}
                    onChange={(e) => setPantryItem({...pantryItem, expiryDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Tipo Prodotto</Label>
                  <Select value={pantryItem.type} onValueChange={(value) => setPantryItem({...pantryItem, type: value})}>
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
                
                <div className="flex gap-2">
                  <Button
                    onClick={confirmAddToPantry}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!pantryItem.expiryDate}
                  >
                    Aggiungi alla Dispensa
                  </Button>
                  <Button variant="outline" onClick={() => setShowPantryDialog(false)}>
                    Annulla
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

export default ShoppingList;
