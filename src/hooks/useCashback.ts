import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CashbackCategory {
  id: string;
  user_id: string;
  category: string;
  percentage: number;
  is_selected: boolean;
  earned_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CashbackBalance {
  id: string;
  user_id: string;
  balance: number;
  pending_balance: number;
  created_at: string;
  updated_at: string;
}

export const useCashbackCategories = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["cashback_categories", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("cashback_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("percentage", { ascending: false });

      if (error) throw error;
      return data as CashbackCategory[];
    },
    enabled: !!user,
  });
};

export const useCashbackBalance = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["cashback_balance", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("cashback_balance")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CashbackBalance | null;
    },
    enabled: !!user,
  });
};

export const useUpdateCashbackCategory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CashbackCategory> & { id: string }) => {
      const { error } = await supabase
        .from("cashback_categories")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashback_categories", user?.id] });
    },
  });
};

export const useUpdateCashbackBalance = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<CashbackBalance>) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("cashback_balance")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashback_balance", user?.id] });
    },
  });
};
