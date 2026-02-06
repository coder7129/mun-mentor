import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Output } from "@/types/mun";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export function useOutputs(projectId: string | undefined) {
  return useQuery({
    queryKey: ["outputs", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("outputs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Output[];
    },
    enabled: !!projectId,
  });
}

export function useOutputsByType(projectId: string | undefined, type: string) {
  return useQuery({
    queryKey: ["outputs", projectId, type],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("outputs")
        .select("*")
        .eq("project_id", projectId)
        .eq("type", type)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Output[];
    },
    enabled: !!projectId,
  });
}

export function useSaveOutput() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (output: { project_id: string; type: string; input_json: Record<string, unknown> | null; result_text: string }) => {
      const { data, error } = await supabase
        .from("outputs")
        .insert({
          project_id: output.project_id,
          type: output.type,
          input_json: output.input_json as Json,
          result_text: output.result_text,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Output;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["outputs", data.project_id] });
      queryClient.invalidateQueries({ queryKey: ["outputs", data.project_id, data.type] });
    },
    onError: (error) => {
      toast.error("Failed to save output: " + error.message);
    },
  });
}
