import React, { useState, useEffect, useCallback } from 'react';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const startListening = useCallback(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
       console.warn("Speech recognition not supported in this browser.");
       return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };
    
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      setTranscript(result);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.start();
  }, []);
  
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // clear previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);
  
  return {
    isListening,
    transcript,
    startListening,
    speak
  };
};

export const VoiceAssistantFAB: React.FC<{ onCommand?: (text: string) => void }> = ({ onCommand }) => {
  const { isListening, transcript, startListening, speak } = useVoice();
  
  useEffect(() => {
    if (transcript && !isListening) {
      if (onCommand) {
        onCommand(transcript);
      } else {
        // Default behavior if not handled: just echo back something high-tech
        speak("I heard: " + transcript + ". I am processing your request in the cloud.");
      }
    }
  }, [transcript, isListening, onCommand, speak]);
  
  return (
     <button 
        onClick={startListening}
        className={`fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center z-40 transition-all ${isListening ? 'bg-[var(--accent-cyan)] text-black animate-voice-pulse' : 'glass-panel-cyan text-[var(--accent-cyan)] hover:scale-110'}`}
     >
        <span className="material-symbols-outlined text-[28px]">
           {isListening ? 'graphic_eq' : 'mic'}
        </span>
     </button>
  );
};
