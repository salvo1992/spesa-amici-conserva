import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Edit, MessageCircle, Send, Users, Clock, Euro, Package, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  firebaseApi,
  type SharedList, 
  type SharedListItem,
  CATEGORIES 
} from '@/lib/firebase';

const SharedListDetail = () => {
  const { id: listId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [list, setList] = useState<SharedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<SharedListItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '1',
    category: 'Altro',
    priority: 'media' as 'alta' | 'media' | 'bassa',
    cost: 0,
    completed: false
  });

  useEffect(() => {
    if (listId) {
      loadSharedList();
      // Rimosso reload automatico per evitare errori DOM
    }
  }, [listId]);

  const loadSharedList = async () => {
    if (!listId) return;
    
    try {
      setLoading(true);
      const data = await firebaseApi.getSharedListById(listId);
      setList(data);
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile caricare la lista condivisa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!listId || !newItem.name.trim()) {
      toast({
        title: "⚠️ Errore",
        description: "Inserisci il nome del prodotto",
        variant: "destructive"
      });
      return;
    }

    try {
      await firebaseApi.addItemToSharedList(listId, {
        name: newItem.name,
        quantity: newItem.quantity,
        category: newItem.category,
        priority: newItem.priority,
        cost: newItem.cost,
        completed: newItem.completed
      });
      
      toast({
        title: "✅ Prodotto aggiunto",
        description: "Il prodotto è stato aggiunto alla lista condivisa"
      });
      
      setShowAddDialog(false);
      setNewItem({ name: '', quantity: '1', category: 'Altro', priority: 'media', cost: 0, completed: false });
      await loadSharedList();
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile aggiungere il prodotto",
        variant: "destructive"
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!listId || !editingItem) return;

    try {
      await firebaseApi.updateSharedListItem(listId, editingItem.id, {
        name: editingItem.name,
        quantity: editingItem.quantity,
        category: editingItem.category,
        priority: editingItem.priority,
        cost: editingItem.cost
      });
      
      toast({
        title: "✅ Prodotto aggiornato",
        description: "Il prodotto è stato modificato con successo"
      });
      
      setShowEditDialog(false);
      setEditingItem(null);
      await loadSharedList();
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile aggiornare il prodotto",
        variant: "destructive"
      });
    }
  };

  const handleToggleComplete = async (item: SharedListItem) => {
    if (!listId) return;

    try {
      await firebaseApi.updateSharedListItem(listId, item.id, { completed: !item.completed });
      await loadSharedList();
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile aggiornare lo stato del prodotto",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!listId) return;

    try {
      await firebaseApi.deleteSharedListItem(listId, itemId);
      toast({
        title: "🗑️ Prodotto eliminato",
        description: `${itemName} è stato rimosso dalla lista`
      });
      await loadSharedList();
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile eliminare il prodotto",
        variant: "destructive"
      });
    }
  };

  const handleDeleteList = async () => {
    if (!listId) return;

    try {
      await firebaseApi.deleteSharedListForUser(listId);
      toast({
        title: "🗑️ Lista eliminata",
        description: "La lista è stata rimossa dal tuo account"
      });
      navigate('/shared');
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile eliminare la lista",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!listId || !chatMessage.trim()) return;

    try {
      await firebaseApi.addChatMessage(listId, chatMessage);
      setChatMessage('');
      await loadSharedList();
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'media': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'bassa': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento lista condivisa...</p>
        </Card>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Lista non trovata</h2>
          <p className="text-muted-foreground">La lista richiesta non esiste o non hai i permessi per visualizzarla</p>
          <Button onClick={() => navigate('/shared')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle liste
          </Button>
        </Card>
      </div>
    );
  }

  const completedItems = list.items ? list.items.filter(item => item.completed).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header - Mobile Responsive */}
        <div className="mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/shared')}
            className="mb-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle liste
          </Button>
          
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-l-4 border-blue-500">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 sm:gap-3">
                    {list.type === 'shopping' ? '🛒' : '📦'} 
                    <span className="truncate">{list.name}</span>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      {list.members?.length || 0} membri
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                      {completedItems}/{list.items?.length || 0} completati
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="h-3 w-3 sm:h-4 sm:w-4" />
                      €{list.total_cost?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  {list.last_modified_by && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="truncate">Ultimo: {list.last_modified_by}</span>
                    </div>
                  )}
                </div>
                
                {/* Mobile Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Chat ({list.chat_messages?.length || 0})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md mx-auto">
                      <DialogHeader>
                        <DialogTitle className="text-lg">💬 Chat della Lista</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="max-h-48 sm:max-h-60 overflow-y-auto space-y-2">
                          {list.chat_messages?.map((msg) => (
                            <div 
                              key={msg.id} 
                              className={`p-2 rounded-lg text-sm ${msg.user_email === user?.email ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'}`}
                            >
                              <div className="text-xs text-muted-foreground mb-1">
                                {msg.user_name} - {new Date(msg.created_at).toLocaleTimeString()}
                              </div>
                              <div className="text-sm">{msg.message}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Scrivi..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="text-sm"
                          />
                          <Button onClick={handleSendMessage} size="sm">
                            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    onClick={() => {
                      const shareMessage = `🎯 Ti invito sulla lista "${list.name}"! Unisciti: ${window.location.origin}/shared/${listId}`;
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Invita WhatsApp</span>
                    <span className="sm:hidden">📲 Invita</span>
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteList}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Elimina</span>
                    <span className="sm:hidden">🗑️</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Items - Mobile Responsive */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {list.items?.map((item) => (
            <Card key={item.id} className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-l-4 border-blue-500 ${item.completed ? 'opacity-60' : ''} hover:shadow-md transition-shadow duration-200`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => handleToggleComplete(item)}
                    className="w-4 h-4 sm:w-5 sm:h-5 mt-1 shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm sm:text-base ${item.completed ? 'line-through opacity-60' : ''} truncate`}>
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                      <span className="text-xs sm:text-sm text-muted-foreground">{item.quantity}</span>
                      <Badge variant="secondary" className="text-xs h-5">{item.category}</Badge>
                      {item.priority === 'alta' && (
                        <Badge className={getPriorityColor(item.priority) + " text-xs h-5"}>🔥 Alta</Badge>
                      )}
                      <span className="text-xs sm:text-sm font-medium text-green-600">€{item.cost?.toFixed(2) || '0.00'}</span>
                    </div>
                    {item.last_modified_by && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">{item.last_modified_by}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1 sm:gap-2 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-1 sm:p-2"
                      onClick={() => {
                        setEditingItem(item);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 p-1 sm:p-2"
                      onClick={() => handleDeleteItem(item.id, item.name)}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Item Button - Mobile Responsive */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 sm:py-4 rounded-xl shadow-lg text-sm sm:text-base">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Aggiungi Prodotto
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Aggiungi Nuovo Prodotto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Nome Prodotto</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Es. Latte intero"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Quantità</Label>
                  <Input
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                    placeholder="1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Prezzo (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.cost}
                    onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Categoria</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...CATEGORIES.food, ...CATEGORIES.home].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priorità</Label>
                  <Select value={newItem.priority} onValueChange={(value: any) => setNewItem({...newItem, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bassa">Bassa</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddItem} className="w-full">
                Aggiungi Prodotto
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        {editingItem && (
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifica Prodotto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome Prodotto</Label>
                  <Input
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantità</Label>
                    <Input
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({...editingItem, quantity: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Prezzo (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingItem.cost}
                      onChange={(e) => setEditingItem({...editingItem, cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={editingItem.category} onValueChange={(value) => setEditingItem({...editingItem, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...CATEGORIES.food, ...CATEGORIES.home].map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priorità</Label>
                    <Select value={editingItem.priority} onValueChange={(value: any) => setEditingItem({...editingItem, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bassa">Bassa</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleUpdateItem} className="w-full">
                  Salva Modifiche
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default SharedListDetail;