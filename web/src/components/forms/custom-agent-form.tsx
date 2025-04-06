import { useState } from "react";
import { z } from "zod";

const CustomAgentForm = ({ existingAgent, onSuccess }: CustomAgentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const agentData = {
        name: values.name,
        description: values.description,
        strategy: values.strategy,
        risk_tolerance: values.riskTolerance,
        time_horizon: values.timeHorizon,
        objectives: values.objectives,
      };
      
      let response;
      
      if (existingAgent) {
        // Update existing agent
        response = await fetch(`/api/agents/${existingAgent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agentData),
        });
      } else {
        // Create new agent
        response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agentData),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to save agent');
      }
      
      onSuccess();
    } catch (err) {
      console.error('Error saving agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to save agent');
    } finally {
      setIsLoading(false);
    }
  };
} 