import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, CheckCircle, X, ShoppingCart, Package } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseApi } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

interface ListRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ListRequest {
  id: string;
  list_id: string;
  list_name: string;
  list_type: 'shopping' | 'pantry';
  sender_email: string;
  receiver_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

const ListRequestsModal: React.FC<ListRequestsModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['list-requests', 'pending'],
    queryFn: () => firebaseApi.getPendingListRequests(),
    enabled: isOpen
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, accept }: { requestId: string; accept: boolean }) =>
      firebaseApi.respondToListRequest(requestId, accept),
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ['list-requests'] });
      queryClient.invalidateQueries({ queryKey: ['shared-lists'] });
      toast({
        title: accept ? "Richiesta accettata" : "Richiesta rifiutata",
        description: accept 
          ? "La lista è stata aggiunta alle tue liste condivise"
          : "La richiesta è stata rifiutata"
      });
    }
  });

  const handleAccept = (requestId: string) => {
    respondMutation.mutate({ requestId, accept: true });
  };

  const handleReject = (requestId: string) => {
    respondMutation.mutate({ requestId, accept: false });
  };

  const getTypeIcon = (type: string) => {
    return type === 'shopping' ? ShoppingCart : Package;
  };

  const getTypeLabel = (type: string) => {
    return type === 'shopping' ? 'Lista Spesa' : 'Dispensa';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Richieste di Condivisione Liste
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nessuna richiesta in sospeso</p>
            </div>
          ) : (
            requests.map((request: ListRequest) => {
              const TypeIcon = getTypeIcon(request.list_type);
              
              return (
                <Card key={request.id} className="border-2 border-blue-200/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <TypeIcon className="h-5 w-5 text-blue-600" />
                      {request.list_name}
                      <Badge variant="outline" className="ml-auto">
                        {getTypeLabel(request.list_type)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Da: {request.sender_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      <strong>{request.sender_email}</strong> vuole condividere la lista 
                      "<strong>{request.list_name}</strong>" con te.
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(request.id)}
                        disabled={respondMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accetta
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                        disabled={respondMutation.isPending}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rifiuta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListRequestsModal;