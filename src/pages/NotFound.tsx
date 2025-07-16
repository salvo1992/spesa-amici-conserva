
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl font-bold text-primary mb-2">404</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagina non trovata</h1>
            <p className="text-gray-600">
              La pagina che stai cercando non esiste o è stata spostata.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link to="/">
              <Button className="w-full gradient-primary text-white">
                <Home className="h-4 w-4 mr-2" />
                Torna alla Dashboard
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna Indietro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
