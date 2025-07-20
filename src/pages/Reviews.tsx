
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare, ThumbsUp, User, Edit3, Share2, Facebook, Twitter, Instagram } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseApi, type Review } from '@/lib/firebase';

const Reviews = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<{[key: string]: {voted: boolean, count: number}}>({});
  const [newReview, setNewReview] = useState({
    product_name: '',
    rating: 5,
    comment: '',
    category: 'app'
  });

  // Query per ottenere le recensioni
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: firebaseApi.getReviews
  });

  // Mutation per creare una nuova recensione
  const createReviewMutation = useMutation({
    mutationFn: firebaseApi.createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Recensione pubblicata",
        description: "La tua recensione è stata aggiunta con successo!"
      });
      setShowReviewDialog(false);
      setNewReview({
        product_name: '',
        rating: 5,
        comment: '',
        category: 'app'
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile pubblicare la recensione",
        variant: "destructive"
      });
    }
  });

  // Recensioni di default con descrizioni migliorate
  const defaultReviews: Review[] = [
    {
      id: 'default-1',
      user_id: 'default',
      product_name: 'Pasta alla Carbonara Tradizionale',
      app_review: false,
      rating: 5,
      comment: 'Ricetta fantastica! Ho seguito esattamente le proporzioni: 400g di spaghetti, 200g di guanciale, 4 uova intere, pecorino romano grattugiato e pepe nero. Il segreto è amalgamare tutto a fuoco spento per evitare che le uova si rapprendano. Risultato cremoso e saporito come nei migliori ristoranti romani!',
      category: 'ricetta',
      helpful_count: 12,
      created_at: '2024-01-15T00:00:00.000Z'
    },
    {
      id: 'default-2',
      user_id: 'default',
      product_name: 'Tiramisù della Nonna Perfetto',
      app_review: false,
      rating: 4,
      comment: 'Dolce meraviglioso! Ho utilizzato savoiardi di qualità, caffè espresso forte, mascarpone fresco, uova biologiche e cacao amaro. La chiave è lasciar riposare in frigo almeno 4 ore. Il contrasto tra la cremosità e l\'amarezza del caffè è sublime. Consiglio di non esagerare con lo zucchero.',
      category: 'ricetta',
      helpful_count: 8,
      created_at: '2024-01-10T00:00:00.000Z'
    },
    {
      id: 'default-3',
      user_id: 'default',
      product_name: 'Food Manager App',
      app_review: true,
      rating: 5,
      comment: 'App incredibilmente utile per organizzare la cucina! Le funzioni di pianificazione dei pasti, gestione della dispensa e lista spesa sincronizzata sono perfette. L\'interfaccia è intuitiva e le ricette integrate sono di ottima qualità. Ha rivoluzionato il mio modo di cucinare e fare la spesa.',
      category: 'app',
      helpful_count: 25,
      created_at: '2024-01-08T00:00:00.000Z'
    }
  ];

  const allReviews = reviews.length > 0 ? reviews : defaultReviews;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleCreateReview = () => {
    if (!newReview.comment.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un commento per la recensione",
        variant: "destructive"
      });
      return;
    }

    createReviewMutation.mutate({
      product_name: newReview.product_name || 'App Food Manager',
      app_review: newReview.category === 'app',
      rating: newReview.rating,
      comment: newReview.comment,
      category: newReview.category,
      helpful_count: 0
    });
  };

  const handleHelpful = (reviewId: string) => {
    setHelpfulVotes(prev => {
      const current = prev[reviewId] || { voted: false, count: 0 };
      const newVoted = !current.voted;
      const newCount = newVoted ? current.count + 1 : Math.max(0, current.count - 1);
      
      return {
        ...prev,
        [reviewId]: {
          voted: newVoted,
          count: newCount
        }
      };
    });

    toast({
      title: helpfulVotes[reviewId]?.voted ? "Voto rimosso" : "Grazie!",
      description: helpfulVotes[reviewId]?.voted ? "Hai rimosso il tuo voto" : "Il tuo voto è stato registrato"
    });
  };

  const handleShare = (review: Review, platform: string) => {
    const appName = "Food Manager - Il Vikingo del Web";
    const appUrl = window.location.origin;
    const logoUrl = "/lovable-uploads/7c75a14f-99a4-4250-a4c1-00b33d7be67b.png";
    const text = `🍽️ ${appName}\n\n"${review.comment}"\n\n⭐ Recensione di ${review.product_name}\n\n📱 Scarica l'app: ${appUrl}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(text);
        toast({
          title: "Copiato!",
          description: "Testo copiato negli appunti per Instagram"
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Recensioni e Valutazioni
          </h1>
          <div className="text-muted-foreground">
            Condividi la tua esperienza con le ricette e l'app
          </div>
        </div>

        <div className="grid gap-6">
          {allReviews.map((review) => (
            <Card key={review.id} className="card-hover shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-l-4 border-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        {review.product_name}
                        {review.app_review && (
                          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                            App
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          di {review.user_id === 'default' ? 'Utente' : (review.user_id === user?.uid ? user?.name : 'Utente')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(review.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-4 border border-green-100 dark:border-green-800">
                  <MessageSquare className="h-4 w-4 text-green-600 mb-2" />
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.comment}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleHelpful(review.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        helpfulVotes[review.id]?.voted 
                          ? 'text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg' 
                          : 'text-gray-500 hover:text-green-600'
                      }`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${helpfulVotes[review.id]?.voted ? 'fill-current' : ''}`} />
                      <span className="text-sm">
                        {(helpfulVotes[review.id]?.count || 0) + review.helpful_count} utile
                      </span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Condividi:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(review, 'facebook')}
                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                      >
                        <Facebook className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(review, 'twitter')}
                        className="h-8 w-8 p-0 hover:bg-sky-100 dark:hover:bg-sky-900/20"
                      >
                        <Twitter className="h-4 w-4 text-sky-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(review, 'instagram')}
                        className="h-8 w-8 p-0 hover:bg-pink-100 dark:hover:bg-pink-900/20"
                      >
                        <Instagram className="h-4 w-4 text-pink-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogTrigger asChild>
            <Card className="mt-8 card-hover shadow-lg border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-pointer">
              <CardContent className="p-6 text-center">
                <Edit3 className="h-8 w-8 mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2">Vuoi condividere la tua recensione?</h3>
                <div className="text-green-100 mb-4">
                  Aiuta altri utenti condividendo la tua esperienza
                </div>
                <div className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                  <Edit3 className="h-4 w-4" />
                  Scrivi una Recensione
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Scrivi una Recensione</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="product">Prodotto/Ricetta (opzionale)</Label>
                <Input
                  id="product"
                  value={newReview.product_name}
                  onChange={(e) => setNewReview({...newReview, product_name: e.target.value})}
                  placeholder="Es. Pizza Margherita, App Food Manager..."
                />
              </div>
              
              <div>
                <Label>Valutazione</Label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({...newReview, rating: star})}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newReview.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="comment">Commento</Label>
                <Textarea
                  id="comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Condividi la tua esperienza..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateReview}
                  disabled={createReviewMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {createReviewMutation.isPending ? 'Pubblicando...' : 'Pubblica Recensione'}
                </Button>
                <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                  Annulla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Reviews;
