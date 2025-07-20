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
import { firebaseApi, type Review, type Comment } from '@/lib/firebase';

const Reviews = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [showAllComments, setShowAllComments] = useState<{[key: string]: boolean}>({});
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
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

  // Query per ottenere i voti degli utenti
  const { data: userVotes = {} } = useQuery({
    queryKey: ['userVotes', user?.uid],
    queryFn: async () => {
      if (!user || !reviews.length) return {};
      const votes: {[key: string]: boolean} = {};
      for (const review of reviews) {
        votes[review.id] = await firebaseApi.getUserVote(review.id);
      }
      return votes;
    },
    enabled: !!user && reviews.length > 0
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

  // Mutation per gestire i voti
  const toggleVoteMutation = useMutation({
    mutationFn: firebaseApi.toggleUserVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes'] });
    }
  });

  // Mutation per creare commenti
  const createCommentMutation = useMutation({
    mutationFn: firebaseApi.createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['allComments'] });
      toast({
        title: "Commento aggiunto",
        description: "Il tuo commento è stato pubblicato"
      });
    }
  });

  // Mutation per eliminare recensioni
  const deleteReviewMutation = useMutation({
    mutationFn: firebaseApi.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Recensione eliminata",
        description: "La recensione è stata rimossa con successo"
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile eliminare la recensione",
        variant: "destructive"
      });
    }
  });

  // Mutation per eliminare commenti
  const deleteCommentMutation = useMutation({
    mutationFn: firebaseApi.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['allComments'] });
      toast({
        title: "Commento eliminato",
        description: "Il commento è stato rimosso"
      });
    }
  });

  // Query per ottenere tutti i commenti delle recensioni visibili
  const { data: allComments = {} } = useQuery({
    queryKey: ['allComments', Object.keys(showComments)],
    queryFn: async () => {
      const commentsData: {[key: string]: Comment[]} = {};
      const visibleReviewIds = Object.keys(showComments).filter(id => showComments[id]);
      
      await Promise.all(
        visibleReviewIds.map(async (reviewId) => {
          commentsData[reviewId] = await firebaseApi.getComments(reviewId);
        })
      );
      
      return commentsData;
    },
    enabled: Object.values(showComments).some(Boolean) || Object.values(showAllComments).some(Boolean)
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

    toggleVoteMutation.mutate(reviewId, {
      onSuccess: (hasVoted) => {
        toast({
          title: hasVoted ? "Grazie!" : "Voto rimosso",
          description: hasVoted ? "Il tuo voto è stato registrato" : "Hai rimosso il tuo voto"
        });
      }
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

    createCommentMutation.mutate({
      review_id: reviewId,
      user_id: user.uid,
      user_name: user.name || user.email?.split('@')[0] || 'Utente',
      comment: commentText
    }, {
      onSuccess: () => {
        setNewComment(prev => ({
          ...prev,
          [reviewId]: ''
        }));
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa recensione?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const toggleComments = (reviewId: string) => {
    setShowComments(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const toggleAllComments = (reviewId: string) => {
    setShowAllComments(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="animate-pulse">
              <Star className="h-8 w-8 md:h-10 md:w-10 text-yellow-400 fill-current animate-spin" style={{animationDuration: '3s'}} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-fade-in">
              Recensioni e Valutazioni
            </h1>
            <div className="animate-bounce">
              <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </div>
          <div className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base px-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
            Condividi la tua esperienza con le ricette e l'app. Scambia recensioni sulle ricette, 
            discuti di cucina, condividi idee per feste con amici. Food Manager è grata ai suoi utenti 
            per averla scelta e ti invita a lasciare una recensione se l'app ti piace!
          </div>
        </div>

        <div className="grid gap-4 md:gap-6">
          {allReviews.map((review) => {
            const comments = allComments[review.id] || [];
            
            return (
              <Card key={review.id} className="card-hover shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-l-4 border-green-500 animate-scale-in">
                <CardHeader className="pb-3 px-4 md:px-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base md:text-lg text-foreground flex flex-wrap items-center gap-2">
                          <span className="truncate">{review.product_name}</span>
                          {review.app_review && (
                            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs">
                              App
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex flex-wrap items-center space-x-2 mt-1">
                          <div className="flex space-x-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs md:text-sm text-muted-foreground">
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
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 px-4 md:px-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 md:p-4 mb-4 border border-green-100 dark:border-green-800">
                    <MessageSquare className="h-4 w-4 text-green-600 mb-2" />
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                      {review.comment}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                      <button 
                        onClick={() => handleHelpful(review.id)}
                        className={`flex items-center space-x-1 md:space-x-2 transition-colors text-xs md:text-sm ${
                          userVotes[review.id] 
                            ? 'text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg' 
                            : 'text-gray-500 hover:text-green-600'
                        }`}
                        disabled={toggleVoteMutation.isPending}
                      >
                        <ThumbsUp className={`h-3 w-3 md:h-4 md:w-4 ${userVotes[review.id] ? 'fill-current' : ''}`} />
                        <span>
                          {review.helpful_count} utile
                        </span>
                      </button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => comments.length > 3 ? toggleAllComments(review.id) : toggleComments(review.id)}
                        className="flex items-center gap-1 md:gap-2 text-gray-500 hover:text-green-600 text-xs md:text-sm h-8 px-2 md:px-3"
                      >
                        <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Commenta</span>
                        <span className="sm:hidden">({comments.length})</span>
                        <span className="hidden sm:inline">({comments.length})</span>
                      </Button>

                      {/* Bottone Elimina Post - visibile solo al proprietario */}
                      {review.user_id === user?.uid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          className="flex items-center gap-1 md:gap-2 text-red-500 hover:text-red-600 text-xs md:text-sm h-8 px-2 md:px-3"
                          disabled={deleteReviewMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden sm:inline">Elimina Post</span>
                          <span className="sm:hidden">Del</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Sezione Commenti - Visualizzazione limitata */}
                  {showComments[review.id] && (
                    <div className="mt-4 border-t pt-4">
                      <div className="space-y-3">
                        
                        {/* Mostra solo i primi 3 commenti */}
                        {comments.slice(0, 3).map((comment) => (
                          <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {comment.user_name}
                                  </span>
                                  <span className="text-xs text-gray-500 flex-shrink-0">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 break-words">
                                  {comment.comment}
                                </p>
                              </div>
                              {comment.user_id === user?.uid && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600 flex-shrink-0"
                                  disabled={deleteCommentMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Mostra link per vedere tutti i commenti se ce ne sono più di 3 */}
                        {comments.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAllComments(review.id)}
                            className="w-full text-green-600 hover:text-green-700 text-xs md:text-sm"
                          >
                            Vedi tutti i {comments.length} commenti
                          </Button>
                        )}
                        
                        {/* Form per nuovo commento */}
                        <div className="flex gap-2 mt-3">
                          <Input
                            placeholder="Scrivi un commento..."
                            value={newComment[review.id] || ''}
                            onChange={(e) => setNewComment(prev => ({
                              ...prev,
                              [review.id]: e.target.value
                            }))}
                            className="flex-1 text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddComment(review.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(review.id)}
                            disabled={!newComment[review.id]?.trim() || createCommentMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-xs md:text-sm px-3 md:px-4"
                          >
                            {createCommentMutation.isPending ? 'Invio...' : 'Invia'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modale per visualizzare tutti i commenti */}
                  <Dialog open={showAllComments[review.id]} onOpenChange={() => toggleAllComments(review.id)}>
                    <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col mx-4">
                      <DialogHeader>
                        <DialogTitle className="text-base md:text-lg truncate">
                          Tutti i commenti per "{review.product_name}"
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {comments.map((comment) => (
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
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                  disabled={deleteCommentMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Form per nuovo commento nella modale */}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex gap-2">
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
                            disabled={!newComment[review.id]?.trim() || createCommentMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {createCommentMutation.isPending ? 'Invio...' : 'Invia'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogTrigger asChild>
            <Card className="mt-6 md:mt-8 card-hover shadow-lg border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-pointer animate-fade-in">
              <CardContent className="p-4 md:p-6 text-center">
                <Edit3 className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-3" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">Vuoi condividere la tua recensione?</h3>
                <div className="text-green-100 mb-4 text-sm md:text-base">
                  Aiuta altri utenti condividendo la tua esperienza
                </div>
                <div className="inline-flex items-center gap-2 bg-white text-green-600 px-4 md:px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors text-sm md:text-base">
                  <Edit3 className="h-4 w-4" />
                  Scrivi una Recensione
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="max-w-[95vw] md:max-w-md mx-4">
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