import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, ChefHat, Clock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getPendingSharedRecipes, respondToSharedRecipe } from '@/lib/firebase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RecipeRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecipeRequestsModal: React.FC<RecipeRequestsModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['pending-recipe-requests'],
    queryFn: getPendingSharedRecipes,
    enabled: isOpen
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, accept }: { requestId: string; accept: boolean }) => 
      respondToSharedRecipe(requestId, accept),
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-recipe-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      
      toast({
        title: accept ? "Ricetta accettata!" : "Ricetta rifiutata",
        description: accept 
          ? "La ricetta è stata aggiunta al tuo ricettario" 
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-pink-600" />
            Richieste Ricette
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                {pendingRequests.length}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <ChefHat className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Nessuna richiesta ricetta</p>
              <p className="text-gray-400 text-sm mt-1">
                Le richieste di ricette condivise da altri utenti appariranno qui
              </p>
            </div>
          ) : (
            pendingRequests.map((request: any) => (
              <Card key={request.id} className="border-l-4 border-pink-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        {request.fromUserEmail}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>{request.fromUserEmail}</strong> vuole condividere con te la ricetta:
                      </p>
                      <p className="font-semibold text-lg text-gray-800">
                        {request.recipeName || 'Ricetta Speciale'}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAccept(request.id)}
                        disabled={respondMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accetta
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 border-red-300 hover:bg-red-50 text-red-700"
                        onClick={() => handleReject(request.id)}
                        disabled={respondMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rifiuta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeRequestsModal;