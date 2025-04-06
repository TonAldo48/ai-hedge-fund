import { SimulationConfig, runSimulation } from "@/lib/api";

const SimulationForm = ({ onSimulationComplete }: SimulationFormProps) => {
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare the simulation config
      const config: SimulationConfig = {
        ticker: values.ticker,
        startDate: values.dateRange.from.toISOString().split('T')[0],
        endDate: values.dateRange.to.toISOString().split('T')[0],
        initialCash: values.initialInvestment,
        marginRequirement: values.marginRequirement,
        model: values.model,
        showReasoning: values.showReasoning,
        analyst: values.analyst,
      };

      // Run the simulation
      const results = await runSimulation(config);
      onSimulationComplete(results);
    } catch (err) {
      console.error('Simulation error:', err);
      setError('Failed to run simulation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
} 