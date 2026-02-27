import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  name: string;
  category: string;
  amount: number;
  is_income: boolean;
  icon: string;
  date: string;
  created_at: string;
}

export const useTransactions = (accountId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transactions", user?.id, accountId],
    queryFn: async () => {
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];

      let queryBuilder = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .lte("date", today)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (accountId) {
        queryBuilder = queryBuilder.eq("account_id", accountId);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["transactions", user.id] });
          queryClient.invalidateQueries({ queryKey: ["accounts", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id" | "user_id" | "created_at">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
    },
  });
};
