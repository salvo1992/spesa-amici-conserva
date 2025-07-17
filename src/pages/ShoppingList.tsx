
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Trash2, Check, X, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const ShoppingList = () => {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [checkedItems, setCheckedItems] = useState<{[key: string]: boolean}>({});
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'pz',
    category: 'Altro'
  });

  // Lista di prova predefinita
  const defaultItems = [
    {
      id: 'shop-1',
      name: 'Latte Fresco',
      quantity: 2,
      unit: 'litri',
      category: 'Latticini',
      priority: 'normal'
    },
    {
      id: 'shop-2',
      name: 'Pane Integrale',
      quantity: 1,
      unit: 'pagnotta',
      category: 'Panetteria',
      priority: 'high'
    },
    {
      id: 'shop-3',
      name: 'Mozzarella di Bufala',
      quantity: 3,
      unit: 'confezioni',
      category: 'Latticini',
      priority: 'normal'
    },
    {
      id: 'shop-4',
      name: 'Pomodori San Marzano',
      quantity: 2,
      unit: 'kg',
      category: 'Frutta e Verdura',
      priority: 'high'
    },
    {
      id: 'shop-5',
      name: 'Basilico Fresco',
      quantity: 1,
      unit: 'mazzo',
      category: 'Erbe Aromatiche',
      priority: 'normal'
    }
  ];

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

    toast({
      title: "Prodotto aggiunto",
      description: "Il prodotto è stato aggiunto alla lista della spesa"
    });
    
    setShowAddDialog(false);
    setNewItem({ name: '', quantity: 1, unit: 'pz', category: 'Altro' });
  };

  const handleShareList = () => {
    toast({
      title: "Lista condivisa!",
      description: "Il link alla lista è stato copiato negli appunti"
    });
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = defaultItems.length;

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
          </div>
        </div>

        {/* Shopping Items */}
        <div className="space-y-4 mb-8">
          {defaultItems.map((item) => (
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
                            {item.category}
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
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
      </div>
    </div>
  );
};

export default ShoppingList;
