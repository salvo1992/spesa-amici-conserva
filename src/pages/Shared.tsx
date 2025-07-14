
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Share2, Plus, UserPlus, Eye, Settings } from 'lucide-react';

interface SharedList {
  id: string;
  name: string;
  owner: string;
  members: string[];
  itemCount: number;
  lastUpdated: string;
  type: 'shopping' | 'pantry';
}

const Shared = () => {
  const [sharedLists, setSharedLists] = useState<SharedList[]>([
    {
      id: '1',
      name: 'Lista Famiglia',
      owner: 'Maria R.',
      members: ['Te', 'Marco', 'Giulia'],
      itemCount: 12,
      lastUpdated: '2 ore fa',
      type: 'shopping'
    },
    {
      id: '2',
      name: 'Conserve Casa',
      owner: 'Te',
      members: ['Maria R.', 'Alessandro'],
      itemCount: 24,
      lastUpdated: '1 giorno fa',
      type: 'pantry'
    }
  ]);

  const [inviteEmail, setInviteEmail] = useState('');

  const getTypeColor = (type: string) => {
    return type === 'shopping' ? 'bg-red-500' : 'bg-green-500';
  };

  const getTypeLabel = (type: string) => {
    return type === 'shopping' ? 'Lista Spesa' : 'Conserve';
  };

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-accent">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Condivisioni
            </h1>
            <p className="text-muted-foreground mt-1">Gestisci le tue liste condivise</p>
          </div>
          <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Nuova Condivisione
          </Button>
        </div>
      </div>

      {/* Invita utenti */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-accent" />
            Invita Collaboratori
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Email dell'utente da invitare"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Button className="bg-accent hover:bg-accent/90 text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Invita
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste condivise */}
      <div className="space-y-4">
        {sharedLists.map((list) => (
          <Card key={list.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
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
                      {list.members.slice(0, 3).map((member, index) => (
                        <Avatar key={index} className="w-8 h-8 border-2 border-white">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                            {member.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {list.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">+{list.members.length - 3}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sharedLists.length === 0 && (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Nessuna lista condivisa</p>
          <p className="text-sm text-muted-foreground mt-2">
            Inizia condividendo una delle tue liste!
          </p>
        </Card>
      )}
    </div>
  );
};

export default Shared;
