import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Sparkles } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-violet-600 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 p-4">
        <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl">
                <ChefHat className="h-8 w-8 text-white animate-bounce" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Benvenuto in Food Manager
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Accedi o registrati per iniziare a gestire la tua cucina
            </p>
          </CardHeader>
          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};