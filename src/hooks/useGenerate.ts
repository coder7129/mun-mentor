import { useState } from "react";
import { GenerationMode, GenerationRequest } from "@/types/mun";
import { useSaveOutput } from "./useOutputs";
import { useSaveCountryProfile } from "./useCountryProfiles";
import { toast } from "sonner";

export function useGenerate() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const saveOutput = useSaveOutput();
  const saveProfile = useSaveCountryProfile();

  const generate = async (
    request: GenerationRequest,
    country?: string,
    onSuccess?: (result: string) => void
  ) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        }
        if (response.status === 402) {
          throw new Error("AI credits exhausted. Please add credits to continue.");
        }
        throw new Error(errorData.error || "Generation failed");
      }

      const data = await response.json();
      const resultText = data.result;
      setResult(resultText);

      // Save the output
      if (request.mode === "country_profile" && country) {
        // Parse and save as country profile
        try {
          const profileData = JSON.parse(resultText);
          await saveProfile.mutateAsync({
            project_id: request.project_id,
            country,
            profile_json: profileData,
          });
        } catch {
          // If parsing fails, save as regular output
          await saveOutput.mutateAsync({
            project_id: request.project_id,
            type: request.mode,
            input_json: { country, ...request },
            result_text: resultText,
          });
        }
      } else {
        await saveOutput.mutateAsync({
          project_id: request.project_id,
          type: request.mode,
          input_json: request as unknown as Record<string, unknown>,
          result_text: resultText,
        });
      }

      toast.success("Generated successfully");
      onSuccess?.(resultText);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading, result, setResult };
}
