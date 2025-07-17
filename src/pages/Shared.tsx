
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Share2, Plus, Users, ShoppingCart, Package, Calendar, Trash2, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, type SharedList } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const Shared = () => {
  const { isAuthenticated } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);

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

  // Combina liste default con quelle dell'utente
  const allSharedLists = [...defaultLists, ...userSharedLists];

  const createMutation = useMutation({
    mutationFn: firebaseApi.createSharedList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
      setShowAddDialog(false);
      setNewList({ name: '', type: 'shopping', members: [''] });
      toast({ title: "Lista condivisa creata", description: "La lista è stata creata e condivisa" });
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
    if (!newList.name.trim()) return;
    
    createMutation.mutate({
      name: newList.name,
      type: newList.type,
      members: newList.members.filter(m => m.trim()),
      items: [],
      total_cost: 0
    });
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
    <div className="p-4 space-y-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-600 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                Liste Condivise
              </h1>
              <p className="text-muted-foreground mt-1">
                {allSharedLists.length} liste condivise
              </p>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                <Plus className="h-4 w-4 mr-2" />
                Nuova Lista Condivisa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Lista Condivisa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome Lista</Label>
                  <Input
                    value={newList.name}
                    onChange={(e) => setNewList({...newList, name: e.target.value})}
                    placeholder="Es. Spesa della settimana"
                  />
                </div>

                <div>
                  <Label>Tipo Lista</Label>
                  <Select value={newList.type} onValueChange={(value: any) => setNewList({...newList, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopping">Lista Spesa</SelectItem>
                      <SelectItem value="pantry">Dispensa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Membri (email)</Label>
                    <Button type="button" size="sm" onClick={addMember}>
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

                <Button onClick={createSharedList} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? 'Creando...' : 'Crea e Condividi'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Shared Lists Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSharedLists.map((list) => {
          const TypeIcon = getTypeIcon(list.type);
          const completedItems = list.items.filter(item => item.completed).length;
          
          return (
            <Card 
              key={list.id} 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 flex items-center gap-2">
                      <TypeIcon className="h-5 w-5 text-purple-600" />
                      {list.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {list.type === 'shopping' ? 'Lista Spesa' : 'Dispensa'}
                    </Badge>
                    {list.owner_id === 'default' && (
                      <Badge variant="outline" className="ml-2 border-green-300 text-green-700">
                        Lista Esempio
                      </Badge>
                    )}
                  </div>
                  {list.owner_id !== 'default' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteMutation.mutate(list.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{list.members.length} membri</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(list.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{completedItems}/{list.items.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${list.items.length > 0 ? (completedItems / list.items.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {list.total_cost > 0 && (
                    <div className="text-lg font-semibold text-green-600">
                      €{list.total_cost.toFixed(2)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-600 uppercase">Membri:</div>
                    <div className="flex flex-wrap gap-1">
                      {list.members.slice(0, 2).map((member, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-purple-50 border-purple-200">
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

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                      Apri Lista
                    </Button>
                    <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {allSharedLists.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna lista condivisa</h3>
            <p className="text-muted-foreground mb-4">
              Crea la tua prima lista condivisa per collaborare con famiglia e amici!
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crea Lista Condivisa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Shared;
