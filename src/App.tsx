import React, { useState, useRef } from 'react';
  import { Search, Upload, Loader2, CheckCircle2, AlertCircle, Globe } from 'lucide-react';

  // La clave de API se inyecta automáticamente en este entorno
  const apiKey = ""; 

  const translations = {
    es: {
      title: "ImageFinder",
      subtitle: "Encuentra fotos en tu galería usando lenguaje natural",
      uploadBtn: "Seleccionar Fotos",
      clearBtn: "Limpiar todo",
      uploadPrompt: "Sube algunas fotos para empezar la prueba.",
      loadedPrompt: "fotos cargadas listas para escanear.",
      searchPlaceholder: "Ej. Un perro jugando, Una playa al atardecer...",
      analyzing: "Analizando imágenes con IA...",
      found: "Resultados Encontrados",
      errorLimit: "Para esta demo, se ha limitado a las primeras 15 imágenes.",
      errorNoMatch: "No se encontraron imágenes que coincidan con tu descripción."
    },
    en: {
      title: "ImageFinder",
      subtitle: "Find photos in your gallery using natural language",
      uploadBtn: "Select Photos",
      clearBtn: "Clear All",
      uploadPrompt: "Upload some photos to start testing.",
      loadedPrompt: "photos loaded and ready to scan.",
      searchPlaceholder: "E.g. A dog playing, A beach at sunset...",
      analyzing: "Analyzing images with AI...",
      found: "Results Found",
      errorLimit: "For this demo, we limited it to the first 15 selected images.",
      errorNoMatch: "No images matching your description were found."
    },
    ca: {
      title: "ImageFinder",
      subtitle: "Troba fotos a la teva galeria utilitzant llenguatge natural",
      uploadBtn: "Seleccionar Fotos",
      clearBtn: "Netejar tot",
      uploadPrompt: "Puja algunes fotos per començar la prova.",
      loadedPrompt: "fotos carregades i llestes per escanejar.",
      searchPlaceholder: "Ex. Un gos jugant, Una platja al capvespre...",
      analyzing: "Analitzant imatges amb IA...",
      found: "Resultats Trobats",
      errorLimit: "Per a aquesta demo, s'ha limitat a les primeres 15 imatges.",
      errorNoMatch: "No s'han trobat imatges que coincideixin amb la teva descripció."
    },
    fr: {
      title: "ImageFinder",
      subtitle: "Trouvez des photos dans votre galerie en utilisant le langage naturel",
      uploadBtn: "Sélectionner des photos",
      clearBtn: "Tout effacer",
      uploadPrompt: "Téléchargez des photos pour commencer le test.",
      loadedPrompt: "photos chargées prêtes à être analysées.",
      searchPlaceholder: "Ex. Un chien qui joue, Une plage au coucher du soleil...",
      analyzing: "Analyse des images avec l'IA...",
      found: "Résultats Trouvés",
      errorLimit: "Pour cette démo, la limite est de 15 images sélectionnées.",
      errorNoMatch: "Aucune image ne correspond à votre description."
    },
    de: {
      title: "ImageFinder",
      subtitle: "Finden Sie Fotos in Ihrer Galerie mit natürlicher Sprache",
      uploadBtn: "Fotos auswählen",
      clearBtn: "Alles löschen",
      uploadPrompt: "Laden Sie Fotos hoch, um den Test zu starten.",
      loadedPrompt: "Fotos geladen und bereit zum Scannen.",
      searchPlaceholder: "Z.B. Ein spielender Hund, Ein Strand bei Sonnenuntergang...",
      analyzing: "Bilder werden mit KI analysiert...",
      found: "Gefundene Ergebnisse",
      errorLimit: "Für diese Demo ist das Limit auf die ersten 15 Bilder beschränkt.",
      errorNoMatch: "Es wurden keine Bilder gefunden, die Ihrer Beschreibung entsprechen."
    },
    it: {
      title: "ImageFinder",
      subtitle: "Trova le foto nella tua galleria usando il linguaggio naturale",
      uploadBtn: "Seleziona foto",
      clearBtn: "Cancella tutto",
      uploadPrompt: "Carica alcune foto per iniziare il test.",
      loadedPrompt: "foto caricate pronte per la scansione.",
      searchPlaceholder: "Es. Un cane che gioca, Una spiaggia al tramonto...",
      analyzing: "Analisi delle immagini con l'IA...",
      found: "Risultati Trovati",
      errorLimit: "Per questa demo, il limite è impostato sulle prime 15 immagini.",
      errorNoMatch: "Nessuna immagine corrisponde alla tua descrizione."
    },
    pt: {
      title: "ImageFinder",
      subtitle: "Encontre fotos na sua galeria usando linguagem natural",
      uploadBtn: "Selecionar fotos",
      clearBtn: "Limpar tudo",
      uploadPrompt: "Carregue algumas fotos para iniciar o teste.",
      loadedPrompt: "fotos carregadas prontas para escanear.",
      searchPlaceholder: "Ex. Um cachorro brincando, Uma praia ao pôr do sol...",
      analyzing: "Analisando imagens com IA...",
      found: "Resultados Encontrados",
      errorLimit: "Para esta demonstração, o limite foi definido para as primeiras 15 imagens.",
      errorNoMatch: "Nenhuma imagem correspondente à sua descrição foi encontrada."
    }
  };

  const fetchWithRetry = async (url, options, retries = 3) => {
    const delays = [1000, 2000, 4000];
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(res => setTimeout(res, delays[i]));
      }
    }
  };

  export default function App() {
    const [lang, setLang] = useState('es');
    const t = translations[lang];

    const [images, setImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    
    const fileInputRef = useRef(null);

    const processFiles = async (files) => {
      const newImages = [];
      const filesToProcess = Array.from(files).slice(0, 15); 
      
      if (files.length > 15) setError(t.errorLimit);
      else setError('');

      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => reader.onload = (e) => resolve(e.target.result));
        reader.readAsDataURL(file);
        const dataUrl = await base64Promise;
        const base64Data = dataUrl.split(',')[1];
        
        newImages.push({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: file.type,
          dataUrl,
          base64Data
        });
      }
      setImages(prev => [...prev, ...newImages]);
    };

    const handleFileChange = (e) => {
      if (e.target.files?.length > 0) processFiles(e.target.files);
    };

    const analyzeImageWithAI = async (image, query) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const prompt = `Act as an image analyzer. Does this image clearly match or contain the following description: "${query}"? 
      Reply strictly with a JSON object in this format: {"match": true} or {"match": false}. Do not add any other text.`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: image.type, data: image.base64Data } }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { match: { type: "BOOLEAN" } } } }
      };

      try {
        const result = await fetchWithRetry(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) {
          return JSON.parse(textResponse).match === true;
        }
        return false;
      } catch (err) {
        return false; 
      }
    };

    const handleSearch = async () => {
      if (!searchQuery.trim() || images.length === 0) return;
      
      setIsSearching(true);
      setResults([]);
      setError('');
      setProgress({ current: 0, total: images.length });
      
      const foundImages = [];
      let currentIndex = 0;

      for (const img of images) {
        currentIndex++;
        setProgress({ current: currentIndex, total: images.length });
        
        if (await analyzeImageWithAI(img, searchQuery)) {
          foundImages.push(img);
          setResults([...foundImages]); 
        }
        await new Promise(r => setTimeout(r, 500));
      }
      
      setIsSearching(false);
      if (foundImages.length === 0) setError(t.errorNoMatch);
    };

    const clearAll = () => {
      setImages([]);
      setResults([]);
      setSearchQuery('');
      setError('');
      setProgress({ current: 0, total: 0 });
    };

    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8 relative">
          
          {/* Language Selector */}
          <div className="absolute top-0 right-0 flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100 z-10">
            <Globe className="w-4 h-4 text-gray-500" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="es">Español (ES)</option>
              <option value="en">English (EN)</option>
              <option value="ca">Català (CA)</option>
              <option value="fr">Français (FR)</option>
              <option value="de">Deutsch (DE)</option>
              <option value="it">Italiano (IT)</option>
              <option value="pt">Português (PT)</option>
            </select>
          </div>

          {/* Header */}
          <div className="text-center space-y-2 pt-8">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-2">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
              >
                <Upload className="w-5 h-5" />
                {t.uploadBtn}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
              <div className="text-sm text-gray-500 text-center sm:text-left">
                {images.length === 0 ? t.uploadPrompt : `${images.length} ${t.loadedPrompt}`}
              </div>
              {images.length > 0 && (
                <button onClick={clearAll} className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium">
                  {t.clearBtn}
                </button>
              )}
            </div>

            {images.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {images.map(img => (
                  <img key={img.id} src={img.dataUrl} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                ))}
              </div>
            )}
          </div>

          {/* Search Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                disabled={isSearching || images.length === 0}
                className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || images.length === 0 || !searchQuery.trim()}
                className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>

            {isSearching && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>{t.analyzing}</span>
                  <span>{progress.current} / {progress.total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                </div>
              </div>
            )}
            
            {error && !isSearching && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                {t.found} ({results.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.map(img => (
                  <div key={img.id} className="relative group rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100 p-2">
                    <div className="aspect-square rounded-xl overflow-hidden">
                      <img src={img.dataUrl} alt="Resultado" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }