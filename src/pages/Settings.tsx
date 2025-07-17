import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Globe, 
  Shield, 
  FileText, 
  Cookie,
  Info,
  Calendar
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [cookiesAccepted, setCookiesAccepted] = useState(true);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: newDarkMode ? "Modalità scura attivata" : "Modalità chiara attivata",
      description: "Le impostazioni sono state salvate"
    });
  };

  const toggleNotifications = async () => {
    if (!notifications) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotifications(true);
          toast({
            title: "Notifiche attivate",
            description: "Riceverai notifiche dal Food Manager"
          });
        }
      } catch (error) {
        toast({
          title: "Errore",
          description: "Impossibile attivare le notifiche",
          variant: "destructive"
        });
      }
    } else {
      setNotifications(false);
      toast({
        title: "Notifiche disattivate",
        description: "Non riceverai più notifiche"
      });
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'it' | 'en' | 'es' | 'fr');
    toast({
      title: "Lingua cambiata",
      description: `Lingua impostata su ${newLanguage === 'it' ? 'Italiano' : newLanguage === 'en' ? 'English' : newLanguage === 'es' ? 'Español' : 'Français'}`
    });
  };

  const today = new Date().toLocaleDateString('it-IT');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {t('settings')}
          </h1>
          <p className="text-muted-foreground">
            Personalizza la tua esperienza Food Manager
          </p>
        </div>

        <div className="grid gap-6">
          {/* Aspetto */}
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  {darkMode ? <Moon className="h-5 w-5 text-white" /> : <Sun className="h-5 w-5 text-white" />}
                </div>
                Aspetto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">{t('darkMode')}</Label>
                  <p className="text-sm text-muted-foreground">
                    Attiva il tema scuro per ridurre l'affaticamento degli occhi
                  </p>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </CardContent>
          </Card>

          {/* Lingua */}
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg border-l-4 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                {t('language')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Seleziona Lingua</Label>
                  <p className="text-sm text-muted-foreground">
                    Cambia la lingua dell'interfaccia
                  </p>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifiche */}
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg border-l-4 border-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                {t('notifications')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Notifiche Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Ricevi notifiche per promemoria e aggiornamenti
                  </p>
                </div>
                <Switch checked={notifications} onCheckedChange={toggleNotifications} />
              </div>
            </CardContent>
          </Card>

          {/* Cookie */}
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg border-l-4 border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Cookie className="h-5 w-5 text-white" />
                </div>
                {t('cookieSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Cookie Essenziali</Label>
                  <p className="text-sm text-muted-foreground">
                    Necessari per il funzionamento dell'app
                  </p>
                </div>
                <Switch checked={cookiesAccepted} onCheckedChange={setCookiesAccepted} />
              </div>
              <Link 
                to="/cookie" 
                className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Informativa Cookie Completa
              </Link>
            </CardContent>
          </Card>

          {/* Informazioni App */}
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg border-l-4 border-teal-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Info className="h-5 w-5 text-white" />
                </div>
                Informazioni App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">{t('version')}</Label>
                <Badge variant="secondary" className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                  v2.1.0
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-foreground">{t('lastUpdate')}</Label>
                <Badge variant="outline" className="border-teal-300 text-teal-700 dark:text-teal-300">
                  {today}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Links Legali */}
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg border-l-4 border-gray-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                Privacy e Sicurezza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                to="/privacy" 
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Termini di Servizio
              </Link>
            </CardContent>
          </Card>

          {/* Il Vikingo del Web */}
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img 
                  src="/lovable-uploads/7c75a14f-99a4-4250-a4c1-00b33d7be67b.png" 
                  alt="Il Vikingo del Web" 
                  className="w-12 h-12 rounded-full"
                />
                <h3 className="text-xl font-bold">Il Vikingo del Web</h3>
              </div>
              <p className="text-orange-100 mb-4">
                Food Manager è sviluppato da Il Vikingo del Web, 
                specialista in soluzioni digitali innovative per la gestione domestica.
              </p>
              <p className="text-xs text-orange-200">
                © 2024 Il Vikingo del Web. Tutti i diritti riservati.
                Questa applicazione è fornita "così com'è" senza garanzie di alcun tipo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
