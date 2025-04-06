import { useState, useEffect } from "react";
import { z } from "zod";

// Interface for saved simulation
interface SavedSimulation {
  id: string;
  name: string;
  description: string;
  ticker: string;
  date_created: string;
  config: SimulationConfig;
}

export function SaveSimulationDialog({
  open,
  onOpenChange,
  config
}: SaveSimulationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const simulationData = {
        name: values.name,
        description: values.description,
        config: config,
      };
      
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simulationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to save simulation');
      }
      
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving simulation:', err);
      setError(err instanceof Error ? err.message : 'Failed to save simulation');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ... existing code ...
}

export function LoadSimulationDialog({
  open,
  onOpenChange,
  onLoad
}: LoadSimulationDialogProps) {
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadSimulations();
    }
  }, [open]);

  const loadSimulations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/simulations');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to load simulations');
      }
      
      const data = await response.json();
      setSimulations(data);
    } catch (err) {
      console.error('Error loading simulations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load simulations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/simulations/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to load simulation');
      }
      
      const data = await response.json();
      onLoad(data.config);
      onOpenChange(false);
    } catch (err) {
      console.error(`Error loading simulation ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load simulation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/simulations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to delete simulation');
      }
      
      // Refresh the list
      loadSimulations();
    } catch (err) {
      console.error(`Error deleting simulation ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to delete simulation');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ... existing code ...
}

// ... existing code ... 