import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Source } from "@/types/mun";
import { toast } from "sonner";

export function useSources(projectId: string | undefined) {
  return useQuery({
    queryKey: ["sources", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Source[];
    },
    enabled: !!projectId,
  });
}

export function useSaveSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (source: { project_id: string; type: 'main_resolution' | 'co_resolution'; text: string }) => {
      // Upsert - delete existing and insert new
      await supabase
        .from("sources")
        .delete()
        .eq("project_id", source.project_id)
        .eq("type", source.type);
      
      if (!source.text.trim()) return null;
      
      const { data, error } = await supabase
        .from("sources")
        .insert(source)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sources", variables.project_id] });
      toast.success("Resolution saved");
    },
    onError: (error) => {
      toast.error("Failed to save resolution: " + error.message);
    },
  });
}
