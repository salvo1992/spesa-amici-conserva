import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Share2, Plus, Users, ShoppingCart, Package, Calendar, Trash2, UserPlus, CheckCircle, ExternalLink, Bell, Copy, MessageSquare } from 'lucide-react';
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

  // Liste di default ottimizzate
  const defaultLists = useMemo(() => [
    {
      id: 'default-1',
      owner_id: 'default',
      name: 'Lista Natale 2024',
      type: 'shopping' as const,
      members: ['famiglia@esempio.com', 'amici@esempio.com'],
      items: [
        { id: '1', name: 'Panettone', completed: false, quantity: '1', category: 'Dolci', priority: 'media' as const, cost: 15 },
        { id: '2', name: 'Champagne', completed: false, quantity: '1', category: 'Bevande', priority: 'alta' as const, cost: 25 },
        { id: '3', name: 'Decorazioni', completed: true, quantity: '1', category: 'Casa', priority: 'bassa' as const, cost: 20 },
        { id: '4', name: 'Regali bambini', completed: false, quantity: '3', category: 'Regali', priority: 'alta' as const, cost: 90 }
      ],
      total_cost: 150.50,
      created_at: '2024-12-01',
      chat_messages: []
    },
    {
      id: 'default-2',
      owner_id: 'default',
      name: 'Ferragosto al Mare',
      type: 'shopping' as const,
      members: ['famiglia@esempio.com'],
      items: [
        { id: '1', name: 'Crema solare', completed: true, quantity: '2', category: 'Cura personale', priority: 'alta' as const, cost: 15 },
        { id: '2', name: 'Bevande fresche', completed: false, quantity: '6', category: 'Bevande', priority: 'media' as const, cost: 12 },
        { id: '3', name: 'Frutta fresca', completed: false, quantity: '1kg', category: 'Frutta', priority: 'media' as const, cost: 8 },
        { id: '4', name: 'Ghiaccio', completed: false, quantity: '2kg', category: 'Altro', priority: 'bassa' as const, cost: 4 }
      ],
      total_cost: 39.00,
      created_at: '2024-08-10',
      chat_messages: []
    }
  ], []);

  const queryClient = useQueryClient();

  const { data: userSharedLists = [], isLoading } = useQuery({
    queryKey: ['shared-lists'],
    queryFn: firebaseApi.getSharedLists,
    enabled: isAuthenticated,
    refetchInterval: false, // Disabilita refetch automatico
    staleTime: 5 * 60 * 1000, // 5 minuti
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['list-requests', 'pending'],
    queryFn: firebaseApi.getPendingListRequests,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Solo ogni 30 secondi per le richieste
    staleTime: 10 * 1000
  });

  // Combina liste default con quelle dell'utente
  const allSharedLists = useMemo(() => [...defaultLists, ...userSharedLists], [defaultLists, userSharedLists]);

  const createMutation = useMutation({
    mutationFn: firebaseApi.createSharedList,
    onSuccess: () => {
      // Delay per prevenire race conditions DOM
      setTimeout(() => {
        setShowAddDialog(false);
        setNewList({ name: '', type: 'shopping', members: [''] });
      }, 150);
      
      queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
      toast({ 
        title: "🎉 Lista condivisa creata", 
        description: "Le richieste di condivisione sono state inviate!" 
      });
    },
    onError: (error) => {
      console.error('Error creating shared list:', error);
      toast({ 
        title: "❌ Errore", 
        description: "Impossibile creare la lista condivisa",
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: firebaseApi.deleteSharedList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
      toast({ title: "🗑️ Lista eliminata", description: "La lista è stata rimossa dal tuo account" });
    },
    onError: (error) => {
      console.error('Error deleting shared list:', error);
      toast({ 
        title: "❌ Errore", 
        description: "Impossibile eliminare la lista",
        variant: "destructive" 
      });
    }
  });

  const addMember = useCallback(() => {
    setNewList(prev => ({...prev, members: [...prev.members, '']}));
  }, []);

  const updateMember = useCallback((index: number, value: string) => {
    setNewList(prev => {
      const updated = [...prev.members];
      updated[index] = value;
      return {...prev, members: updated};
    });
  }, []);

  const createSharedList = useCallback(() => {
    if (!newList.name.trim()) {
      toast({ 
        title: "⚠️ Errore", 
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
  }, [newList, createMutation]);

  const handleOpenList = useCallback((list: any) => {
    navigate(`/shared/${list.id}`);
  }, [navigate]);

  const handleShareList = useCallback((list: any) => {
    setSelectedList(list);
    setShowShareDialog(true);
  }, []);

  const copyShareLink = useCallback(() => {
    const shareUrl = `${window.location.origin}/shared/${selectedList?.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ 
      title: "📋 Link copiato!", 
      description: "Il link di condivisione è stato copiato negli appunti" 
    });
  }, [selectedList]);

  const shareViaWhatsApp = useCallback(() => {
    const shareMessage = `🎯 Ti invito a collaborare sulla lista "${selectedList?.name}"!\n\n📱 Scarica l'app e unisciti qui:\n${window.location.origin}/shared/${selectedList?.id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
  }, [selectedList]);

  const getTypeIcon = useCallback((type: string) => {
    return type === 'shopping' ? ShoppingCart : Package;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground text-lg">Caricamento liste condivise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Migliorato */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-xl border border-white/20 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                  Liste Condivise
                </h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base lg:text-lg">
                  {allSharedLists.length} liste collaborative • Collaborazione in tempo reale
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  >
                    <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="hidden sm:inline">Nuova Lista</span>
                    <span className="sm:hidden">Nuova</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm rounded-2xl mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
                      🎯 Crea Lista Condivisa
                    </DialogTitle>
                    <DialogDescription className="text-center">
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
                        <Label className="text-sm font-medium">Email Collaboratori</Label>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          onClick={addMember}
                          className="hover:scale-105 transition-transform"
                        >
                          <UserPlus className="h-4 w-4 mr-1" /> Aggiungi
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {newList.members.map((member, index) => (
                          <Input
                            key={index}
                            value={member}
                            onChange={(e) => updateMember(index, e.target.value)}
                            placeholder="email@esempio.com"
                          />
                        ))}
                      </div>
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
                          Crea e Invia Richieste
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
                  className="relative hover:scale-105 transition-transform"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Richieste</span>
                  <span className="sm:hidden">📬</span>
                  {pendingRequests.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                    >
                      {pendingRequests.length}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Grid Liste Responsive Migliorato */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allSharedLists.map((list, index) => {
            const TypeIcon = getTypeIcon(list.type);
            const completedItems = list.items.filter(item => item.completed).length;
            const progressPercent = list.items.length > 0 ? (completedItems / list.items.length) * 100 : 0;
            
            return (
              <Card 
                key={list.id} 
                className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden group animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg mb-3 flex items-center gap-2 truncate">
                        <TypeIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{list.name}</span>
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
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        onClick={() => deleteMutation.mutate(list.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-3 space-y-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{list.members.length} membri</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span className="hidden sm:inline">{new Date(list.created_at).toLocaleDateString('it-IT')}</span>
                      <span className="sm:hidden">{new Date(list.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</span>
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
                      💰 €{list.total_cost.toFixed(2)}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Collaboratori:</div>
                    <div className="flex flex-wrap gap-1">
                      {list.members.slice(0, 2).map((member, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="text-xs truncate max-w-20"
                          title={member}
                        >
                          {member.split('@')[0]}
                        </Badge>
                      ))}
                      {list.members.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{list.members.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => handleOpenList(list)}
                      className="flex-1 text-xs sm:text-sm"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Apri Lista</span>
                      <span className="sm:hidden">Apri</span>
                    </Button>
                    <Button 
                      onClick={() => handleShareList(list)}
                      variant="outline"
                      size="sm"
                      className="hover:scale-105 transition-transform"
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

      {/* Share Dialog Migliorato */}
      {selectedList && (
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Condividi Lista
              </DialogTitle>
              <DialogDescription>
                Condividi "{selectedList?.name}" per invitare altri a scaricare l'app
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button 
                onClick={copyShareLink} 
                variant="outline"
                className="w-full hover:scale-105 transition-transform"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copia Link di Invito
              </Button>
              <Button 
                onClick={shareViaWhatsApp} 
                className="w-full bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-transform"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Invita su WhatsApp
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