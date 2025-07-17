
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Trash2, Check, X, Share2, Package, MessageCircle, Sparkles } from 'lucide-react';
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
    category: 'Altro',
    type: 'Generico',
    expiryDate: ''
  });

  // Lista ordinata per tipo
  const defaultItems = [
    {
      id: 'shop-1',
      name: 'Latte Fresco',
      quantity: 2,
      unit: 'litri',
      category: 'Latticini',
      priority: 'normal' ,
      type: 'Fresco'
    },
    {
      id: 'shop-2',
      name: 'Pane Integrale',
      quantity: 1,
      unit: 'pagnotta',
      category: 'Panetteria',
      priority: 'high',
      type: 'Panetteria'
    },
    {
      id: 'shop-3',
      name: 'Mozzarella di Bufala',
      quantity: 3,
      unit: 'confezioni',
      category: 'Latticini',
      priority: 'normal',
      type: 'Fresco'
    },
    {
      id: 'shop-4',
      name: 'Pomodori San Marzano',
      quantity: 2,
      unit: 'kg',
      category: 'Frutta e Verdura',
      priority: 'high',
      type: 'Fresco'
    },
    {
      id: 'shop-5',
      name: 'Basilico Fresco',
      quantity: 1,
      unit: 'mazzo',
      category: 'Erbe Aromatiche',
      priority: 'normal',
      type: 'Fresco'
    }
  ].sort((a, b) => a.type.localeCompare(b.type));

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

  const handleAddToPantry = (item: any) => {
    toast({
      title: "Aggiunto alla dispensa",
      description: `${item.name} è stato aggiunto alla dispensa con scadenza automatica`
    });
  };

  const handleWhatsAppShare = () => {
    const itemsList = defaultItems
      .filter(item => !checkedItems[item.id])
      .map(item => `• ${item.name} - ${item.quantity} ${item.unit}`)
      .join('\n');
    
    const message = `🛒 *Lista della Spesa - Food Manager*\n\n${itemsList}\n\n📱 Condiviso da Food Manager - Il Vikingo del Web`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Lista condivisa su WhatsApp",
      description: "La lista è stata aperta su WhatsApp"
    });
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
    setNewItem({ name: '', quantity: 1, unit: 'pz', category: 'Altro', type: 'Generico', expiryDate: '' });
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = defaultItems.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header migliorato con animazioni */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <ShoppingCart className="h-12 w-12 text-blue-600 animate-bounce" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{totalCount - completedCount}</span>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 animate-slide-up">
            🛒 Lista della Spesa
          </h1>
          <div className="text-lg text-muted-foreground mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
            La tua lista intelligente per non dimenticare nulla
          </div>
          <div className="flex items-center justify-center gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <Badge variant="outline" className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 border-green-300 px-4 py-2 text-sm font-semibold">
              <Check className="h-4 w-4 mr-2" />
              {completedCount}/{totalCount} completati
            </Badge>
            <Button variant="outline" size="sm" onClick={handleWhatsAppShare} className="hover:scale-105 transition-all duration-300 hover:shadow-lg border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20">
              <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
              Condividi su WhatsApp
            </Button>
          </div>
        </div>

        {/* Shopping Items */}
        <div className="space-y-4 mb-8">
          {defaultItems.map((item, index) => (
            <Card key={item.id} className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 border-l-4 border-blue-500 ${checkedItems[item.id] ? 'opacity-60' : 'hover:shadow-xl hover:-translate-y-1'} animate-fade-in`} style={{animationDelay: `${index * 0.1}s`}}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={() => toggleItemCheck(item.id)}
                    className="w-5 h-5 transition-all duration-300 hover:scale-110"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold text-foreground transition-all duration-300 ${checkedItems[item.id] ? 'line-through opacity-60' : ''}`}>
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit}
                          </span>
                          <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:scale-105 transition-transform duration-200">
                            {item.category}
                          </Badge>
                          {item.priority === 'high' && (
                            <Badge className={getPriorityColor(item.priority) + " animate-pulse"}>
                              Priorità Alta
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {checkedItems[item.id] ? (
                          <div className="flex items-center text-green-600 dark:text-green-400 animate-fade-in">
                            <Check className="h-5 w-5 mr-1 animate-bounce" />
                            <span className="text-sm font-medium">Completato</span>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-300 hover:scale-105 transition-all duration-300 hover:shadow-md"
                              onClick={() => handleAddToPantry(item)}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Dispensa
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105 transition-all duration-300">
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

        {/* Bottone Aggiungi migliorato con animazioni spettacolari */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <div className="relative group animate-fade-in" style={{animationDelay: '0.5s'}}>
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white cursor-pointer transition-all duration-500 hover:scale-105 hover:rotate-1 shadow-2xl hover:shadow-3xl border-0 group-hover:shadow-blue-500/25">
                {/* Effetto particelle animate */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-6 w-1 h-1 bg-yellow-300 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-4 right-4 w-1 h-1 bg-green-300 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
                </div>
                
                {/* Overlay gradient animato */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <CardContent className="relative p-8 text-center">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all duration-500"></div>
                    <div className="relative bg-white/20 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                      <Plus className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                      <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 group-hover:scale-105 transition-transform duration-300">
                    Aggiungi Prodotto
                  </h3>
                  
                  <div className="text-blue-100 mb-6 group-hover:text-white transition-colors duration-300">
                    Tocca qui per aggiungere un nuovo prodotto alla tua lista
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm group-hover:bg-white/30 transition-all duration-500"></div>
                    <div className="relative bg-white text-blue-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-3 group-hover:scale-105">
                      <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                      <span>Aggiungi alla Lista</span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🛍️ Aggiungi Nuovo Prodotto
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Compila i dettagli del prodotto che vuoi aggiungere alla tua lista della spesa
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="item-name" className="text-sm font-semibold">Nome Prodotto</Label>
                <Input
                  id="item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Es. Latte, Pane, Frutta..."
                  className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="item-type" className="text-sm font-semibold">Tipo Prodotto</Label>
                <Select value={newItem.type} onValueChange={(value) => setNewItem({...newItem, type: value})}>
                  <SelectTrigger className="transition-all duration-300 hover:scale-105">
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fresco">🥬 Fresco</SelectItem>
                    <SelectItem value="Surgelato">🧊 Surgelato</SelectItem>
                    <SelectItem value="Conserva">🥫 Conserva</SelectItem>
                    <SelectItem value="Bevanda">🥤 Bevanda</SelectItem>
                    <SelectItem value="Panetteria">🍞 Panetteria</SelectItem>
                    <SelectItem value="Latticini">🥛 Latticini</SelectItem>
                    <SelectItem value="Carne">🥩 Carne</SelectItem>
                    <SelectItem value="Pesce">🐟 Pesce</SelectItem>
                    <SelectItem value="Generico">📦 Generico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-quantity" className="text-sm font-semibold">Quantità</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    className="transition-all duration-300 focus:scale-105"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-unit" className="text-sm font-semibold">Unità</Label>
                  <Input
                    id="item-unit"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                    placeholder="kg, pz, lt..."
                    className="transition-all duration-300 focus:scale-105"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddItem}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi alla Lista
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                  className="transition-all duration-300 hover:scale-105"
                >
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
