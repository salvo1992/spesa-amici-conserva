
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Share2, Filter, Calendar, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
  priority: 'alta' | 'media' | 'bassa';
}

const ShoppingList = () => {
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: '1', name: 'Pomodori', quantity: '1 kg', category: 'Verdura', completed: false, priority: 'alta' },
    { id: '2', name: 'Pasta', quantity: '500g', category: 'Cereali', completed: false, priority: 'media' },
    { id: '3', name: 'Mozzarella', quantity: '250g', category: 'Latticini', completed: false, priority: 'alta' },
    { id: '4', name: 'Basilico', quantity: '1 mazzo', category: 'Erbe', completed: false, priority: 'bassa' },
  ]);

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: 'Verdura',
    priority: 'media' as 'alta' | 'media' | 'bassa'
  });

  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [expiryDate, setExpiryDate] = useState('');

  const toggleItem = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item && !item.completed) {
      // Show dialog to set expiry date before moving to pantry
      setSelectedItem(item);
    } else {
      // Just toggle if unchecking
      setItems(items.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      ));
    }
  };

  const moveItemToPantry = () => {
    if (selectedItem && expiryDate) {
      // In a real app, this would add to pantry database
      console.log('Moving to pantry:', selectedItem, 'Expires:', expiryDate);
      
      // Remove from shopping list
      setItems(items.filter(item => item.id !== selectedItem.id));
      
      toast({
        title: "Prodotto aggiunto alle conserve",
        description: `${selectedItem.name} è stato spostato nella dispensa`,
      });
      
      setSelectedItem(null);
      setExpiryDate('');
    }
  };

  const addItem = () => {
    if (newItem.name.trim()) {
      const item: ShoppingItem = {
        id: Date.now().toString(),
        name: newItem.name,
        quantity: newItem.quantity || '1',
        category: newItem.category,
        completed: false,
        priority: newItem.priority
      };
      setItems([...items, item]);
      setNewItem({
        name: '',
        quantity: '',
        category: 'Verdura',
        priority: 'media'
      });
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'bassa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;

  const categories = ['Verdura', 'Frutta', 'Carne', 'Pesce', 'Latticini', 'Cereali', 'Bevande', 'Dolci', 'Altro'];

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-red-50 to-green-50 min-h-screen">
      {/* Header migliorato */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-primary">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
              Lista della Spesa
            </h1>
            <p className="text-muted-foreground mt-1">
              {completedItems}/{totalItems} articoli completati
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hover:bg-primary/10">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-accent/10">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar migliorata */}
      <div className="bg-white rounded-lg p-4 shadow-lg">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progresso</span>
          <span>{Math.round(totalItems > 0 ? (completedItems / totalItems) * 100 : 0)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Add New Item migliorato */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <Input
              placeholder="Aggiungi articolo..."
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="md:col-span-2"
            />
            <Input
              placeholder="Quantità"
              value={newItem.quantity}
              onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
            />
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newItem.category}
              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button onClick={addItem} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shopping Items migliorati */}
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
            item.completed ? 'bg-white/60 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="data-[state=checked]:bg-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.name}
                    </h3>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">{item.quantity}</p>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      {item.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.priority === 'alta' ? 'border-red-500 text-red-700' :
                        item.priority === 'media' ? 'border-yellow-500 text-yellow-700' :
                        'border-green-500 text-green-700'
                      }`}
                    >
                      {item.priority}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Nessun articolo nella lista</p>
            <p className="text-sm text-muted-foreground mt-2">
              Aggiungi il tuo primo articolo per iniziare!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog per scadenza quando si completa un item */}
      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sposta in Conserve</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Stai per spostare <strong>{selectedItem?.name}</strong> nella tua dispensa.</p>
            <div>
              <label className="block text-sm font-medium mb-2">Data di scadenza</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={moveItemToPantry} 
                disabled={!expiryDate}
                className="flex-1 bg-primary hover:bg-primary/90"
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
