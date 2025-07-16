import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, Plus, Share2, UserPlus, Trash2, Edit, Copy, ShoppingCart, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, type SharedList } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const Shared = () => {
  const { isAuthenticated } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<SharedList | null>(null);
  const [shareEmail, setShareEmail] = useState('');

  const [newList, setNewList] = useState({
    name: '',
    type: 'shopping' as 'shopping' | 'pantry',
    members: ['']
  });

  const queryClient = useQueryClient();

  const { data: sharedLists = [], isLoading } = useQuery({
    queryKey: ['shared-lists'],
    queryFn: firebaseApi.getSharedLists,
    enabled: isAuthenticated
  });

  const createMutation = useMutation({
    mutationFn: firebaseApi.createSharedList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
      setShowCreateDialog(false);
      setNewList({ name: '', type: 'shopping', members: [''] });
      toast({ title: "Lista creata", description: "La lista condivisa è stata creata con successo" });
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
    setNewList({
      ...newList,
      members: [...newList.members, '']
    });
  };

  const removeMember = (index: number) => {
    const updatedMembers = newList.members.filter((_, i) => i !== index);
    setNewList({
      ...newList,
      members: updatedMembers.length > 0 ? updatedMembers : ['']
    });
  };

  const updateMember = (index: number, value: string) => {
    const updatedMembers = [...newList.members];
    updatedMembers[index] = value;
    setNewList({
      ...newList,
      members: updatedMembers
    });
  };

  const createSharedList = () => {
    if (!newList.name.trim()) return;
    
    const validMembers = newList.members.filter(member => member.trim());
    
    createMutation.mutate({
      name: newList.name,
      type: newList.type,
      members: validMembers,
      items: [],
      total_cost: 0
    });
  };

  const deleteList = (id: string) => {
    deleteMutation.mutate(id);
  };

  const shareList = (list: SharedList) => {
    setSelectedList(list);
    setShowShareDialog(true);
  };

  const copyShareLink = (listId: string) => {
    const shareLink = `${window.location.origin}/shared/${listId}`;
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copiato",
      description: "Il link di condivisione è stato copiato negli appunti"
    });
  };

  const inviteByEmail = () => {
    if (!shareEmail.trim() || !selectedList) return;
    
    // In una implementazione reale, qui invieresti un'email di invito
    toast({
      title: "Invito inviato",
      description: `Invito inviato a ${shareEmail}`
    });
    setShareEmail('');
    setShowShareDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-600 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                Liste Condivise
              </h1>
              <p className="text-muted-foreground mt-1">
                {sharedLists.length} liste collaborative attive
              </p>
            </div>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                <Plus className="h-4 w-4 mr-2" />
                Crea Lista Condivisa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuova Lista Condivisa</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label>Nome Lista</Label>
                  <Input
                    value={newList.name}
                    onChange={(e) => setNewList({...newList, name: e.target.value})}
                    placeholder="Es. Spesa Settimanale Famiglia"
                  />
                </div>

                <div>
                  <Label>Tipo Lista</Label>
                  <Select value={newList.type} onValueChange={(value: 'shopping' | 'pantry') => setNewList({...newList, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopping">Lista della Spesa</SelectItem>
                      <SelectItem value="pantry">Dispensa Condivisa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Membri (Email)</Label>
                    <Button type="button" size="sm" onClick={addMember}>
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newList.members.map((member, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={member}
                          onChange={(e) => updateMember(index, e.target.value)}
                          placeholder={`Email membro ${index + 1}`}
                          type="email"
                        />
                        {newList.members.length > 1 && (
                          <Button type="button" size="sm" variant="outline" onClick={() => removeMember(index)}>
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={createSharedList} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? 'Creando...' : 'Crea Lista Condivisa'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Condividi Lista: {selectedList?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Invita per Email</Label>
              <div className="flex gap-2">
                <Input
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="email@esempio.com"
                  type="email"
                />
                <Button onClick={inviteByEmail}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Invita
                </Button>
              </div>
            </div>
            <div className="border-t pt-4">
              <Label>Link di Condivisione</Label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" className="flex-1" onClick={() => selectedList && copyShareLink(selectedList.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copia Link
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shared Lists */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sharedLists.map((list) => (
          <Card key={list.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1 flex items-center gap-2">
                    {list.type === 'shopping' ? (
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Package className="h-5 w-5 text-green-600" />
                    )}
                    {list.name}
                  </CardTitle>
                  <Badge variant="secondary">
                    {list.type === 'shopping' ? 'Lista Spesa' : 'Dispensa'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => shareList(list)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Membri</span>
                    <span className="font-medium">{list.members.length}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {list.members.slice(0, 3).map((member, index) => (
                      <div key={index} className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-700">
                        {member.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {list.members.length > 3 && (
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        +{list.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Elementi</span>
                    <span className="font-medium">{list.items.length}</span>
                  </div>
                  {list.total_cost && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Costo Totale</span>
                      <span className="font-medium text-green-600">€{list.total_cost.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Apri Lista
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => shareList(list)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteList(list.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {sharedLists.length === 0 && (
          <div className="col-span-full">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessuna lista condivisa</h3>
                <p className="text-muted-foreground mb-4">
                  Crea la tua prima lista condivisa per collaborare con famiglia e amici!
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Lista Condivisa
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shared;
