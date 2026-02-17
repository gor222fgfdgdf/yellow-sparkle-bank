import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PaymentTemplate {
  id: string;
  user_id: string;
  name: string;
  category: string;
  provider: string;
  account_number: string;
  amount: number | null;
  icon: string;
  created_at: string;
}

export const usePaymentTemplates = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["payment_templates", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("payment_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PaymentTemplate[];
    },
    enabled: !!user,
  });
};

export const useCreatePaymentTemplate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: Omit<PaymentTemplate, "id" | "user_id" | "created_at">) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("payment_templates")
        .insert({ ...template, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_templates", user?.id] });
    },
  });
};

export const useDeletePaymentTemplate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payment_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_templates", user?.id] });
    },
  });
};
