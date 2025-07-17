
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Cookie, Shield, FileText } from 'lucide-react';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookies-accepted');
    if (!hasAccepted) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookies-accepted', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <Cookie className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cookie e Privacy</h3>
              <p className="text-sm text-gray-600 mb-3">
                Utilizziamo cookie per migliorare la tua esperienza. Continuando accetti i nostri termini.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button onClick={handleAccept} className="flex-1 bg-green-600 hover:bg-green-700">
                Accetta
              </Button>
              <Button variant="outline" onClick={handleDecline} className="flex-1">
                Rifiuta
              </Button>
            </div>
            
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs text-green-600">
                  Maggiori informazioni
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Informativa Cookie e Privacy
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Cookie Utilizzati</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Cookie di autenticazione per il login</li>
                      <li>Cookie di preferenze per salvare le impostazioni</li>
                      <li>Cookie tecnici per il funzionamento dell'app</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Dati Raccolti</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Email e nome per la registrazione</li>
                      <li>Liste della spesa e ricette personali</li>
                      <li>Preferenze dell'applicazione</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">I Tuoi Diritti</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Accesso ai dati personali</li>
                      <li>Rettifica e cancellazione</li>
                      <li>Portabilità dei dati</li>
                      <li>Revoca del consenso</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieBanner;
