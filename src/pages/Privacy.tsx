
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Users, Mail, Phone } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Shield className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Informativa sulla Privacy
          </h1>
          <p className="text-muted-foreground">
            La tua privacy è importante per noi. Ecco come proteggiamo i tuoi dati.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Dati che Raccogliamo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Informazioni dell'Account</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Nome e cognome</li>
                  <li>Indirizzo email</li>
                  <li>Password (crittografata)</li>
                  <li>Numero di telefono (opzionale)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Dati dell'Applicazione</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Liste della spesa create</li>
                  <li>Ricette salvate</li>
                  <li>Prodotti in dispensa</li>
                  <li>Preferenze e impostazioni</li>
                  <li>Recensioni e valutazioni</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Come Proteggiamo i Tuoi Dati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Crittografia SSL/TLS per tutte le comunicazioni</li>
                <li>Database sicuri con backup regolari</li>
                <li>Accesso limitato ai dati del personale autorizzato</li>
                <li>Monitoraggio continuo della sicurezza</li>
                <li>Conformità alle normative GDPR</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Come Utilizziamo i Tuoi Dati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Fornire e migliorare i nostri servizi</li>
                <li>Personalizzare la tua esperienza</li>
                <li>Inviarti notifiche importanti</li>
                <li>Rispondere alle tue richieste di supporto</li>
                <li>Analizzare l'utilizzo per miglioramenti</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardHeader>
              <CardTitle>I Tuoi Diritti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Accesso e Controllo</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Visualizzare i dati che abbiamo su di te</li>
                    <li>Correggere informazioni inesatte</li>
                    <li>Richiedere la cancellazione dei dati</li>
                    <li>Esportare i tuoi dati</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Consenso</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Revocare il consenso in qualsiasi momento</li>
                    <li>Opporti al trattamento</li>
                    <li>Limitare l'uso dei dati</li>
                    <li>Presentare reclami all'autorità</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Hai Domande?</h3>
                <p className="text-gray-600 mb-4">
                  Per qualsiasi domanda sulla privacy o per esercitare i tuoi diritti, contattaci:
                </p>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    privacy@foodmanager.app
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    +39 123 456 7890
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Ultimo aggiornamento: {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
