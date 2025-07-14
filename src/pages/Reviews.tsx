
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, ThumbsUp, MessageCircle, Award, TrendingUp } from 'lucide-react';

interface Review {
  id: string;
  recipeName: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
  helpful: number;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      recipeName: 'Pasta al Pomodoro',
      rating: 5,
      comment: 'Ricetta fantastica! Molto semplice da seguire e il risultato è delizioso.',
      author: 'Maria G.',
      date: '2 giorni fa',
      helpful: 12
    },
    {
      id: '2',
      recipeName: 'Risotto ai Funghi',
      rating: 4,
      comment: 'Buona ricetta, ho aggiunto un po\' di parmigiano in più.',
      author: 'Luca R.',
      date: '1 settimana fa',
      helpful: 8
    },
    {
      id: '3',
      recipeName: 'Tiramisù',
      rating: 5,
      comment: 'Il migliore tiramisù che abbia mai fatto! Grazie per la ricetta.',
      author: 'Anna M.',
      date: '3 giorni fa',
      helpful: 15
    }
  ]);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-yellow-50 to-orange-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Valutazioni e Recensioni
            </h1>
            <p className="text-muted-foreground mt-1">Condividi la tua esperienza culinaria</p>
          </div>
          <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg">
            <Star className="h-4 w-4 mr-2" />
            Scrivi Recensione
          </Button>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Award className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Valutazione Media</p>
            <div className="flex justify-center mt-2">
              {renderStars(Math.round(averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-blue-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground">{totalReviews}</p>
            <p className="text-sm text-muted-foreground">Recensioni Totali</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-foreground">94%</p>
            <p className="text-sm text-muted-foreground">Ricette Consigliate</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista Recensioni */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Recensioni Recenti</h2>
        
        {reviews.map((review) => (
          <Card key={review.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    {review.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-foreground">{review.author}</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {review.recipeName}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm font-medium text-foreground">{review.rating}/5</span>
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{review.comment}</p>
                  
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Utile ({review.helpful})
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Rispondi
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
          <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Nessuna recensione</p>
          <p className="text-sm text-muted-foreground mt-2">
            Sii il primo a lasciare una recensione!
          </p>
        </Card>
      )}
    </div>
  );
};

export default Reviews;
