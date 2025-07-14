
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Settings, Key } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FirebaseSetup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Configurazione Firebase Richiesta
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              L'applicazione richiede la configurazione di Firebase per funzionare correttamente.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Variabili d'ambiente richieste:
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 font-mono text-sm">
              <div className="text-gray-700">VITE_FIREBASE_API_KEY=your_api_key</div>
              <div className="text-gray-700">VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com</div>
              <div className="text-gray-700">VITE_FIREBASE_PROJECT_ID=your_project_id</div>
              <div className="text-gray-700">VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com</div>
              <div className="text-gray-700">VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id</div>
              <div className="text-gray-700">VITE_FIREBASE_APP_ID=your_app_id</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Come configurare:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Vai alla <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firebase Console</a></li>
              <li>Crea un nuovo progetto o seleziona un progetto esistente</li>
              <li>Vai su "Impostazioni progetto" → "Le tue app"</li>
              <li>Aggiungi una nuova app web se non presente</li>
              <li>Copia la configurazione Firebase</li>
              <li>Abilita Authentication e Firestore nel progetto</li>
              <li>Configura le variabili d'ambiente nell'hosting/deployment</li>
            </ol>
          </div>

          <Alert>
            <AlertDescription>
              Una volta configurate le variabili d'ambiente, ricarica la pagina per iniziare a utilizzare l'applicazione.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseSetup;
