export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_number: string | null
          balance: number
          card_number: string | null
          color: string
          created_at: string
          credit_limit: number | null
          id: string
          min_payment: number | null
          name: string
          opened_at: string
          payment_due_date: string | null
          rate: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          balance?: number
          card_number?: string | null
          color?: string
          created_at?: string
          credit_limit?: number | null
          id?: string
          min_payment?: number | null
          name: string
          opened_at?: string
          payment_due_date?: string | null
          rate?: number | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          balance?: number
          card_number?: string | null
          color?: string
          created_at?: string
          credit_limit?: number | null
          id?: string
          min_payment?: number | null
          name?: string
          opened_at?: string
          payment_due_date?: string | null
          rate?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      auto_payments: {
        Row: {
          account_number: string
          amount: number
          category: string
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          next_payment_date: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          amount: number
          category: string
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name: string
          next_payment_date: string
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          category?: string
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          next_payment_date?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          category: string
          color: string
          created_at: string
          id: string
          limit_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          color?: string
          created_at?: string
          id?: string
          limit_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          id?: string
          limit_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cashback_balance: {
        Row: {
          balance: number | null
          created_at: string
          id: string
          pending_balance: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          id?: string
          pending_balance?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          id?: string
          pending_balance?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cashback_categories: {
        Row: {
          category: string
          created_at: string
          earned_amount: number | null
          id: string
          is_selected: boolean | null
          percentage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          earned_amount?: number | null
          id?: string
          is_selected?: boolean | null
          percentage: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          earned_amount?: number | null
          id?: string
          is_selected?: boolean | null
          percentage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_limit: number | null
          id: string
          is_active: boolean | null
          monthly_limit: number | null
          name: string
          phone: string | null
          relationship: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_limit?: number | null
          id?: string
          is_active?: boolean | null
          monthly_limit?: number | null
          name: string
          phone?: string | null
          relationship: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_limit?: number | null
          id?: string
          is_active?: boolean | null
          monthly_limit?: number | null
          name?: string
          phone?: string | null
          relationship?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_templates: {
        Row: {
          account_number: string
          amount: number | null
          category: string
          created_at: string
          icon: string
          id: string
          name: string
          provider: string
          user_id: string
        }
        Insert: {
          account_number: string
          amount?: number | null
          category: string
          created_at?: string
          icon?: string
          id?: string
          name: string
          provider: string
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number | null
          category?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          color: string
          created_at: string
          current_amount: number
          deadline: string | null
          icon: string
          id: string
          name: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          current_amount?: number
          deadline?: string | null
          icon?: string
          id?: string
          name: string
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          current_amount?: number
          deadline?: string | null
          icon?: string
          id?: string
          name?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spending_limits: {
        Row: {
          category: string
          created_at: string
          id: string
          is_enabled: boolean | null
          limit_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          limit_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          limit_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string
          category: string
          color: string
          created_at: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          next_payment_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string
          category: string
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name: string
          next_payment_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          category?: string
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          next_payment_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string
          created_at: string
          date: string
          icon: string
          id: string
          is_income: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category: string
          created_at?: string
          date?: string
          icon?: string
          id?: string
          is_income?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string
          created_at?: string
          date?: string
          icon?: string
          id?: string
          is_income?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          biometric_enabled: boolean | null
          created_at: string
          id: string
          notifications_enabled: boolean | null
          pin_hash: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          biometric_enabled?: boolean | null
          created_at?: string
          id?: string
          notifications_enabled?: boolean | null
          pin_hash?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          biometric_enabled?: boolean | null
          created_at?: string
          id?: string
          notifications_enabled?: boolean | null
          pin_hash?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
