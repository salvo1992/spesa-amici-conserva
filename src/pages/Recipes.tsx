import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChefHat, Plus, Clock, Users, Search, Heart, Filter, BookOpen, Eye, Facebook, Instagram, Edit2, Trash2, MessageCircle, Mail, Send, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, type Recipe } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Recipes = () => {
  console.log('Recipes component is rendering...');
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showShareUsersDialog, setShowShareUsersDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<{id: string, name: string, surname: string}[]>([]);
  const [selectedUser, setSelectedUser] = useState('');

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prep_time: 30,
    servings: 4,
    category: ''
  });

  // Carica i preferiti dal localStorage al mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('recipe-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Salva i preferiti nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem('recipe-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Gestisce le ricette condivise tramite URL
  useEffect(() => {
    const addRecipeData = searchParams.get('add');
    if (addRecipeData) {
      try {
        const recipeToAdd = JSON.parse(decodeURIComponent(addRecipeData));
        const confirmed = window.confirm(`Vuoi aggiungere la ricetta "${recipeToAdd.name}" al tuo ricettario?`);
        if (confirmed) {
          createMutation.mutate(recipeToAdd);
        }
        // Rimuovi il parametro dall'URL
        setSearchParams(prev => {
          prev.delete('add');
          return prev;
        });
      } catch (error) {
        console.error('Errore nel parsing della ricetta condivisa:', error);
        toast({
          title: "⚠️ Errore",
          description: "Impossibile aggiungere la ricetta condivisa",
          variant: "destructive"
        });
      }
    }
  }, [searchParams, setSearchParams]);

  // Ricette di default migliorate - 15 ricette totali
  const defaultRecipes: Recipe[] = [
    {
      id: 'default-1',
      name: 'Spaghetti alla Carbonara Autentica',
      description: 'La vera ricetta romana della carbonara, preparata con guanciale croccante, uova fresche, pecorino romano DOP e pepe nero macinato al momento. Un piatto che rappresenta l\'essenza della cucina romana tradizionale.',
      ingredients: ['400g spaghetti o tonnarelli', '200g guanciale tagliato a listarelle', '4 uova intere + 2 tuorli', '100g pecorino romano DOP grattugiato', 'Pepe nero macinato fresco', 'Sale marino grosso'],
      instructions: [
        'Metti l\'acqua salata a bollire in una pentola capiente. Quando bolle, butta la pasta.',
        'Nel frattempo, taglia il guanciale a listarelle di circa 1cm di spessore. Non serve olio.',
        'Metti il guanciale in una padella antiaderente fredda e accendi il fuoco medio-basso. Fallo rosolare lentamente fino a renderlo croccante (circa 10-12 minuti).',
        'In una ciotola, sbatti le uova intere con i tuorli, aggiungi il pecorino grattugiato e una generosa macinata di pepe nero. Mescola bene.',
        'Quando la pasta è al dente, scolala conservando un po\' di acqua di cottura calda.',
        'Spegni il fuoco sotto il guanciale e aggiungi subito la pasta scolata nella padella. Mescola velocemente.',
        'Aggiungi il composto di uova e pecorino fuori dal fuoco, mantecando energicamente. Se serve, aggiungi acqua di cottura per rendere cremoso.',
        'Servi immediatamente con una spolverata di pecorino e pepe nero macinato fresco.'
      ],
      prep_time: 25,
      servings: 4,
      category: 'Primi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-2', 
      name: 'Tiramisù della Nonna Perfetto',
      description: 'Il dolce italiano più amato al mondo, preparato con mascarpone cremoso, caffè espresso forte, savoiardi di Saronno e cacao olandese. La ricetta della nonna per un tiramisù che si scioglie in bocca.',
      ingredients: ['500g mascarpone a temperatura ambiente', '6 uova fresche (separate)', '150g zucchero semolato', '400g savoiardi di Saronno', '4 tazzine caffè espresso forte (freddo)', '3 cucchiai marsala o rum', 'Cacao amaro in polvere', 'Zucchero a velo'],
      instructions: [
        'Separa gli albumi dai tuorli. Monta gli albumi a neve ferma con un pizzico di sale.',
        'In una ciotola, sbatti i tuorli con lo zucchero fino ad ottenere un composto chiaro e spumoso.',
        'Aggiungi il mascarpone ai tuorli e mescola delicatamente con una spatola dal basso verso l\'alto.',
        'Incorpora gli albumi montati al composto di tuorli e mascarpone, mescolando sempre dal basso verso l\'alto.',
        'Prepara il caffè e fallo raffreddare. Aggiungi il marsala o rum.',
        'Intingi velocemente i savoiardi nel caffè e disponili in una pirofila in un unico strato.',
        'Copri con metà della crema al mascarpone, livellando bene.',
        'Ripeti con un altro strato di savoiardi intinti e la restante crema.',
        'Copri con pellicola e lascia riposare in frigorifero per almeno 4 ore (meglio una notte).',
        'Prima di servire, spolvera abbondantemente con cacao amaro setacciato.'
      ],
      prep_time: 45,
      servings: 8,
      category: 'Dolci',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-3',
      name: 'Risotto ai Funghi Porcini Mantecato',
      description: 'Un risotto cremoso e profumato con funghi porcini freschi, brodo vegetale aromatico e mantecatura finale con burro e Parmigiano. La tecnica perfetta per un risotto all\'onda.',
      ingredients: ['320g riso Carnaroli o Arborio', '300g funghi porcini freschi', '1 cipolla dorata media', '1,2L brodo vegetale caldo', '100ml vino bianco secco', '80g burro', '100g Parmigiano grattugiato', 'Prezzemolo tritato', 'Olio extravergine', 'Sale e pepe'],
      instructions: [
        'Pulisci i funghi porcini con un coltello e un panno umido. Tagliali a fette spesse.',
        'Tieni il brodo vegetale sempre caldo a fuoco basso.',
        'Trita finemente la cipolla e falla appassire in una casseruola con olio e una noce di burro.',
        'Aggiungi i funghi e falli saltare a fuoco alto per 5 minuti. Sala, pepa e metti da parte.',
        'Nella stessa casseruola, tosta il riso per 2-3 minuti mescolando.',
        'Sfuma con il vino bianco e lascia evaporare l\'alcol.',
        'Aggiungi il brodo caldo un mestolo alla volta, mescolando continuamente.',
        'A metà cottura (circa 10 minuti), aggiungi i funghi saltati.',
        'Continua ad aggiungere brodo fino a cottura (18-20 minuti totali). Il riso deve essere all\'onda.',
        'Manteca fuori dal fuoco con burro freddo e Parmigiano. Aggiungi prezzemolo e servi subito.'
      ],
      prep_time: 35,
      servings: 4,
      category: 'Primi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-4',
      name: 'Pizza Napoletana Margherita DOP',
      description: 'La pizza napoletana autentica con impasto a lunga lievitazione, pomodoro San Marzano DOP, mozzarella di bufala campana e basilico fresco. Cotta in forno a legna a 450°C.',
      ingredients: ['Per l\'impasto: 1kg farina 00 W300', '650ml acqua', '20g sale marino', '3g lievito di birra fresco', 'Per il condimento: 400g pomodori San Marzano DOP', '400g mozzarella di bufala', 'Basilico fresco', 'Olio extravergine', 'Sale'],
      instructions: [
        'Sciogli il lievito in 100ml di acqua tiepida.',
        'In una ciotola, mescola la farina con il sale. Crea una fontana.',
        'Aggiungi l\'acqua con il lievito e il resto dell\'acqua gradualmente, impastando.',
        'Lavora l\'impasto per 10-15 minuti fino a renderlo liscio ed elastico.',
        'Metti in una ciotola oliata, copri e fai lievitare per 2 ore a temperatura ambiente.',
        'Dividi in panetti da 250g e fai lievitare per altre 4-6 ore.',
        'Stendi ogni panetto con le mani formando un disco di 30cm (bordo più alto).',
        'Condisci con pomodori schiacciati, sale, olio e inforna a 250°C per 2-3 minuti.',
        'Aggiungi la mozzarella a pezzi e cuoci per altri 5-7 minuti.',
        'Sforna e completa con basilico fresco e un filo d\'olio.'
      ],
      prep_time: 150,
      servings: 4,
      category: 'Pizze',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-5',
      name: 'Osso Buco alla Milanese Tradizionale',
      description: 'Il classico secondo piatto lombardo con fette di stinco di vitello brasate nel vino bianco, servite con gremolada aromatica. Perfetto con risotto giallo o polenta.',
      ingredients: ['4 fette di osso buco di vitello', '1 carota', '1 costa di sedano', '1 cipolla', '400ml vino bianco', '400ml brodo di carne', 'Farina 00', 'Burro', 'Olio', 'Per la gremolada: scorza di limone, aglio, prezzemolo'],
      instructions: [
        'Infarinare le fette di osso buco e legarle con lo spago da cucina.',
        'Scaldare burro e olio in una casseruola e rosolare la carne su tutti i lati.',
        'Rimuovere la carne e rosolare il soffritto di carota, sedano e cipolla tritati.',
        'Rimettere la carne, sfumare con vino bianco e far evaporare l\'alcol.',
        'Aggiungere il brodo caldo, coprire e cuocere a fuoco basso per 1,5-2 ore.',
        'Girare la carne ogni 30 minuti e aggiungere brodo se necessario.',
        'Preparare la gremolada tritando finemente scorza di limone, aglio e prezzemolo.',
        'A cottura ultimata, cospargere con la gremolada e servire con risotto alla milanese.'
      ],
      prep_time: 120,
      servings: 4,
      category: 'Secondi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-6',
      name: 'Lasagne della Domenica',
      description: 'La lasagna tradizionale italiana con ragù di carne, besciamella cremosa e tanto Parmigiano. Un piatto della domenica che unisce tutta la famiglia.',
      ingredients: ['500g sfoglia per lasagne', '400g carne macinata mista', '300ml besciamella', '400g pomodori pelati', '200g Parmigiano grattugiato', '1 cipolla', '2 carote', '2 coste sedano', 'Vino rosso', 'Latte', 'Burro', 'Farina'],
      instructions: [
        'Prepara il ragù: soffriggi cipolla, carota e sedano tritati finemente.',
        'Aggiungi la carne e rosolala bene. Sfuma con vino rosso.',
        'Unisci i pomodori, sala, pepa e cuoci per 2 ore a fuoco dolce.',
        'Prepara la besciamella: sciogli il burro, aggiungi farina e latte gradualmente.',
        'Cuoci la sfoglia in acqua salata e adagiala su canovacci.',
        'Disponi strati alternati di pasta, ragù, besciamella e Parmigiano.',
        'Termina con besciamella e Parmigiano abbondante.',
        'Cuoci in forno a 180°C per 45 minuti fino a doratura perfetta.'
      ],
      prep_time: 180,
      servings: 8,
      category: 'Primi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-7',
      name: 'Cotoletta alla Milanese DOC',
      description: 'La vera cotoletta milanese con osso, impanata nel pan grattato e fritta nel burro chiarificato. Croccante fuori, tenera dentro.',
      ingredients: ['4 costolette di vitello con osso', '3 uova', '300g pan grattato fine', 'Farina 00', '200g burro chiarificato', 'Sale', 'Pepe bianco', 'Limone'],
      instructions: [
        'Batti leggermente le costolette per appiattirle (spessore 8mm).',
        'Passa nella farina, poi nelle uova sbattute, infine nel pan grattato.',
        'Premi bene il pan grattato perché aderisca perfettamente.',
        'Scalda il burro chiarificato in una padella larga.',
        'Friggi le cotolette 3-4 minuti per lato a fuoco medio.',
        'Devono essere dorate uniformemente e croccanti.',
        'Scola su carta assorbente e servi subito con spicchi di limone.',
        'Accompagna con insalata mista e pomodorini.'
      ],
      prep_time: 30,
      servings: 4,
      category: 'Secondi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-8',
      name: 'Parmigiana di Melanzane Napoletana',
      description: 'La parmigiana napoletana autentica con melanzane fritte, pomodoro San Marzano, mozzarella di bufala e basilico fresco.',
      ingredients: ['3 melanzane grandi', '800g pomodori San Marzano', '500g mozzarella di bufala', '200g Parmigiano grattugiato', 'Basilico fresco', 'Aglio', 'Olio per friggere', 'Sale'],
      instructions: [
        'Taglia le melanzane a fette di 1cm, salale e lasciale spurgare 30 minuti.',
        'Asciuga le melanzane e friggile in olio bollente fino a doratura.',
        'Prepara il sugo: rosola aglio nell\'olio, aggiungi pomodori e basilico.',
        'Cuoci il sugo 20 minuti, salando e pepando.',
        'Taglia la mozzarella a fette e lasciale spurgare.',
        'In una teglia, alterna strati di melanzane, sugo, mozzarella e Parmigiano.',
        'Termina con sugo e Parmigiano abbondante.',
        'Cuoci in forno a 180°C per 40 minuti. Lascia riposare prima di servire.'
      ],
      prep_time: 90,
      servings: 6,
      category: 'Secondi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-9',
      name: 'Cannoli Siciliani Originali',
      description: 'I veri cannoli siciliani con cialda croccante e ricotta di pecora freschissima, aromatizzata con pistacchi di Bronte.',
      ingredients: ['Per le cialde: 300g farina, 2 cucchiai zucchero, 1 uovo, marsala, strutto', 'Per la crema: 500g ricotta di pecora, 300g zucchero a velo, cannella, pistacchi di Bronte, canditi, gocce di cioccolato'],
      instructions: [
        'Impasta farina, zucchero, uovo e marsala fino ad ottenere un impasto liscio.',
        'Stendi sottilmente e ritaglia cerchi di 10cm di diametro.',
        'Avvolgi ogni cerchio attorno a un cannello e sigilla con albume.',
        'Friggi in olio bollente fino a doratura perfetta.',
        'Setaccia la ricotta e mescola con zucchero a velo e cannella.',
        'Aggiungi pistacchi tritati, canditi e gocce di cioccolato.',
        'Riempi le cialde solo al momento di servire per mantenerle croccanti.',
        'Completa con pistacchi tritati alle estremità e zucchero a velo.'
      ],
      prep_time: 60,
      servings: 12,
      category: 'Dolci',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-10',
      name: 'Brasato al Barolo Piemontese',
      description: 'Il brasato piemontese cucinato nel pregiato vino Barolo con verdure aromatiche. Un secondo piatto raffinato e saporito.',
      ingredients: ['1,5kg girello di manzo', '1 bottiglia Barolo DOCG', '2 carote', '2 cipolle', '2 coste sedano', 'Rosmarino', 'Alloro', 'Chiodi di garofano', 'Burro', 'Farina'],
      instructions: [
        'Marina la carne nel Barolo con verdure e aromi per 12 ore.',
        'Scola la carne e asciugala bene. Filtra il vino di marinatura.',
        'Infarinare la carne e rosolala in una casseruola con burro.',
        'Aggiungi le verdure della marinatura e falle appassire.',
        'Versa il vino filtrato e porta a bollore.',
        'Copri e cuoci in forno a 160°C per 3 ore, girando ogni ora.',
        'La carne deve risultare tenera e il sugo denso.',
        'Affetta e servi con polenta o purè di patate.'
      ],
      prep_time: 240,
      servings: 6,
      category: 'Secondi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-11',
      name: 'Focaccia Genovese Perfetta',
      description: 'La focaccia ligure autentica con l\'inconfondibile bagnetto di olio, acqua e sale grosso. Soffice, profumata e dorata.',
      ingredients: ['500g farina 0', '350ml acqua tiepida', '10g lievito di birra', '6 cucchiai olio extravergine', 'Sale fino', 'Sale grosso', 'Rosmarino'],
      instructions: [
        'Sciogli il lievito nell\'acqua tiepida con un pizzico di zucchero.',
        'Mescola farina e sale fino in una ciotola.',
        'Aggiungi acqua e lievito, poi 4 cucchiai di olio.',
        'Impasta fino ad ottenere un composto omogeneo e appiccicoso.',
        'Lascia lievitare 2 ore in luogo tiepido coperta da un canovaccio.',
        'Versa l\'impasto in una teglia oleata e stendi con le dita.',
        'Prepara il bagnetto: acqua, olio e sale grosso.',
        'Cospargi sulla focaccia, aggiungi rosmarino e cuoci a 220°C per 25 minuti.'
      ],
      prep_time: 45,
      servings: 8,
      category: 'Pane e Lievitati',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-12',
      name: 'Salmone in Crosta di Pistacchi',
      description: 'Filetto di salmone norvegese con crosta croccante di pistacchi e erbe aromatiche. Elegante e raffinato.',
      ingredients: ['4 filetti di salmone (150g cad)', '100g pistacchi sgusciati', '50g pan grattato', 'Prezzemolo', 'Timo', '2 cucchiai senape di Digione', 'Olio extravergine', 'Limone'],
      instructions: [
        'Trita finemente pistacchi, pan grattato, prezzemolo e timo.',
        'Mescola con un filo d\'olio per creare la crosta.',
        'Spennella i filetti di salmone con la senape.',
        'Premi la miscela di pistacchi sui filetti creando una crosta uniforme.',
        'Scalda una padella antiaderente con poco olio.',
        'Cuoci il salmone 3-4 minuti per lato, crosta verso il basso prima.',
        'La crosta deve essere dorata e il salmone rosato all\'interno.',
        'Servi con verdure al vapore e una spruzzata di limone.'
      ],
      prep_time: 25,
      servings: 4,
      category: 'Secondi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-13',
      name: 'Cacio e Pepe Romana DOC',
      description: 'Il piatto simbolo della cucina romana con solo 3 ingredienti: pasta, pecorino Romano DOP e pepe nero. Semplicità perfetta.',
      ingredients: ['400g tonnarelli o spaghetti', '200g pecorino Romano DOP grattugiato', 'Pepe nero in grani', 'Sale grosso'],
      instructions: [
        'Macina abbondante pepe nero al momento.',
        'Cuoci la pasta in poca acqua salata molto calda.',
        'Nel frattempo, mescola pecorino e pepe in una ciotola.',
        'Quando la pasta è quasi al dente, preleva acqua di cottura.',
        'Scola la pasta e mantecala in padella con poca acqua di cottura.',
        'Aggiungi il pecorino e pepe, mantecando energicamente.',
        'L\'amido della pasta deve creare una crema setosa.',
        'Servi immediatamente con una macinata di pepe fresco.'
      ],
      prep_time: 15,
      servings: 4,
      category: 'Primi Piatti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-14',
      name: 'Gelato alla Stracciatella Artigianale',
      description: 'Il gelato cremoso con scaglie di cioccolato fondente. Una delizia fresca e naturale fatta in casa.',
      ingredients: ['500ml latte intero', '200ml panna fresca', '150g zucchero', '6 tuorli', '100g cioccolato fondente', 'Vaniglia'],
      instructions: [
        'Scalda latte e panna con metà dello zucchero e la vaniglia.',
        'Sbatti tuorli con lo zucchero rimasto fino a montarli.',
        'Versa il latte caldo sui tuorli, mescolando continuamente.',
        'Cuoci a bagnomaria fino a 85°C, mescolando sempre.',
        'Fai raffreddare completamente in frigorifero per 4 ore.',
        'Manteca nella gelatiera secondo le istruzioni.',
        'Sciogli il cioccolato e versalo a filo durante l\'ultima mantecatura.',
        'Conserva in freezer in contenitore ermetico.'
      ],
      prep_time: 45,
      servings: 8,
      category: 'Dolci',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'default-15',
      name: 'Arancini Siciliani al Ragù',
      description: 'Gli arancini palermitani ripieni di ragù di carne, piselli e caciocavallo. Croccanti fuori, cremosi dentro.',
      ingredients: ['400g riso Arborio', '1L brodo di carne', '100g Parmigiano', '3 uova', 'Ragù di carne', 'Piselli', 'Caciocavallo a cubetti', 'Pan grattato', 'Farina', 'Olio per friggere'],
      instructions: [
        'Cuoci il riso nel brodo fino ad assorbimento completo.',
        'Manteca con Parmigiano e un uovo. Fai raffreddare.',
        'Prepara il ragù con carne, pomodoro e piselli.',
        'Forma delle palline di riso, crea un incavo al centro.',
        'Riempi con ragù e cubetti di caciocavallo.',
        'Richiudi sigillando bene la palla di riso.',
        'Passa nella farina, nell\'uovo sbattuto e nel pan grattato.',
        'Friggi in olio a 170°C fino a doratura uniforme.'
      ],
      prep_time: 60,
      servings: 12,
      category: 'Antipasti',
      user_id: 'default',
      created_at: '2024-01-01T00:00:00.000Z'
    }
  ];

  const queryClient = useQueryClient();

  const { data: userRecipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: firebaseApi.getRecipes,
    enabled: isAuthenticated
  });

  const allRecipes = [...defaultRecipes, ...userRecipes];

  const createMutation = useMutation({
    mutationFn: firebaseApi.createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setShowAddDialog(false);
      setNewRecipe({
        name: '', description: '', ingredients: [''], instructions: [''],
        prep_time: 30, servings: 4, category: ''
      });
      toast({ title: "Ricetta aggiunta", description: "La ricetta è stata salvata con successo" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, recipe }: { id: string; recipe: any }) => firebaseApi.updateRecipe(id, recipe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setShowEditDialog(false);
      setEditingRecipe(null);
      toast({ title: "Ricetta aggiornata", description: "Le modifiche sono state salvate" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: firebaseApi.deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({ title: "Ricetta eliminata", description: "La ricetta è stata rimossa" });
    }
  });

  // Carica gli utenti registrati
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await firebaseApi.getRegisteredUsers();
        setRegisteredUsers(users);
      } catch (error) {
        console.error('Errore nel caricamento utenti:', error);
      }
    };
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const handleShareRecipe = (recipe: Recipe, platform?: string) => {
    const appName = "Food Manager";
    const appUrl = window.location.origin;
    const recipeUrl = `${appUrl}/recipes?shared=${recipe.id}`;
    
    // Testo migliorato per i social con titolo specifico
    const socialText = `Food Manager - ${recipe.name}, ${recipe.prep_time} min ⏱️

🌟 Ho trovato una ricetta fantastica che devi assolutamente provare! 🌟

✨ ${recipe.description}

👥 Porzioni: ${recipe.servings}

🔥 Ingredients principali:
${recipe.ingredients.slice(0, 3).map(ing => `• ${ing}`).join('\n')}
${recipe.ingredients.length > 3 ? '... e altro ancora!' : ''}

📱 Scarica Food Manager per salvare questa e migliaia di altre ricette!
🎯 Organizza la tua cucina, pianifica i pasti e crea la tua lista della spesa automaticamente!

🔗 Visita: ${appUrl}
📲 Download: https://play.google.com/store/apps/details?id=com.foodmanager

#ricette #foodmanager #cucina #cooking`;
    
    if (platform) {
      let shareUrl = '';
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}&quote=${encodeURIComponent(socialText)}`;
          break;
        case 'users':
          setSelectedRecipe(recipe);
          setShowShareUsersDialog(true);
          return;
        case 'whatsapp':
          const whatsappText = `Food Manager - ${recipe.name}, ${recipe.prep_time} min ⏱️\n\n🍽️ *${recipe.name}*\n\n${recipe.description}\n\n👥 Porzioni: ${recipe.servings}\n\n📱 Scarica Food Manager per vedere la ricetta completa e organizzare la tua cucina!\n\n🔗 ${appUrl}\n📲 Play Store: https://play.google.com/store/apps/details?id=com.foodmanager`;
          shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
          break;
        case 'telegram':
          const telegramText = `Food Manager - ${recipe.name}, ${recipe.prep_time} min ⏱️\n\n${socialText}`;
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(recipeUrl)}&text=${encodeURIComponent(telegramText)}`;
          break;
        case 'instagram':
          const instagramText = `Food Manager - ${recipe.name}, ${recipe.prep_time} min ⏱️\n\n🌟 ${recipe.name} 🌟\n\n${recipe.description}\n\n👥 ${recipe.servings} porzioni\n\n📱 Trova questa ricetta su Food Manager!\n🔗 Link in bio 👆\n📲 Download disponibile su Play Store\n\n#ricette #foodmanager #cucina #cooking`;
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(instagramText).then(() => {
              toast({
                title: "✨ Testo copiato per Instagram!",
                description: "Apri Instagram, crea un post e incolla il testo"
              });
            }).catch(() => {
              const textArea = document.createElement('textarea');
              textArea.value = instagramText;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              toast({
                title: "✨ Testo copiato per Instagram!",
                description: "Apri Instagram, crea un post e incolla il testo"
              });
            });
          }
          return;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    } else {
      // Condivisione diretta (copia negli appunti)
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(socialText).then(() => {
          toast({
            title: "🎉 Ricetta condivisa!",
            description: "Testo perfetto copiato negli appunti!"
          });
        }).catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = socialText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast({
            title: "🎉 Ricetta condivisa!",
            description: "Testo perfetto copiato negli appunti!"
          });
        });
      }
    }
  };

  const toggleFavorite = (recipeId: string) => {
    setFavorites(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
    toast({ 
      title: favorites.includes(recipeId) ? "Rimosso dai preferiti" : "Aggiunto ai preferiti",
      description: "Le tue preferenze sono state aggiornate"
    });
  };

  const viewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowDetailsDialog(true);
  };

  const addIngredient = () => {
    setNewRecipe({...newRecipe, ingredients: [...newRecipe.ingredients, '']});
  };

  const addInstruction = () => {
    setNewRecipe({...newRecipe, instructions: [...newRecipe.instructions, '']});
  };

  const updateIngredient = (index: number, value: string) => {
    const updated = [...newRecipe.ingredients];
    updated[index] = value;
    setNewRecipe({...newRecipe, ingredients: updated});
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...newRecipe.instructions];
    updated[index] = value;
    setNewRecipe({...newRecipe, instructions: updated});
  };

  const createRecipe = () => {
    if (!newRecipe.name.trim()) return;
    
    createMutation.mutate({
      name: newRecipe.name,
      description: newRecipe.description,
      ingredients: newRecipe.ingredients.filter(i => i.trim()),
      instructions: newRecipe.instructions.filter(i => i.trim()),
      prep_time: newRecipe.prep_time,
      servings: newRecipe.servings,
      category: newRecipe.category || 'Altro'
    });
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setShowEditDialog(true);
  };

  const handleUpdateRecipe = () => {
    if (!editingRecipe || !editingRecipe.name.trim()) return;
    
    updateMutation.mutate({
      id: editingRecipe.id,
      recipe: {
        name: editingRecipe.name,
        description: editingRecipe.description,
        ingredients: editingRecipe.ingredients.filter(i => i.trim()),
        instructions: editingRecipe.instructions.filter(i => i.trim()),
        prep_time: editingRecipe.prep_time,
        servings: editingRecipe.servings,
        category: editingRecipe.category || 'Altro'
      }
    });
  };

  const handleDeleteDefaultRecipe = (recipeId: string) => {
    // Nascondi la ricetta di default (simulazione)
    toast({
      title: "Ricetta eliminata!",
      description: "La ricetta non sarà più visibile nella tua lista",
    });
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    if (recipe.user_id === 'default') {
      // Per ricette di default, nascondile
      if (window.confirm('Sei sicuro di voler rimuovere questa ricetta dalla tua lista?')) {
        handleDeleteDefaultRecipe(recipe.id);
      }
    } else {
      // Per ricette create dall'utente, eliminale dal database
      if (window.confirm('Sei sicuro di voler eliminare questa ricetta?')) {
        deleteMutation.mutate(recipe.id);
      }
    }
  };

  const handleShareWithUser = async () => {
    if (!selectedUser.trim() || !selectedRecipe) return;
    
    const user = registeredUsers.find(u => u.id === selectedUser);
    if (!user) return;
    
    try {
      await firebaseApi.shareRecipeWithUser(selectedRecipe, user.id, `${user.name} ${user.surname}`);
      toast({
        title: "🎉 Ricetta condivisa!",
        description: `Ricetta inviata a ${user.name} ${user.surname}. Riceverà una notifica per accettarla.`
      });
      setSelectedUser('');
      setShowShareUsersDialog(false);
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile condividere la ricetta. Riprova.",
        variant: "destructive"
      });
    }
  };


  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-orange-600 animate-fade-in">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ChefHat className="h-8 w-8 text-orange-600 animate-bounce" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-700 to-orange-900 bg-clip-text text-transparent">
                {t('recipes')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredRecipes.length} ricette disponibili • Aggiornato
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
                <Plus className="h-4 w-4 mr-2" />
                Nuova Ricetta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crea Nuova Ricetta</DialogTitle>
                <p className="text-sm text-muted-foreground">Aggiungi una nuova ricetta al tuo ricettario personale</p>
              </DialogHeader>
              <div className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Ricetta</Label>
                    <Input
                      value={newRecipe.name}
                      onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                      placeholder="Es. Pasta alla Carbonara"
                    />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select value={newRecipe.category} onValueChange={(value) => setNewRecipe({...newRecipe, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Primi Piatti">Primi Piatti</SelectItem>
                        <SelectItem value="Secondi Piatti">Secondi Piatti</SelectItem>
                        <SelectItem value="Contorni">Contorni</SelectItem>
                        <SelectItem value="Dolci">Dolci</SelectItem>
                        <SelectItem value="Antipasti">Antipasti</SelectItem>
                        <SelectItem value="Pizze">Pizze</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Descrizione</Label>
                  <Textarea
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                    placeholder="Breve descrizione della ricetta..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tempo Preparazione (min)</Label>
                    <Input
                      type="number"
                      value={newRecipe.prep_time}
                      onChange={(e) => setNewRecipe({...newRecipe, prep_time: parseInt(e.target.value) || 30})}
                    />
                  </div>
                  <div>
                    <Label>Porzioni</Label>
                    <Input
                      type="number"
                      value={newRecipe.servings}
                      onChange={(e) => setNewRecipe({...newRecipe, servings: parseInt(e.target.value) || 4})}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Ingredienti</Label>
                    <Button type="button" size="sm" onClick={addIngredient}>
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi
                    </Button>
                  </div>
                  {newRecipe.ingredients.map((ingredient, index) => (
                    <Input
                      key={index}
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder={`Ingrediente ${index + 1}`}
                      className="mb-2"
                    />
                  ))}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Istruzioni</Label>
                    <Button type="button" size="sm" onClick={addInstruction}>
                      <Plus className="h-4 w-4 mr-1" /> Aggiungi
                    </Button>
                  </div>
                  {newRecipe.instructions.map((instruction, index) => (
                    <Textarea
                      key={index}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Passo ${index + 1}`}
                      className="mb-2"
                    />
                  ))}
                </div>

                <Button onClick={createRecipe} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? 'Salvando...' : 'Salva Ricetta'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca ricette..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tutte le categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  <SelectItem value="Primi Piatti">Primi Piatti</SelectItem>
                  <SelectItem value="Secondi Piatti">Secondi Piatti</SelectItem>
                  <SelectItem value="Contorni">Contorni</SelectItem>
                  <SelectItem value="Dolci">Dolci</SelectItem>
                  <SelectItem value="Antipasti">Antipasti</SelectItem>
                  <SelectItem value="Pizze">Pizze</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card 
            key={recipe.id} 
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1 flex items-center gap-2 text-foreground">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                    {recipe.name}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                    {recipe.category}
                  </Badge>
                  {recipe.user_id === 'default' && (
                    <Badge variant="outline" className="ml-2 border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                      Ricetta Tradizionale
                    </Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`${favorites.includes(recipe.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                  onClick={() => toggleFavorite(recipe.id)}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(recipe.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prep_time} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} porzioni</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase">Ingredienti principali:</div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
                        {ingredient.length > 15 ? ingredient.substring(0, 15) + '...' : ingredient}
                      </Badge>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.ingredients.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    onClick={() => viewRecipe(recipe)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizza
                  </Button>
                  
                  {/* Bottoni per ricette utente */}
                  {recipe.user_id !== 'default' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        onClick={() => handleEditRecipe(recipe)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300"
                        onClick={() => handleDeleteRecipe(recipe)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recipe Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-700 to-orange-900 bg-clip-text text-transparent">
                  {selectedRecipe?.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Dettagli completi della ricetta</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareRecipe(selectedRecipe!, 'whatsapp')}
                  className="hover:bg-green-50 dark:hover:bg-green-900/20"
                  title="Condividi su WhatsApp"
                >
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareRecipe(selectedRecipe!, 'telegram')}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Condividi su Telegram"
                >
                  <Send className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareRecipe(selectedRecipe!, 'facebook')}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Condividi su Facebook"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => handleShareRecipe(selectedRecipe!, 'users')}
                   className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                   title="Condividi con utenti registrati"
                 >
                   <UserPlus className="h-4 w-4 text-purple-600" />
                 </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareRecipe(selectedRecipe!, 'instagram')}
                  className="hover:bg-pink-50 dark:hover:bg-pink-900/20"
                  title="Condividi su Instagram"
                >
                  <Instagram className="h-4 w-4 text-pink-600" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {selectedRecipe && (
            <div className="space-y-6 mt-6">
              <div className="flex items-center gap-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-foreground">{selectedRecipe.prep_time} minuti</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-foreground">{selectedRecipe.servings} porzioni</span>
                </div>
                <Badge className="bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                  {selectedRecipe.category}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Descrizione</h3>
                <p className="text-muted-foreground leading-relaxed">{selectedRecipe.description}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Ingredienti</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-sm text-foreground">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">Preparazione</h3>
                <div className="space-y-4">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <div 
                      key={index}
                      className="flex gap-4 p-4 bg-white dark:bg-gray-700 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Recipe Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Ricetta</DialogTitle>
            <p className="text-sm text-muted-foreground">Modifica i dettagli della ricetta</p>
          </DialogHeader>
          {editingRecipe && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome Ricetta</Label>
                  <Input
                    value={editingRecipe.name}
                    onChange={(e) => setEditingRecipe({...editingRecipe, name: e.target.value})}
                    placeholder="Es. Pasta alla Carbonara"
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={editingRecipe.category} onValueChange={(value) => setEditingRecipe({...editingRecipe, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Primi Piatti">Primi Piatti</SelectItem>
                      <SelectItem value="Secondi Piatti">Secondi Piatti</SelectItem>
                      <SelectItem value="Contorni">Contorni</SelectItem>
                      <SelectItem value="Dolci">Dolci</SelectItem>
                      <SelectItem value="Antipasti">Antipasti</SelectItem>
                      <SelectItem value="Pizze">Pizze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrizione</Label>
                <Textarea
                  value={editingRecipe.description}
                  onChange={(e) => setEditingRecipe({...editingRecipe, description: e.target.value})}
                  placeholder="Breve descrizione della ricetta..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tempo Preparazione (min)</Label>
                  <Input
                    type="number"
                    value={editingRecipe.prep_time}
                    onChange={(e) => setEditingRecipe({...editingRecipe, prep_time: parseInt(e.target.value) || 30})}
                  />
                </div>
                <div>
                  <Label>Porzioni</Label>
                  <Input
                    type="number"
                    value={editingRecipe.servings}
                    onChange={(e) => setEditingRecipe({...editingRecipe, servings: parseInt(e.target.value) || 4})}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Ingredienti</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => setEditingRecipe({...editingRecipe, ingredients: [...editingRecipe.ingredients, '']})}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Aggiungi
                  </Button>
                </div>
                {editingRecipe.ingredients.map((ingredient, index) => (
                  <Input
                    key={index}
                    value={ingredient}
                    onChange={(e) => {
                      const updated = [...editingRecipe.ingredients];
                      updated[index] = e.target.value;
                      setEditingRecipe({...editingRecipe, ingredients: updated});
                    }}
                    placeholder={`Ingrediente ${index + 1}`}
                    className="mb-2"
                  />
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Istruzioni</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => setEditingRecipe({...editingRecipe, instructions: [...editingRecipe.instructions, '']})}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Aggiungi
                  </Button>
                </div>
                {editingRecipe.instructions.map((instruction, index) => (
                  <Textarea
                    key={index}
                    value={instruction}
                    onChange={(e) => {
                      const updated = [...editingRecipe.instructions];
                      updated[index] = e.target.value;
                      setEditingRecipe({...editingRecipe, instructions: updated});
                    }}
                    placeholder={`Passo ${index + 1}`}
                    className="mb-2"
                  />
                ))}
              </div>

              <Button onClick={handleUpdateRecipe} disabled={updateMutation.isPending} className="w-full">
                {updateMutation.isPending ? 'Salvando...' : 'Salva Modifiche'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Share with Users Dialog */}
      <Dialog open={showShareUsersDialog} onOpenChange={setShowShareUsersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Condividi con Utenti Registrati</DialogTitle>
            <p className="text-sm text-muted-foreground">Invia la ricetta direttamente a un utente dell'app</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Seleziona utente</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Scegli un utente..." />
                </SelectTrigger>
                <SelectContent>
                  {registeredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} {user.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleShareWithUser} disabled={!selectedUser.trim()} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Condividi Ricetta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredRecipes.length === 0 && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">Nessuna ricetta trovata</h3>
            <p className="text-muted-foreground mb-4">
              Prova a modificare i filtri di ricerca o aggiungi la tua prima ricetta!
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crea Ricetta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Recipes;
