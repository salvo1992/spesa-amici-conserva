
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare, ThumbsUp, User, Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseApi, type Review } from '@/lib/firebase';

// Definizione del tipo Comment
interface Comment {
  id: string;
  review_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

const Reviews = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [userVotes, setUserVotes] = useState<{[key: string]: boolean}>({});
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const [comments, setComments] = useState<{[key: string]: Comment[]}>({});
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
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere registrato per votare",
        variant: "destructive"
      });
      return;
    }

    setUserVotes(prev => {
      const hasVoted = prev[reviewId];
      const newVotes = { ...prev };
      
      if (hasVoted) {
        delete newVotes[reviewId];
      } else {
        newVotes[reviewId] = true;
      }
      
      return newVotes;
    });

    toast({
      title: userVotes[reviewId] ? "Voto rimosso" : "Grazie!",
      description: userVotes[reviewId] ? "Hai rimosso il tuo voto" : "Il tuo voto è stato registrato"
    });
  };

  const handleAddComment = (reviewId: string) => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere registrato per commentare",
        variant: "destructive"
      });
      return;
    }

    const commentText = newComment[reviewId]?.trim();
    if (!commentText) return;

    const comment: Comment = {
      id: Date.now().toString(),
      review_id: reviewId,
      user_id: user.uid,
      user_name: user.name || user.email?.split('@')[0] || 'Utente',
      comment: commentText,
      created_at: new Date().toISOString()
    };

    setComments(prev => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] || []), comment]
    }));

    setNewComment(prev => ({
      ...prev,
      [reviewId]: ''
    }));

    toast({
      title: "Commento aggiunto",
      description: "Il tuo commento è stato pubblicato"
    });
  };

  const handleDeleteComment = (reviewId: string, commentId: string) => {
    setComments(prev => ({
      ...prev,
      [reviewId]: prev[reviewId]?.filter(c => c.id !== commentId) || []
    }));

    toast({
      title: "Commento eliminato",
      description: "Il commento è stato rimosso"
    });
  };

  const toggleComments = (reviewId: string) => {
    setShowComments(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const getUserVoteCount = (reviewId: string) => {
    return userVotes[reviewId] ? 1 : 0;
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
          <div className="text-muted-foreground max-w-2xl mx-auto">
            Condividi la tua esperienza con le ricette e l'app. Scambia recensioni sulle ricette, 
            discuti di cucina, condividi idee per feste con amici. Food Manager è grata ai suoi utenti 
            per averla scelta e ti invita a lasciare una recensione se l'app ti piace!
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
                          di {
                            review.user_name || 
                            (review.user_id === 'default' ? 'Utente' : 
                             (review.user_id === user?.uid ? 
                              (user?.name && user.name !== user.email?.split('@')[0] ? user.name : 'Utente Registrato') : 
                              'Utente Registrato'))
                          }
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
                        userVotes[review.id] 
                          ? 'text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg' 
                          : 'text-gray-500 hover:text-green-600'
                      }`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${userVotes[review.id] ? 'fill-current' : ''}`} />
                      <span className="text-sm">
                        {getUserVoteCount(review.id) + review.helpful_count} utile
                      </span>
                    </button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComments(review.id)}
                      className="flex items-center gap-2 text-gray-500 hover:text-green-600"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">Commenta</span>
                    </Button>
                  </div>
                </div>

                {/* Sezione Commenti */}
                {showComments[review.id] && (
                  <div className="mt-4 border-t pt-4">
                    <div className="space-y-3">
                      {comments[review.id]?.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {comment.user_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {comment.comment}
                              </p>
                            </div>
                            {comment.user_id === user?.uid && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(review.id, comment.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Form per nuovo commento */}
                      <div className="flex gap-2 mt-3">
                        <Input
                          placeholder="Scrivi un commento..."
                          value={newComment[review.id] || ''}
                          onChange={(e) => setNewComment(prev => ({
                            ...prev,
                            [review.id]: e.target.value
                          }))}
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(review.id);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(review.id)}
                          disabled={!newComment[review.id]?.trim()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Invia
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
