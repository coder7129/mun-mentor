import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CountryProfile } from "@/types/mun";
import { toast } from "sonner";

export function useCountryProfile(projectId: string | undefined) {
  return useQuery({
    queryKey: ["country_profile", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data, error } = await supabase
        .from("country_profiles")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as CountryProfile | null;
    },
    enabled: !!projectId,
  });
}

export function useSaveCountryProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Omit<CountryProfile, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("country_profiles")
        .insert({
          project_id: profile.project_id,
          country: profile.country,
          profile_json: profile.profile_json,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["country_profile", data.project_id] });
      toast.success("Country profile saved");
    },
    onError: (error) => {
      toast.error("Failed to save profile: " + error.message);
    },
  });
}
