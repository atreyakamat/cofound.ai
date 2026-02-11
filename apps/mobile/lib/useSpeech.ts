import { useCallback, useEffect, useState } from "react";
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";

interface UseSpeechReturn {
  listening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  toggleListening: () => Promise<void>;
  supported: boolean;
}

export function useSpeech(): UseSpeechReturn {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    Voice.isAvailable().then((available) => setSupported(!!available));

    Voice.onSpeechStart = () => setListening(true);
    Voice.onSpeechEnd = () => setListening(false);

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0] || "";
      setTranscript(text);
      setInterimTranscript("");
    };

    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0] || "";
      setInterimTranscript(text);
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.error("Speech error:", e.error);
      setListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = useCallback(async () => {
    setTranscript("");
    setInterimTranscript("");
    await Voice.start("en-US");
  }, []);

  const stopListening = useCallback(async () => {
    await Voice.stop();
  }, []);

  const toggleListening = useCallback(async () => {
    if (listening) {
      await stopListening();
    } else {
      await startListening();
    }
  }, [listening, startListening, stopListening]);

  return {
    listening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    supported,
  };
}
