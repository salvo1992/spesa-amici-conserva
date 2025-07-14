
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Share2, Filter } from 'lucide-react';

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
    { id: '2', name: 'Pasta', quantity: '500g', category: 'Dispensa', completed: true, priority: 'media' },
    { id: '3', name: 'Mozzarella', quantity: '250g', category: 'Latticini', completed: false, priority: 'alta' },
    { id: '4', name: 'Basilico', quantity: '1 mazzo', category: 'Erbe', completed: false, priority: 'bassa' },
  ]);

  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addItem = () => {
    if (newItem.trim()) {
      const item: ShoppingItem = {
        id: Date.now().toString(),
        name: newItem,
        quantity: newQuantity || '1',
        category: 'Altro',
        completed: false,
        priority: 'media'
      };
      setItems([...items, item]);
      setNewItem('');
      setNewQuantity('');
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

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lista della Spesa</h1>
          <p className="text-muted-foreground">
            {completedItems}/{totalItems} articoli completati
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
        />
      </div>

      {/* Add New Item */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Aggiungi articolo..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Quantità"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="w-24"
            />
            <Button onClick={addItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shopping Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className={`border-border ${item.completed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
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
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Nessun articolo nella lista</p>
            <p className="text-sm text-muted-foreground mt-1">
              Aggiungi il tuo primo articolo per iniziare!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShoppingList;
