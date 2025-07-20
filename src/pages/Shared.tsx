import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Share2, Plus, Users, ShoppingCart, Package, Calendar, Trash2, UserPlus, AlertTriangle, CheckCircle, ExternalLink, Copy, Mail, Bell } from 'lucide-react';
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
      queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
      setShowAddDialog(false);
      setNewList({ name: '', type: 'shopping', members: [''] });
      toast({ title: "Lista condivisa creata", description: "La lista è stata creata e condivisa con successo!" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: firebaseApi.deleteSharedList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
      toast({ title: "Lista eliminata", description: "La lista condivisa è stata eliminata" });
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

  const shareViaEmail = () => {
    const shareUrl = `${window.location.origin}/shared/${selectedList?.id}`;
    const subject = `Condivisione Lista: ${selectedList?.name}`;
    const body = `Ti invito a collaborare sulla lista "${selectedList?.name}".\n\nAccedi qui: ${shareUrl}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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
    <div className="p-4 space-y-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Animated Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-200/50 animate-fade-in">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Share2 className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 animate-pulse" />
              <div className="absolute -inset-1 bg-blue-200/50 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-800 bg-clip-text text-transparent animate-fade-in">
                🤝 Liste Condivise
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base md:text-lg animate-slide-up">
                {allSharedLists.length} liste collaborative attive
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button 
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 group w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative z-10 text-sm sm:text-base">Nuova Lista Condivisa</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200/50 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                  ✨ Crea Lista Condivisa
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Collabora con famiglia e amici su liste condivise
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div>
                  <Label className="text-sm font-semibold text-blue-700">Nome Lista</Label>
                  <Input
                    value={newList.name}
                    onChange={(e) => setNewList({...newList, name: e.target.value})}
                    placeholder="Es. Spesa della settimana 🛒"
                    className="mt-2 border-2 border-blue-200/50 focus:border-blue-500 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-blue-700">Tipo Lista</Label>
                  <Select value={newList.type} onValueChange={(value: any) => setNewList({...newList, type: value})}>
                    <SelectTrigger className="mt-2 border-2 border-blue-200/50 focus:border-blue-500 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopping">🛒 Lista Spesa</SelectItem>
                      <SelectItem value="pantry">📦 Dispensa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-sm font-semibold text-blue-700">Membri (email)</Label>
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={addMember}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl"
                    >
                      <UserPlus className="h-4 w-4 mr-1" /> Aggiungi
                    </Button>
                  </div>
                  {newList.members.map((member, index) => (
                    <Input
                      key={index}
                      value={member}
                      onChange={(e) => updateMember(index, e.target.value)}
                      placeholder="email@esempio.com 📧"
                      className="mb-3 border-2 border-blue-200/50 focus:border-blue-500 rounded-xl"
                    />
                  ))}
                </div>

                <Button 
                  onClick={createSharedList} 
                  disabled={createMutation.isPending} 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {createMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
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
              className="relative border-2 border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold px-4 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="text-sm sm:text-base">Richieste</span>
              {pendingRequests.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {pendingRequests.length}
                </Badge>
              )}
            </Button>
          )}
          </div>
        </div>
      </div>

      {/* Enhanced Shared Lists Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allSharedLists.map((list, index) => {
          const TypeIcon = getTypeIcon(list.type);
          const completedItems = list.items.filter(item => item.completed).length;
          
          return (
            <Card 
              key={list.id} 
              className="bg-white/90 backdrop-blur-sm border-2 border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 rounded-2xl overflow-hidden group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-3 group-hover:text-blue-700 transition-colors">
                      <TypeIcon className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                      {list.name}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200 rounded-full px-3 py-1"
                      >
                        {list.type === 'shopping' ? '🛒 Lista Spesa' : '📦 Dispensa'}
                      </Badge>
                      {list.owner_id === 'default' && (
                        <Badge 
                          variant="outline" 
                          className="border-green-300 text-green-700 bg-green-50 rounded-full px-3 py-1"
                        >
                          ✨ Esempio
                        </Badge>
                      )}
                    </div>
                  </div>
                  {list.owner_id !== 'default' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2"
                      onClick={() => deleteMutation.mutate(list.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{list.members.length} membri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>{new Date(list.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600">Progresso</span>
                      <span className="text-blue-700">{completedItems}/{list.items.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-700 ease-out shadow-inner"
                        style={{ width: `${list.items.length > 0 ? (completedItems / list.items.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {list.total_cost > 0 && (
                    <div className="text-xl font-bold text-green-600 flex items-center gap-2">
                      💰 €{list.total_cost.toFixed(2)}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Membri collaboratori:</div>
                    <div className="flex flex-wrap gap-2">
                      {list.members.slice(0, 2).map((member, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="text-xs bg-blue-50 border-blue-200 text-blue-700 rounded-full px-3 py-1"
                        >
                          👤 {member.split('@')[0]}
                        </Badge>
                      ))}
                      {list.members.length > 2 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-purple-50 border-purple-200 text-purple-700 rounded-full px-3 py-1"
                        >
                          +{list.members.length - 2} altri
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      size="sm" 
                      onClick={() => handleOpenList(list)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apri Lista
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleShareList(list)}
                      className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-500 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
              Condividi "{selectedList?.name}" con altre persone
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-white/80 rounded-xl border border-blue-200/50">
              <Label className="text-sm font-semibold text-blue-700 mb-2 block">Link di condivisione</Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={`${window.location.origin}/shared/${selectedList?.id}`}
                  className="border-2 border-blue-200/50 rounded-xl bg-gray-50"
                />
                <Button onClick={copyShareLink} variant="outline" className="border-2 border-blue-300 hover:bg-blue-50 rounded-xl">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
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
      
      {allSharedLists.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-200/50 shadow-xl rounded-2xl animate-fade-in">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <Share2 className="h-16 w-16 mx-auto text-blue-400 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              🤝 Nessuna lista condivisa
            </h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Crea la tua prima lista condivisa per collaborare con famiglia e amici!
            </p>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crea Lista Condivisa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* List Requests Modal */}
      <ListRequestsModal 
        isOpen={showRequestsModal} 
        onClose={() => setShowRequestsModal(false)} 
      />
    </div>
  );
};

export default Shared;
