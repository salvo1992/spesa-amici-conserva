
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Moon, Sun, Globe, Shield, Trash2, Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('it');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1f2937';
      document.body.style.color = '#f9fafb';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotifications(enabled);
    
    if (enabled && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Food Manager', {
            body: 'Notifiche attivate con successo!',
            icon: '/favicon.ico'
          });
          toast({
            title: "Notifiche attivate",
            description: "Riceverai aggiornamenti importanti"
          });
        } else {
          setNotifications(false);
          toast({
            title: "Notifiche negate",
            description: "Abilita le notifiche nelle impostazioni del browser",
            variant: "destructive"
          });
        }
      } catch (error) {
        setNotifications(false);
        toast({
          title: "Errore notifiche",
          description: "Impossibile attivare le notifiche",
          variant: "destructive"
        });
      }
    } else if (!enabled) {
      toast({
        title: "Notifiche disattivate",
        description: "Non riceverai più notifiche"
      });
    }
  };

  const handleExportData = () => {
    const data = {
      settings: { darkMode, notifications, language },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'food-manager-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Dati esportati",
      description: "Le tue impostazioni sono state scaricate"
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.settings) {
          setDarkMode(data.settings.darkMode || false);
          setNotifications(data.settings.notifications || false);
          setLanguage(data.settings.language || 'it');
          
          toast({
            title: "Dati importati",
            description: "Le tue impostazioni sono state ripristinate"
          });
        }
      } catch (error) {
        toast({
          title: "Errore importazione",
          description: "File non valido",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Impostazioni
          </h1>
          <p className="text-muted-foreground">Personalizza la tua esperienza con Food Manager</p>
        </div>

        {/* Preferenze Tema */}
        <Card className="shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="flex items-center gap-2">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Aspetto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="text-base font-medium">Modalità Scura</Label>
                <p className="text-sm text-muted-foreground">Attiva il tema scuro per una migliore esperienza notturna</p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifiche */}
        <Card className="shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifiche
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base font-medium">Notifiche Push</Label>
                <p className="text-sm text-muted-foreground">Ricevi notifiche per promemoria e aggiornamenti</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lingua */}
        <Card className="shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Lingua e Regione
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="language" className="text-base font-medium mb-2 block">Lingua dell'Interfaccia</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup e Ripristino */}
        <Card className="shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Backup e Ripristino
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={handleExportData} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Esporta Dati
                </Button>
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file"
                  />
                  <Button asChild variant="outline" className="w-full">
                    <label htmlFor="import-file" className="cursor-pointer flex items-center justify-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Importa Dati
                    </label>
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Esporta le tue impostazioni per conservarle o trasferirle su un altro dispositivo
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy e Termini */}
        <Card className="shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy e Termini
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/privacy">Informativa Privacy</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/terms">Termini di Servizio</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info App */}
        <Card className="shadow-lg border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle>Informazioni App</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-medium">Versione</span>
                <Badge variant="secondary">1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Ultimo Aggiornamento</span>
                <span className="text-muted-foreground">17 Gennaio 2024</span>
              </div>
              <div className="border-t dark:border-gray-700 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="/lovable-uploads/7c75a14f-99a4-4250-a4c1-00b33d7be67b.png" 
                    alt="Il Vikingo del Web" 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">Il Vikingo del Web</h3>
                    <p className="text-sm text-muted-foreground">Sviluppatore dell'App</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Food Manager è sviluppato con passione da Il Vikingo del Web. 
                  Questa app non è affiliata con nessun brand alimentare o ristorante. 
                  Tutti i marchi e i nomi di prodotti menzionati appartengono ai rispettivi proprietari.
                </p>
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Disclaimer:</strong> Le ricette e i consigli alimentari forniti sono solo a scopo informativo. 
                    Consulta sempre un professionista per esigenze dietetiche specifiche.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
