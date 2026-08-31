import React, { useState, useRef, useEffect } from 'react';
import { useVoice } from './VoiceAssistant';

export const AIAnalystScreen: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isListening, transcript, startListening, speak } = useVoice();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null); // Clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const res = await fetch('/api/rizer-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64: selectedImage,
          prompt: transcript || "Please analyze this setup/posture."
        })
      });
      const data = await res.json();
      setResult(data);
      if (data.analysis) {
        speak(data.analysis);
      }
    } catch (err) {
      console.error(err);
      setResult({ analysis: "Sorry, I encountered an error while analyzing the image." });
    }
    setIsAnalyzing(false);
  };

  // Automatically trigger voice command behavior when transcript is updated
  useEffect(() => {
    if (transcript && !isListening && selectedImage && !isAnalyzing) {
      analyzeImage();
    }
  }, [transcript, isListening, selectedImage, isAnalyzing]);

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-light)] p-5 pb-28 pt-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-glow-cyan text-[var(--accent-cyan)]">Rizer Vision</h1>
        <p className="text-sm text-gray-400 mt-1">Upload a photo of your workspace or posture for an AI-powered ergonomic breakdown.</p>
      </header>

      <div className="space-y-6 max-w-md mx-auto">
        
        {/* Upload Section */}
        {!selectedImage && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] glass-panel-cyan rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[rgba(0,240,255,0.1)] transition-colors group"
          >
            <span className="material-symbols-outlined text-[48px] text-[var(--accent-cyan)] group-hover:scale-110 transition-transform mb-4">
              add_a_photo
            </span>
            <span className="font-semibold text-sm">Tap to Upload Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
          </div>
        )}

        {/* Image Preview & Scanner */}
        {selectedImage && (
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(0,240,255,0.2)] shadow-[0_0_20px_rgba(0,240,255,0.1)]">
            <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
            
            {isAnalyzing && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="w-full h-full animate-scanline"></div>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="flex gap-2">
                     <div className="wave-bar h-8"></div>
                     <div className="wave-bar h-8"></div>
                     <div className="wave-bar h-8"></div>
                     <div className="wave-bar h-8"></div>
                     <div className="wave-bar h-8"></div>
                  </div>
                </div>
              </div>
            )}
            
            {!isAnalyzing && (
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 bg-black/60 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {selectedImage && !isAnalyzing && !result && (
          <div className="grid grid-cols-2 gap-3">
             <button
               onClick={analyzeImage}
               className="h-12 bg-[var(--accent-cyan)] text-black font-bold rounded-xl active:scale-95 transition-all shadow-[0_0_15px_var(--accent-cyan-glow)] flex items-center justify-center gap-2"
             >
               <span className="material-symbols-outlined">analytics</span>
               Analyze
             </button>
             <button
               onClick={startListening}
               className={`h-12 border border-[var(--accent-cyan)] text-[var(--accent-cyan)] font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${isListening ? 'bg-[var(--accent-cyan-glow)] animate-voice-pulse' : 'hover:bg-[rgba(0,240,255,0.1)]'}`}
             >
               <span className="material-symbols-outlined">{isListening ? 'graphic_eq' : 'mic'}</span>
               {isListening ? 'Listening...' : 'Ask by Voice'}
             </button>
          </div>
        )}
        
        {transcript && !isAnalyzing && !result && (
           <div className="glass-panel p-3 rounded-xl border border-[rgba(255,255,255,0.1)] text-sm italic">
             "{transcript}"
           </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="glass-panel-cyan p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-[var(--accent-cyan)] uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined">neurology</span>
                Analysis Complete
              </h3>
              <p className="text-sm leading-relaxed mb-4">{result.analysis}</p>
              
              {result.identified_issues && result.identified_issues.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Identified Elements</h4>
                  <ul className="space-y-2">
                    {result.identified_issues.map((issue: string, idx: number) => (
                      <li key={idx} className="text-xs flex items-start gap-2 bg-black/30 p-2 rounded-lg border border-[rgba(255,255,255,0.05)]">
                         <span className="material-symbols-outlined text-[16px] text-orange-400">warning</span>
                         <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggested_actions && result.suggested_actions.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recommended Actions</h4>
                  <ul className="space-y-2">
                    {result.suggested_actions.map((action: string, idx: number) => (
                      <li key={idx} className="text-xs flex items-start gap-2 bg-black/30 p-2 rounded-lg border border-[rgba(255,255,255,0.05)]">
                         <span className="material-symbols-outlined text-[16px] text-[var(--accent-cyan)]">check_circle</span>
                         <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
               onClick={() => { setSelectedImage(null); setResult(null); }}
               className="w-full h-12 glass-panel text-[var(--text-light)] font-bold rounded-xl active:scale-95 transition-all hover:bg-[rgba(255,255,255,0.05)]"
             >
               Scan Another
             </button>
          </div>
        )}

      </div>
    </div>
  );
};
