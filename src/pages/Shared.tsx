import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Share2, Plus, Users, ShoppingCart, Package, Calendar, Trash2, UserPlus, CheckCircle, ExternalLink, Bell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, type SharedList } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ListRequestsModal from '@/components/ListRequestsModal';

const Shared = () => {
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const navigate = useNavigate();

  const [newList, setNewList] = useState({
    name: '',
    type: 'shopping' as const,
    members: ['']
  });

  // Liste di default
  const defaultLists = [
    {
      id: 'default-1',
      owner_id: 'default',
      name: 'Lista Natale 2024',
      type: 'shopping' as const,
      members: ['famiglia@esempio.com', 'amici@esempio.com'],
      items: [
        { name: 'Panettone', completed: false },
        { name: 'Champagne', completed: false },
        { name: 'Decorazioni', completed: true },
        { name: 'Regali bambini', completed: false }
      ],
      total_cost: 150.50,
      created_at: '2024-12-01'
    },
    {
      id: 'default-2',
      owner_id: 'default',
      name: 'Ferragosto al Mare',
      type: 'shopping' as const,
      members: ['famiglia@esempio.com'],
      items: [
        { name: 'Crema solare', completed: true },
        { name: 'Bevande fresche', completed: false },
        { name: 'Frutta fresca', completed: false },
        { name: 'Ghiaccio', completed: false }
      ],
      total_cost: 85.20,
      created_at: '2024-08-10'
    }
  ];

  const queryClient = useQueryClient();

  const { data: userSharedLists = [], isLoading } = useQuery({
    queryKey: ['shared-lists'],
    queryFn: firebaseApi.getSharedLists,
    enabled: isAuthenticated
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['list-requests', 'pending'],
    queryFn: firebaseApi.getPendingListRequests,
    enabled: isAuthenticated
  });

  // Combina liste default con quelle dell'utente
  const allSharedLists = [...defaultLists, ...userSharedLists];

  const createMutation = useMutation({
    mutationFn: firebaseApi.createSharedList,
    onSuccess: () => {
      // Delay dialog close to prevent DOM race conditions
      setTimeout(() => {
        setShowAddDialog(false);
        setNewList({ name: '', type: 'shopping', members: [''] });
      }, 100);
      
      queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
      toast({ title: "Lista condivisa creata", description: "La lista è stata creata e condivisa con successo!" });
    },
    onError: (error) => {
      console.error('Error creating shared list:', error);
      toast({ 
        title: "Errore", 
        description: "Impossibile creare la lista condivisa",
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: firebaseApi.deleteSharedList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
      toast({ title: "Lista eliminata", description: "La lista condivisa è stata eliminata" });
    },
    onError: (error) => {
      console.error('Error deleting shared list:', error);
      toast({ 
        title: "Errore", 
        description: "Impossibile eliminare la lista",
        variant: "destructive" 
      });
    }
  });

  const addMember = () => {
    setNewList({...newList, members: [...newList.members, '']});
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...newList.members];
    updated[index] = value;
    setNewList({...newList, members: updated});
  };

  const createSharedList = () => {
    if (!newList.name.trim()) {
      toast({ 
        title: "Errore", 
        description: "Inserisci un nome per la lista",
        variant: "destructive" 
      });
      return;
    }
    
    if (createMutation.isPending) return; // Prevent double-click
    
    createMutation.mutate({
      name: newList.name,
      type: newList.type,
      owner_id: '', // Sarà impostato da createSharedList
      members: newList.members.filter(m => m.trim()),
      items: [],
      total_cost: 0
    });
  };

  const handleOpenList = (list: any) => {
    console.log('Opening list:', list);
    navigate(`/shared/${list.id}`);
  };

  const handleShareList = (list: any) => {
    setSelectedList(list);
    setShowShareDialog(true);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared/${selectedList?.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ 
      title: "Link copiato!", 
      description: "Il link di condivisione è stato copiato negli appunti" 
    });
  };

  const shareViaWhatsApp = () => {
    const shareMessage = `Ti invito a collaborare sulla lista "${selectedList?.name}"! Scarica l'app e unisciti: ${window.location.origin}/shared/${selectedList?.id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getTypeIcon = (type: string) => {
    return type === 'shopping' ? ShoppingCart : Package;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Ottimizzato */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-blue-200/30">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Share2 className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                  Liste Condivise
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  {allSharedLists.length} liste collaborative • Collaborazione in tempo reale
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nuova Lista
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                      Crea Lista Condivisa
                    </DialogTitle>
                    <DialogDescription>
                      Collabora con famiglia e amici su liste condivise in tempo reale
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="text-sm font-medium">Nome Lista</Label>
                      <Input
                        value={newList.name}
                        onChange={(e) => setNewList({...newList, name: e.target.value})}
                        placeholder="Es. Spesa della settimana"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Tipo Lista</Label>
                      <Select value={newList.type} onValueChange={(value: any) => setNewList({...newList, type: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shopping">🛒 Lista Spesa</SelectItem>
                          <SelectItem value="pantry">📦 Dispensa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium">Membri (email)</Label>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          onClick={addMember}
                        >
                          <UserPlus className="h-4 w-4 mr-1" /> Aggiungi
                        </Button>
                      </div>
                      {newList.members.map((member, index) => (
                        <Input
                          key={index}
                          value={member}
                          onChange={(e) => updateMember(index, e.target.value)}
                          placeholder="email@esempio.com"
                          className="mb-2"
                        />
                      ))}
                    </div>

                    <Button 
                      onClick={createSharedList} 
                      disabled={createMutation.isPending} 
                      className="w-full"
                    >
                      {createMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Crea e Condividi
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              {isAuthenticated && (
                <Button 
                  onClick={() => setShowRequestsModal(true)}
                  variant="outline"
                  size="lg"
                  className="relative"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Richieste
                  {pendingRequests.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {pendingRequests.length}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Grid Liste Ottimizzato */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allSharedLists.map((list) => {
            const TypeIcon = getTypeIcon(list.type);
            const completedItems = list.items.filter(item => item.completed).length;
            const progressPercent = list.items.length > 0 ? (completedItems / list.items.length) * 100 : 0;
            
            return (
              <Card 
                key={list.id} 
                className="bg-white/95 backdrop-blur-sm border border-blue-200/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden group"
              >
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-3 flex items-center gap-2">
                        <TypeIcon className="h-5 w-5 text-blue-600" />
                        {list.name}
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {list.type === 'shopping' ? '🛒 Spesa' : '📦 Dispensa'}
                        </Badge>
                        {list.owner_id === 'default' && (
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                            Demo
                          </Badge>
                        )}
                      </div>
                    </div>
                    {list.owner_id !== 'default' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteMutation.mutate(list.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-3 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{list.members.length} membri</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>{new Date(list.created_at).toLocaleDateString('it-IT')}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completato</span>
                      <span className="font-medium">{completedItems}/{list.items.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {list.total_cost > 0 && (
                    <div className="text-lg font-semibold text-green-600">
                      €{list.total_cost.toFixed(2)}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Collaboratori:</div>
                    <div className="flex flex-wrap gap-1">
                      {list.members.slice(0, 3).map((member, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="text-xs"
                        >
                          {member.split('@')[0]}
                        </Badge>
                      ))}
                      {list.members.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{list.members.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => handleOpenList(list)}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apri Lista
                    </Button>
                    <Button 
                      onClick={() => handleShareList(list)}
                      variant="outline"
                      size="sm"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Share Dialog */}
      {selectedList && (
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Condividi Lista</DialogTitle>
              <DialogDescription>
                Condividi "{selectedList.name}" con altre persone
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button onClick={copyShareLink} className="w-full" variant="outline">
                Copia Link
              </Button>
              <Button onClick={shareViaWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white">
                Condividi su WhatsApp
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Requests Modal */}
      {showRequestsModal && (
        <ListRequestsModal 
          isOpen={showRequestsModal} 
          onClose={() => setShowRequestsModal(false)} 
        />
      )}
    </div>
  );
};

export default Shared;