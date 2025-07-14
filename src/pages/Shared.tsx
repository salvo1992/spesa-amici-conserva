
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Share2, Plus, UserPlus, Eye, Settings, Mail, Trash2, Edit3, Facebook, Twitter, MessageCircle, DollarSign, Check, X, Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/lib/cloudflare';

interface SharedList {
  id: string;
  name: string;
  owner: string;
  members: string[];
  itemCount: number;
  lastUpdated: string;
  type: 'shopping' | 'pantry';
  items: SharedItem[];
  total_cost?: number;
}

interface SharedItem {
  id: string;
  name: string;
  quantity: string;
  cost?: number;
  completed: boolean;
  purchased_by?: string;
  added_by: string;
}

const Shared = () => {
  const [sharedLists, setSharedLists] = useState<SharedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<SharedList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListType, setNewListType] = useState<'shopping' | 'pantry'>('shopping');
  const [activeTab, setActiveTab] = useState('lists');
  
  // New item form
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    cost: 0
  });

  useEffect(() => {
    loadSharedLists();
  }, []);

  const loadSharedLists = async () => {
    try {
      setLoading(true);
      const data = await api.getSharedLists();
      // Add mock data for demo
      const mockLists = [
        {
          id: '1',
          name: 'Lista Famiglia',
          owner: 'Maria R.',
          members: ['Te', 'Marco', 'Giulia'],
          itemCount: 12,
          lastUpdated: '2 ore fa',
          type: 'shopping' as const,
          items: [
            { id: '1', name: 'Pane', quantity: '2 pezzi', cost: 3.50, completed: false, purchased_by: '', added_by: 'Maria R.' },
            { id: '2', name: 'Latte', quantity: '1 litro', cost: 1.20, completed: true, purchased_by: 'Marco', added_by: 'Te' }
          ],
          total_cost: 4.70
        },
        {
          id: '2',
          name: 'Conserve Casa',
          owner: 'Te',
          members: ['Maria R.', 'Alessandro'],
          itemCount: 24,
          lastUpdated: '1 giorno fa',
          type: 'pantry' as const,
          items: [],
          total_cost: 0
        }
      ];
      setSharedLists([...data, ...mockLists]);
    } catch (error) {
      console.error('Error loading shared lists:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le liste condivise",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'shopping' ? 'bg-red-500' : 'bg-green-500';
  };

  const getTypeLabel = (type: string) => {
    return type === 'shopping' ? 'Lista Spesa' : 'Conserve';
  };

  const handleInvite = (method: 'email' | 'social') => {
    if (method === 'email' && inviteEmail.trim()) {
      toast({
        title: "Invito inviato!",
        description: `Invito inviato a ${inviteEmail}`,
      });
      setInviteEmail('');
    } else if (method === 'social') {
      // Simulate social sharing
      const shareData = {
        title: 'Unisciti alla mia lista della spesa!',
        text: 'Ciao! Ti ho invitato a condividere la lista della spesa. Scarica l\'app per partecipare!',
        url: window.location.origin
      };
      
      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // Fallback for browsers without Web Share API
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast({
          title: "Link copiato!",
          description: "Condividi il link con i tuoi amici",
        });
      }
    }
  };

  const handleCreateSharedList = async () => {
    if (newListName.trim()) {
      try {
        const newList = await api.createSharedList({
          name: newListName,
          type: newListType,
          members: ['Te'],
          items: []
        });
        
        const listWithMeta = {
          ...newList,
          owner: 'Te',
          members: newList.members || ['Te'], // Ensure members is always an array
          itemCount: 0,
          lastUpdated: 'ora',
          total_cost: 0,
          items: newList.items || [] // Ensure items is always an array
        };
        
        setSharedLists([listWithMeta, ...sharedLists]);
        setNewListName('');
        setShowCreateDialog(false);
        toast({
          title: "Lista creata!",
          description: `${listWithMeta.name} è stata creata con successo`,
        });
      } catch (error) {
        console.error('Error creating shared list:', error);
        toast({
          title: "Errore",
          description: "Impossibile creare la lista",
          variant: "destructive"
        });
      }
    }
  };

  const addItemToList = (listId: string) => {
    if (newItem.name.trim() && newItem.quantity.trim()) {
      const updatedLists = sharedLists.map(list => {
        if (list.id === listId) {
          const newSharedItem: SharedItem = {
            id: Date.now().toString(),
            name: newItem.name,
            quantity: newItem.quantity,
            cost: newItem.cost || 0,
            completed: false,
            added_by: 'Te'
          };
          
          const updatedItems = [...list.items, newSharedItem];
          const totalCost = updatedItems.reduce((sum, item) => sum + (item.cost || 0), 0);
          
          return {
            ...list,
            items: updatedItems,
            itemCount: updatedItems.length,
            total_cost: totalCost,
            lastUpdated: 'ora'
          };
        }
        return list;
      });
      
      setSharedLists(updatedLists);
      setNewItem({ name: '', quantity: '', cost: 0 });
      toast({
        title: "Articolo aggiunto!",
        description: `${newItem.name} è stato aggiunto alla lista`,
      });
    }
  };

  const toggleItemComplete = (listId: string, itemId: string) => {
    const updatedLists = sharedLists.map(list => {
      if (list.id === listId) {
        const updatedItems = list.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              completed: !item.completed,
              purchased_by: !item.completed ? 'Te' : ''
            };
          }
          return item;
        });
        
        return {
          ...list,
          items: updatedItems,
          lastUpdated: 'ora'
        };
      }
      return list;
    });
    
    setSharedLists(updatedLists);
  };

  const removeItem = (listId: string, itemId: string) => {
    const updatedLists = sharedLists.map(list => {
      if (list.id === listId) {
        const updatedItems = list.items.filter(item => item.id !== itemId);
        const totalCost = updatedItems.reduce((sum, item) => sum + (item.cost || 0), 0);
        
        return {
          ...list,
          items: updatedItems,
          itemCount: updatedItems.length,
          total_cost: totalCost,
          lastUpdated: 'ora'
        };
      }
      return list;
    });
    
    setSharedLists(updatedLists);
    toast({
      title: "Articolo rimosso",
      description: "L'articolo è stato rimosso dalla lista",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-accent animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Condivisioni
            </h1>
            <p className="text-muted-foreground mt-1">Gestisci le tue liste condivise</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Nuova Condivisione
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuova Lista Condivisa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Lista</label>
                  <Input
                    placeholder="Es. Lista Famiglia"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo Lista</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newListType}
                    onChange={(e) => setNewListType(e.target.value as 'shopping' | 'pantry')}
                  >
                    <option value="shopping">Lista Spesa</option>
                    <option value="pantry">Conserve</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateSharedList} className="flex-1">
                    Crea Lista
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lists">Le Mie Liste ({sharedLists.length})</TabsTrigger>
          <TabsTrigger value="invite">Invita Amici</TabsTrigger>
        </TabsList>

        <TabsContent value="lists" className="space-y-4">
          {sharedLists.map((list, index) => (
            <Card key={list.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(list.type)}`} />
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{list.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Proprietario: {list.owner} • {list.itemCount} elementi
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ultimo aggiornamento: {list.lastUpdated}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {getTypeLabel(list.type)}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {(list.members || []).slice(0, 3).map((member, index) => (
                          <Avatar key={index} className="w-8 h-8 border-2 border-white">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                              {member.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(list.members || []).length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{(list.members || []).length - 3}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedList(selectedList?.id === list.id ? null : list)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowInviteDialog(true)}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista Items */}
                {selectedList?.id === list.id && (
                  <div className="mt-6 space-y-4">
                    {list.type === 'shopping' && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-green-800">Totale Spesa</h4>
                          <span className="text-xl font-bold text-green-600">
                            €{list.total_cost?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Add new item form */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Aggiungi Articolo</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Input
                          placeholder="Nome articolo"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                        />
                        <Input
                          placeholder="Quantità"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                        />
                        {list.type === 'shopping' && (
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Prezzo €"
                            value={newItem.cost || ''}
                            onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                          />
                        )}
                        <Button onClick={() => addItemToList(list.id)} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Aggiungi
                        </Button>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="space-y-2">
                      {(list.items || []).map((item) => (
                        <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                          item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleItemComplete(list.id, item.id)}
                              className={item.completed ? 'bg-green-100 text-green-700' : ''}
                            >
                              {item.completed ? <Check className="h-4 w-4" /> : <div className="h-4 w-4" />}
                            </Button>
                            <div className={item.completed ? 'line-through text-gray-500' : ''}>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">({item.quantity})</span>
                              {item.cost && item.cost > 0 && (
                                <span className="text-sm text-green-600 ml-2">€{item.cost.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.purchased_by && (
                              <Badge variant="secondary" className="text-xs">
                                Preso da {item.purchased_by}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              da {item.added_by}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(list.id, item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="invite" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-accent" />
                Invita tramite Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email dell'utente da invitare"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => handleInvite('email')} className="bg-accent hover:bg-accent/90 text-white">
                  <Mail className="h-4 w-4 mr-2" />
                  Invita
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                Condividi sui Social
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleInvite('social')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  onClick={() => handleInvite('social')}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  onClick={() => handleInvite('social')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Condividi l'app con i tuoi amici e iniziate a gestire insieme le liste della spesa!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invita Amici</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email dell'amico"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={() => handleInvite('email')} className="flex-1">
                Invia Invito
              </Button>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {sharedLists.length === 0 && (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Nessuna lista condivisa</p>
          <p className="text-sm text-muted-foreground mt-2">
            Inizia creando la tua prima lista condivisa!
          </p>
        </Card>
      )}
    </div>
  );
};

export default Shared;
