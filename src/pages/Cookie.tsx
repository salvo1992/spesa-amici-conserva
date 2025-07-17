
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Shield, Info, Eye, Settings } from 'lucide-react';

const CookiePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Informativa sui Cookie
          </h1>
          <p className="text-muted-foreground">
            Come utilizziamo i cookie in Food Manager
          </p>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cookie className="h-6 w-6 text-orange-600" />
                Cosa sono i Cookie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti il nostro sito web. 
                Ci aiutano a fornire una migliore esperienza utente e a capire come utilizzi la nostra applicazione.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-blue-600" />
                Cookie Tecnici (Necessari)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Questi cookie sono essenziali per il funzionamento del sito web e non possono essere disabilitati:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Cookie di sessione per mantenere il login</li>
                <li>Cookie per le preferenze di lingua</li>
                <li>Cookie per il tema scuro/chiaro</li>
                <li>Cookie per le impostazioni di sicurezza</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-green-600" />
                Cookie Analitici
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Utilizziamo cookie analitici per comprendere come interagisci con la nostra applicazione:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Pagine più visitate</li>
                <li>Tempo trascorso nell'app</li>
                <li>Funzionalità più utilizzate</li>
                <li>Errori e problemi tecnici</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-purple-600" />
                La Tua Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                La tua privacy è importante per noi. Tutti i dati raccolti tramite cookie sono:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Utilizzati solo per migliorare l'esperienza utente</li>
                <li>Non venduti a terze parti</li>
                <li>Conservati per il tempo strettamente necessario</li>
                <li>Protetti con adeguate misure di sicurezza</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Info className="h-6 w-6 text-indigo-600" />
                Gestione dei Cookie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Puoi gestire le tue preferenze sui cookie:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Tramite le impostazioni del tuo browser</li>
                <li>Nelle impostazioni dell'applicazione Food Manager</li>
                <li>Contattandoci direttamente per assistenza</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Nota:</strong> Disabilitare alcuni cookie potrebbe limitare la funzionalità dell'applicazione.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePage;
