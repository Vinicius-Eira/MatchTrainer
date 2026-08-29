import { useState, useEffect } from 'react';
import { Preset } from '../domain/entities/Preset';
import { presetRepository } from '../data/repositories/PresetRepository';

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPresets = async () => {
      try {
        setIsLoading(true);
        const data = await presetRepository.getPresets();
        if (isMounted) setPresets(data);
      } catch (err) {
        if (isMounted) setError('Erro ao carregar seus presets.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPresets();
    return () => { isMounted = false; };
  }, []);

  return { presets, isLoading, error };
}