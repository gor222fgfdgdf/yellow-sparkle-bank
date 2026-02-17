import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AutoPayment {
  id: string;
  user_id: string;
  name: string;
  category: string;
  provider: string;
  account_number: string;
  amount: number;
  frequency: string;
  day_of_month: number | null;
  day_of_week: number | null;
  is_active: boolean | null;
  next_payment_date: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export const useAutoPayments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["auto_payments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("auto_payments")
        .select("*")
        .eq("user_id", user.id)
        .order("next_payment_date", { ascending: true });
      if (error) throw error;
      return data as AutoPayment[];
    },
    enabled: !!user,
  });
};

export const useCreateAutoPayment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payment: Omit<AutoPayment, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("auto_payments")
        .insert({ ...payment, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto_payments", user?.id] });
    },
  });
};

export const useUpdateAutoPayment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutoPayment> & { id: string }) => {
      const { error } = await supabase
        .from("auto_payments")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto_payments", user?.id] });
    },
  });
};

export const useDeleteAutoPayment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("auto_payments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto_payments", user?.id] });
    },
  });
};
