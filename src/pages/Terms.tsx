
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertTriangle, Scale, Shield } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <FileText className="h-16 w-16 mx-auto text-slate-600 mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-gray-900 bg-clip-text text-transparent mb-2">
            Termini di Servizio
          </h1>
          <p className="text-muted-foreground">
            Condizioni d'uso dell'applicazione Food Manager
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-l-4 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Accettazione dei Termini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Utilizzando Food Manager, accetti questi termini di servizio. Se non accetti tutti i termini,
                non utilizzare il servizio. Ci riserviamo il diritto di modificare questi termini in qualsiasi momento,
                con notifica preventiva agli utenti registrati.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle>Descrizione del Servizio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Food Manager è un'applicazione per la gestione di:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Liste della spesa personali e condivise</li>
                <li>Inventario della dispensa</li>
                <li>Ricette e pianificazione pasti</li>
                <li>Recensioni e valutazioni</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardHeader>
              <CardTitle>Account Utente</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Devi fornire informazioni accurate e aggiornate</li>
                <li>Sei responsabile della sicurezza del tuo account</li>
                <li>Non condividere le credenziali con terzi</li>
                <li>Notifica immediatamente accessi non autorizzati</li>
                <li>Un account per persona</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardHeader>
              <CardTitle>Uso Consentito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-green-600">È Consentito:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Utilizzare l'app per scopi personali e familiari</li>
                  <li>Condividere ricette originali</li>
                  <li>Creare liste condivise con familiari</li>
                  <li>Lasciare recensioni oneste</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-red-600">È Vietato:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Utilizzare contenuti per scopi commerciali senza autorizzazione</li>
                  <li>Condividere contenuti offensivi o illegali</li>
                  <li>Tentare di violare la sicurezza del sistema</li>
                  <li>Creare account multipli o falsi</li>
                  <li>Spam o contenuti promozionali non autorizzati</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Proprietà Intellettuale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">App di Proprietà di Il Vikingo del Web</h4>
                  <p className="text-gray-600">
                    Food Manager è di proprietà di <strong>Il Vikingo del Web</strong>. 
                    Tutti i diritti sono riservati. Il software, il design e i contenuti 
                    sono protetti da copyright.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">I Tuoi Contenuti</h4>
                  <p className="text-gray-600">
                    Mantieni la proprietà delle ricette e contenuti che crei. 
                    Concedendo l'uso dell'app, ci dai il permesso di archiviare 
                    e visualizzare i tuoi contenuti per fornire il servizio.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Limitazione di Responsabilità
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                <p className="text-red-800 font-semibold mb-2">IMPORTANTE:</p>
                <p className="text-red-700">
                  Il Vikingo del Web non si assume alcuna responsabilità per l'uso 
                  che viene fatto dell'applicazione Food Manager.
                </p>
              </div>
              
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>L'app è fornita "così com'è" senza garanzie</li>
                <li>Non garantiamo disponibilità continua del servizio</li>
                <li>Non siamo responsabili per perdite di dati</li>
                <li>L'utente è responsabile dell'uso corretto dell'applicazione</li>
                <li>Escludiamo responsabilità per danni diretti o indiretti</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-gray-500">
            <CardHeader>
              <CardTitle>Modifiche e Terminazione</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Possiamo modificare o sospendere il servizio con preavviso</li>
                <li>Puoi cancellare il tuo account in qualsiasi momento</li>
                <li>Ci riserviamo il diritto di terminare account che violano i termini</li>
                <li>La terminazione non pregiudica diritti già acquisiti</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-0">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Il Vikingo del Web</h3>
                <p className="text-gray-600">
                  Proprietario e sviluppatore di Food Manager
                </p>
              </div>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>Versione dei Termini: 1.0</p>
                <p>Data di efficacia: {new Date().toLocaleDateString()}</p>
                <p>Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;
