
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, Plus, Save, Share2, Check, X, AlertTriangle, 
  ShoppingCart, Package, Users, Calendar, Copy, Mail, 
  Trash2, Edit3, CheckCircle 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, CATEGORIES } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const SharedListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: '',
    priority: 'media' as const,
    cost: 0
  });

  // Mock data per liste demo
  const defaultLists: { [key: string]: any } = {
    'default-1': {
      id: 'default-1',
      owner_id: 'default',
      name: 'Lista Natale 2024',
      type: 'shopping',
      members: ['famiglia@esempio.com', 'amici@esempio.com'],
      items: [
        { id: '1', name: 'Panettone', quantity: '2', category: 'Pane e Dolci', priority: 'alta', cost: 25.90, completed: false },
        { id: '2', name: 'Champagne', quantity: '1', category: 'Bevande', priority: 'media', cost: 45.00, completed: false },
        { id: '3', name: 'Decorazioni', quantity: '10', category: 'Altro', priority: 'bassa', cost: 35.60, completed: true },
        { id: '4', name: 'Regali bambini', quantity: '3', category: 'Altro', priority: 'alta', cost: 44.00, completed: false }
      ],
      total_cost: 150.50,
      created_at: '2024-12-01'
    },
    'default-2': {
      id: 'default-2',
      owner_id: 'default',
      name: 'Ferragosto al Mare',
      type: 'shopping',
      members: ['famiglia@esempio.com'],
      items: [
        { id: '1', name: 'Crema solare', quantity: '2', category: 'Igiene Personale', priority: 'alta', cost: 18.50, completed: true },
        { id: '2', name: 'Bevande fresche', quantity: '6', category: 'Bevande', priority: 'media', cost: 24.90, completed: false },
        { id: '3', name: 'Frutta fresca', quantity: '2kg', category: 'Frutta e Verdura', priority: 'media', cost: 12.80, completed: false },
        { id: '4', name: 'Ghiaccio', quantity: '3', category: 'Altro', priority: 'bassa', cost: 9.00, completed: false }
      ],
      total_cost: 85.20,
      created_at: '2024-08-10'
    }
  };

  const { data: sharedList, isLoading } = useQuery({
    queryKey: ['shared-list', id],
    queryFn: () => {
      if (id && defaultLists[id]) {
        return defaultLists[id];
      }
      return firebaseApi.getSharedList ? firebaseApi.getSharedList(id!) : null;
    },
    enabled: !!id
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string, updates: any }) => {
      if (sharedList?.owner_id === 'default') {
        // Simulazione per liste demo
        return Promise.resolve();
      }
      // Implementazione reale con Firebase
      return firebaseApi.updateSharedListItem ? firebaseApi.updateSharedListItem(id!, itemId, updates) : Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-list', id] });
      toast({ title: "Elemento aggiornato", description: "Le modifiche sono state salvate" });
    }
  });

  const addItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      if (sharedList?.owner_id === 'default') {
        toast({ 
          title: "Lista Demo", 
          description: "Questa è una lista di esempio. Le modifiche non verranno salvate.",
          variant: "default"
        });
        return Promise.resolve();
      }
      return firebaseApi.addSharedListItem ? firebaseApi.addSharedListItem(id!, itemData) : Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-list', id] });
      setShowAddDialog(false);
      setNewItem({ name: '', quantity: '', category: '', priority: 'media', cost: 0 });
      toast({ title: "Elemento aggiunto", description: "Il nuovo elemento è stato aggiunto alla lista" });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (sharedList?.owner_id === 'default') {
        toast({ 
          title: "Lista Demo", 
          description: "Questa è una lista di esempio. Le modifiche non verranno salvate.",
          variant: "default"
        });
        return Promise.resolve();
      }
      return firebaseApi.deleteSharedListItem ? firebaseApi.deleteSharedListItem(id!, itemId) : Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-list', id] });
      toast({ title: "Elemento eliminato", description: "L'elemento è stato rimosso dalla lista" });
    }
  });

  const toggleItemCompletion = (itemId: string, completed: boolean) => {
    updateItemMutation.mutate({ itemId, updates: { completed: !completed } });
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ 
      title: "Link copiato!", 
      description: "Il link di condivisione è stato copiato negli appunti" 
    });
  };

  const shareViaEmail = () => {
    const shareUrl = `${window.location.origin}/shared/${id}`;
    const subject = `Condivisione Lista: ${sharedList?.name}`;
    const body = `Ti invito a collaborare sulla lista "${sharedList?.name}".\n\nAccedi qui: ${shareUrl}\n\nScarica l'app per partecipare alla lista condivisa!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const addNewItem = () => {
    if (!newItem.name.trim()) {
      toast({ 
        title: "Errore", 
        description: "Inserisci il nome del prodotto",
        variant: "destructive" 
      });
      return;
    }
    
    addItemMutation.mutate({
      ...newItem,
      completed: false,
      id: Date.now().toString()
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'bassa': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const TypeIcon = sharedList?.type === 'shopping' ? ShoppingCart : Package;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sharedList) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Lista non trovata</h2>
          <p className="text-muted-foreground mb-4">La lista condivisa che stai cercando non esiste o è stata eliminata.</p>
          <Button onClick={() => navigate('/shared')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Liste Condivise
          </Button>
        </Card>
      </div>
    );
  }

  const completedItems = sharedList.items.filter((item: any) => item.completed).length;

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200/50 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/shared')}
            className="hover:bg-blue-50 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowShareDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Condividi
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <TypeIcon className="h-10 w-10 text-blue-600 animate-pulse" />
            <div className="absolute -inset-1 bg-blue-200/50 rounded-full animate-ping"></div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              {sharedList.name}
            </h1>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 rounded-full">
                {sharedList.type === 'shopping' ? '🛒 Lista Spesa' : '📦 Dispensa'}
              </Badge>
              {sharedList.owner_id === 'default' && (
                <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50 rounded-full">
                  ✨ Esempio
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span>{sharedList.members.length} membri</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span>{new Date(sharedList.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{completedItems}/{sharedList.items.length} completati</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-gray-600">Progresso</span>
            <span className="text-blue-700">{completedItems}/{sharedList.items.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-700 ease-out shadow-inner"
              style={{ width: `${sharedList.items.length > 0 ? (completedItems / sharedList.items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Item Button */}
      <div className="flex justify-center">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button 
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Aggiungi Prodotto</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200/50 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                ➕ Aggiungi Prodotto
              </DialogTitle>
              <DialogDescription>
                Aggiungi un nuovo elemento alla lista condivisa
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-sm font-semibold text-blue-700">Nome Prodotto</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Es. Latte fresco 🥛"
                  className="mt-2 border-2 border-blue-200/50 focus:border-blue-500 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-blue-700">Quantità</Label>
                  <Input
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                    placeholder="Es. 2 litri"
                    className="mt-2 border-2 border-blue-200/50 focus:border-blue-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-blue-700">Costo (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.cost}
                    onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="mt-2 border-2 border-blue-200/50 focus:border-blue-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-blue-700">Categoria</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                    <SelectTrigger className="mt-2 border-2 border-blue-200/50 focus:border-blue-500 rounded-xl">
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
                  <Label className="text-sm font-semibold text-blue-700">Priorità</Label>
                  <Select value={newItem.priority} onValueChange={(value: any) => setNewItem({...newItem, priority: value})}>
                    <SelectTrigger className="mt-2 border-2 border-blue-200/50 focus:border-blue-500 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bassa">🟢 Bassa</SelectItem>
                      <SelectItem value="media">🟡 Media</SelectItem>
                      <SelectItem value="alta">🔴 Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={addNewItem} 
                disabled={addItemMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {addItemMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Aggiungendo...
                  </div>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Aggiungi Prodotto
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items List */}
      <div className="grid gap-4">
        {sharedList.items.map((item: any, index: number) => (
          <Card 
            key={item.id || index} 
            className={`bg-white/90 backdrop-blur-sm border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl animate-fade-in ${
              item.completed ? 'border-green-200/50 bg-green-50/50' : 'border-blue-200/50'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleItemCompletion(item.id, item.completed)}
                    className={`rounded-full p-2 transition-all duration-300 ${
                      item.completed 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    {item.completed ? <Check className="h-4 w-4" /> : <div className="h-4 w-4 border-2 border-current rounded-full" />}
                  </Button>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {item.name}
                    </h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700 rounded-full">
                        📦 {item.quantity}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700 rounded-full">
                        🏷️ {item.category}
                      </Badge>
                      <Badge variant="outline" className={`text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority === 'alta' ? '🔴' : item.priority === 'media' ? '🟡' : '🟢'} {item.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      €{item.cost.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full p-2"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200/50 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent flex items-center gap-2">
              <Share2 className="h-6 w-6 text-blue-600" />
              Condividi Lista
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Condividi "{sharedList.name}" con altre persone per collaborare insieme
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-white/80 rounded-xl border border-blue-200/50">
              <Label className="text-sm font-semibold text-blue-700 mb-2 block">Link di condivisione</Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={`${window.location.origin}/shared/${id}`}
                  className="border-2 border-blue-200/50 rounded-xl bg-gray-50"
                />
                <Button onClick={copyShareLink} variant="outline" className="border-2 border-blue-300 hover:bg-blue-50 rounded-xl">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Gli utenti che aprono questo link potranno scaricare l'app e partecipare alla lista condivisa
              </p>
            </div>
            
            <Button 
              onClick={shareViaEmail} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Mail className="h-5 w-5 mr-2" />
              Condividi via Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Total Cost */}
      {sharedList.items.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200/50 shadow-xl rounded-2xl animate-fade-in">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold text-green-700 mb-2">💰 Costo Totale</h3>
            <div className="text-4xl font-bold text-green-600">
              €{sharedList.items.reduce((sum: number, item: any) => sum + item.cost, 0).toFixed(2)}
            </div>
            <p className="text-green-600 mt-2">
              {sharedList.items.length} prodotti • {completedItems} completati
            </p>
          </CardContent>
        </Card>
      )}

      {sharedList.items.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-200/50 shadow-xl rounded-2xl animate-fade-in">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <TypeIcon className="h-16 w-16 mx-auto text-blue-400 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              Lista vuota
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Aggiungi il primo prodotto per iniziare a collaborare!
            </p>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Aggiungi Primo Prodotto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SharedListDetail;
