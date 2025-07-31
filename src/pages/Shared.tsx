import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Share2, Plus, Users, ShoppingCart, Package, Calendar, Trash2, UserPlus, CheckCircle, ExternalLink, Bell, Copy, MessageSquare, AlertCircle } from 'lucide-react';
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
  const [isCreating, setIsCreating] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [newList, setNewList] = useState({
    name: '',
    type: 'shopping' as const,
    members: ['']
  });

  // Liste di default ottimizzate con useMemo per evitare re-render
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

  const { data: userSharedLists = [], isLoading, error } = useQuery({
    queryKey: ['shared-lists'],
    queryFn: async () => {
      try {
        const result = await firebaseApi.getSharedLists();
        return result;
      } catch (error) {
        console.error('Errore caricamento liste:', error);
        if (error?.message?.includes('BloomFilter')) {
          // Ignora errori BloomFilter di Firestore
          return [];
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000, // 10 minuti
    retry: (failureCount, error) => {
      if (error?.message?.includes('BloomFilter')) return false;
      return failureCount < 2;
    }
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['list-requests', 'pending'],
    queryFn: firebaseApi.getPendingListRequests,
    enabled: isAuthenticated,
    refetchInterval: 60000, // Solo ogni 60 secondi
    staleTime: 30 * 1000,
    retry: false
  });

  // Cleanup su unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Combina liste default con quelle dell'utente
  const allSharedLists = useMemo(() => [...defaultLists, ...userSharedLists], [defaultLists, userSharedLists]);

  const createMutation = useMutation({
    mutationFn: async (listData: any) => {
      // Cancella richiesta precedente se esistente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      try {
        setIsCreating(true);
        const result = await firebaseApi.createSharedList(listData);
        return result;
      } finally {
        setIsCreating(false);
      }
    },
    onSuccess: () => {
      // Gestione sicura della chiusura dialog
      requestAnimationFrame(() => {
        setTimeout(() => {
          setShowAddDialog(false);
          setNewList({ name: '', type: 'shopping', members: [''] });
          setIsCreating(false);
        }, 200);
      });
      
      queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
      toast({ 
        title: "🎉 Lista condivisa creata", 
        description: "Le richieste di condivisione sono state inviate!" 
      });
    },
    onError: (error) => {
      setIsCreating(false);
      console.error('Error creating shared list:', error);
      
      if (error?.message?.includes('BloomFilter')) {
        toast({ 
          title: "⚠️ Attenzione", 
          description: "Lista creata ma potrebbero esserci ritardi nella sincronizzazione",
          variant: "default"
        });
      } else {
        toast({ 
          title: "❌ Errore", 
          description: "Impossibile creare la lista condivisa. Riprova tra poco.",
          variant: "destructive" 
        });
      }
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
    
    if (createMutation.isPending || isCreating) return; // Prevent double-click
    
    createMutation.mutate({
      name: newList.name,
      type: newList.type,
      owner_id: '', // Sarà impostato da createSharedList
      members: newList.members.filter(m => m.trim()),
      items: [],
      total_cost: 0
    });
  }, [newList, createMutation, isCreating]);

  const handleOpenList = useCallback((list: any) => {
    try {
      navigate(`/shared/${list.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "⚠️ Errore",
        description: "Impossibile aprire la lista",
        variant: "destructive"
      });
    }
  }, [navigate]);

  const handleShareList = useCallback((list: any) => {
    setSelectedList(list);
    setShowShareDialog(true);
  }, []);

  const copyShareLink = useCallback(() => {
    try {
      const shareUrl = `${window.location.origin}/shared/${selectedList?.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast({ 
        title: "📋 Link copiato!", 
        description: "Il link di condivisione è stato copiato negli appunti" 
      });
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile copiare il link",
        variant: "destructive"
      });
    }
  }, [selectedList]);

  const shareViaWhatsApp = useCallback(() => {
    try {
      const shareMessage = `🎯 Ti invito a collaborare sulla lista "${selectedList?.name}"!\n\n📱 Scarica l'app e unisciti qui:\n${window.location.origin}/shared/${selectedList?.id}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile aprire WhatsApp",
        variant: "destructive"
      });
    }
  }, [selectedList]);

  const getTypeIcon = useCallback((type: string) => {
    return type === 'shopping' ? ShoppingCart : Package;
  }, []);

  // Show error state
  if (error && !error?.message?.includes('BloomFilter')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-800">Errore di Connessione</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Impossibile caricare le liste condivise. Controlla la connessione internet.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20 mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative group">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                  Liste Condivise
                </h1>
                <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">
                  {allSharedLists.length} liste collaborative • Richieste autorizzazione
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={showAddDialog} onOpenChange={(open) => {
  if (!open && !isCreating) setShowAddDialog(open);
}}>
  <Button
    size="lg"
    disabled={isCreating}
    onClick={() => setShowAddDialog(true)}
    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 sm:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
    <span className="hidden sm:inline">Nuova Lista</span>
    <span className="sm:hidden">Lista</span>
  </Button>
  <DialogContent className="w-[95vw] max-w-md bg-white/95 backdrop-blur-sm rounded-2xl mx-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-bold text-center">
                      🎯 Crea Lista Condivisa
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm">
                      Invia richieste di collaborazione per liste condivise
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
                        disabled={isCreating}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Tipo Lista</Label>
                      <Select 
                        value={newList.type} 
                        onValueChange={(value: any) => setNewList({...newList, type: value})}
                        disabled={isCreating}
                      >
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
                          disabled={isCreating}
                          className="hover:scale-105 transition-transform text-xs px-2 py-1"
                        >
                          <UserPlus className="h-3 w-3 mr-1" /> +
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                        {newList.members.map((member, index) => (
                          <Input
                            key={index}
                            value={member}
                            onChange={(e) => updateMember(index, e.target.value)}
                            placeholder="email@esempio.com"
                            disabled={isCreating}
                            className="text-sm"
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        💬 Riceveranno una richiesta di autorizzazione
                      </p>
                    </div>

                    <Button 
                      onClick={createSharedList} 
                      disabled={createMutation.isPending || isCreating} 
                      className="w-full"
                    >
                      {(createMutation.isPending || isCreating) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span className="text-sm">Inviando richieste...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm">📤 Crea e Invia Richieste</span>
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
                      className="absolute -top-2 -right-2 bg-red-500 text-white px-1.5 py-0.5 text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
                    >
                      {pendingRequests.length}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Liste condivise - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {allSharedLists.map((list) => (
            <Card 
              key={list.id} 
              className="group bg-white/90 backdrop-blur-sm hover:bg-white/95 border border-white/20 hover:border-blue-300/30 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] rounded-2xl overflow-hidden animate-fade-in"
            >
              <CardHeader className="pb-3 p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-colors shrink-0">
                      {React.createElement(getTypeIcon(list.type), { 
                        className: "h-5 w-5 sm:h-6 sm:w-6 text-blue-600" 
                      })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors truncate">
                        {list.name}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {list.type === 'shopping' ? '🛒 Spesa' : '📦 Dispensa'}
                      </p>
                    </div>
                  </div>
                  
                  {list.id.startsWith('default-') ? (
                    <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200 text-xs shrink-0">
                      Demo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 text-xs shrink-0">
                      Attiva
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div
  className="flex items-center space-x-1 text-muted-foreground cursor-pointer underline"
  onClick={() => setShowMembersModal(list)}
  title="Vedi membri"
>
  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
  <span className="text-xs sm:text-sm">{list.members?.length || 0}</span>
</div>

                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">{list.items?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600 font-semibold">
                    <span className="text-xs sm:text-sm">€{list.total_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Progresso</span>
                    <span className="text-xs text-muted-foreground">
                      {list.items?.filter(item => item.completed).length || 0}/{list.items?.length || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${list.items?.length ? ((list.items.filter(item => item.completed).length / list.items.length) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    onClick={() => handleOpenList(list)}
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>Apri Lista</span>
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleShareList(list)}
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 hover:scale-105 transition-all duration-200 text-xs"
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Invita</span>
                      <span className="sm:hidden">📤</span>
                    </Button>
                    
                    {!list.id.startsWith('default-') && (
                      <Button
                        onClick={() => deleteMutation.mutate(list.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State per mobile */}
        {allSharedLists.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Nessuna Lista Condivisa</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Crea la tua prima lista collaborativa per iniziare!
            </p>
          </div>
        )}

        {/* Modale Condivisione */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>📤 Condividi Lista</DialogTitle>
              <DialogDescription>
                Invita altri utenti a collaborare su "{selectedList?.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button onClick={copyShareLink} className="w-full" variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copia Link di Condivisione
              </Button>
              <Button onClick={shareViaWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Condividi su WhatsApp
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modale Richieste */}
        <ListRequestsModal 
          isOpen={showRequestsModal}
          onClose={() => setShowRequestsModal(false)}
          onRequestUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['list-requests', 'pending'] });
            queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
          }}
        />
      </div>
      <Dialog open={!!showMembersModal} onOpenChange={() => setShowMembersModal(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Membri della lista</DialogTitle>
    </DialogHeader>
    <ul className="space-y-1">
      {showMembersModal?.members?.map((member, idx) => (
        <li key={idx} className="text-sm">{member}</li>
      ))}
    </ul>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default Shared;