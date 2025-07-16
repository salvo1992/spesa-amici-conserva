
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Reviews = () => {
  const { user } = useAuth();

  const reviews = [
    {
      id: 1,
      recipe: "Pasta alla Carbonara",
      rating: 5,
      comment: "Assolutamente deliziosa! La migliore carbonara che abbia mai fatto.",
      author: "Maria R.",
      date: "2024-01-15",
      helpful: 12
    },
    {
      id: 2,
      recipe: "Tiramisù della Nonna",
      rating: 4,
      comment: "Ottima ricetta, molto facile da seguire. Il risultato è stato fantastico.",
      author: "Giuseppe M.",
      date: "2024-01-10",
      helpful: 8
    },
    {
      id: 3,
      recipe: "Risotto ai Funghi",
      rating: 5,
      comment: "Cremoso e saporito, esattamente come quello del ristorante!",
      author: "Anna P.",
      date: "2024-01-08",
      helpful: 15
    }
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Recensioni e Valutazioni
          </h1>
          <div className="text-muted-foreground">
            Condividi la tua esperienza con le ricette
          </div>
        </div>

        <div className="grid gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="card-hover shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{review.recipe}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          di {review.author}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {review.date}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <MessageSquare className="h-4 w-4 text-gray-500 mb-2" />
                  <div className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpful} persone hanno trovato utile questa recensione</span>
                  </div>
                  <button className="text-primary hover:text-primary/80 font-medium transition-colors">
                    Utile
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 card-hover shadow-lg border-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Vuoi condividere la tua recensione?</h3>
            <div className="text-blue-100 mb-4">
              Aiuta altri cuochi condividendo la tua esperienza
            </div>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Scrivi una Recensione
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reviews;
