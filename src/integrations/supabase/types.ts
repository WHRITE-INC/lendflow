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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      kyc_documents: {
        Row: {
          created_at: string
          doc_type: Database["public"]["Enums"]["kyc_doc_type"]
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["kyc_doc_status"]
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type: Database["public"]["Enums"]["kyc_doc_type"]
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_doc_status"]
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: Database["public"]["Enums"]["kyc_doc_type"]
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_doc_status"]
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loan_tiers: {
        Row: {
          activation_fee: number
          created_at: string
          description: string | null
          eligibility_rules: Json
          id: string
          interest_rate: number
          is_active: boolean
          max_active_loans: number
          max_amount: number
          max_outstanding_principal: number | null
          max_repayment_frequency_days: number
          max_term_months: number
          min_age: number
          min_amount: number
          min_repayment_frequency_days: number
          min_term_months: number
          name: string
          processing_fee: number
          required_activation_status: string
          required_kyc_status: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          activation_fee?: number
          created_at?: string
          description?: string | null
          eligibility_rules?: Json
          id?: string
          interest_rate: number
          is_active?: boolean
          max_active_loans?: number
          max_amount: number
          max_outstanding_principal?: number | null
          max_repayment_frequency_days?: number
          max_term_months: number
          min_age?: number
          min_amount: number
          min_repayment_frequency_days?: number
          min_term_months: number
          name: string
          processing_fee?: number
          required_activation_status?: string
          required_kyc_status?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          activation_fee?: number
          created_at?: string
          description?: string | null
          eligibility_rules?: Json
          id?: string
          interest_rate?: number
          is_active?: boolean
          max_active_loans?: number
          max_amount?: number
          max_outstanding_principal?: number | null
          max_repayment_frequency_days?: number
          max_term_months?: number
          min_age?: number
          min_amount?: number
          min_repayment_frequency_days?: number
          min_term_months?: number
          name?: string
          processing_fee?: number
          required_activation_status?: string
          required_kyc_status?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          created_at: string
          disbursed_at: string | null
          due_at: string | null
          id: string
          interest_rate: number
          outstanding_principal: number
          principal: number
          repayment_frequency_days: number
          status: string
          term_months: number
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disbursed_at?: string | null
          due_at?: string | null
          id?: string
          interest_rate: number
          outstanding_principal: number
          principal: number
          repayment_frequency_days: number
          status?: string
          term_months: number
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disbursed_at?: string | null
          due_at?: string | null
          id?: string
          interest_rate?: number
          outstanding_principal?: number
          principal?: number
          repayment_frequency_days?: number
          status?: string
          term_months?: number
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "loan_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_money_payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          external_id: string
          id: string
          phone: string
          provider: string
          provider_status: string | null
          raw_response: Json
          reason: string | null
          reference_id: string
          status: string
          tier_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_id: string
          id?: string
          phone: string
          provider?: string
          provider_status?: string | null
          raw_response?: Json
          reason?: string | null
          reference_id: string
          status?: string
          tier_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          external_id?: string
          id?: string
          phone?: string
          provider?: string
          provider_status?: string | null
          raw_response?: Json
          reason?: string | null
          reference_id?: string
          status?: string
          tier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobile_money_payments_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "loan_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activation_status: string
          address: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          gender: string | null
          id: string
          kyc_status: string
          last_name: string | null
          national_id: string | null
          phone: string | null
          province: string | null
          tier_id: string | null
          updated_at: string
        }
        Insert: {
          activation_status?: string
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          kyc_status?: string
          last_name?: string | null
          national_id?: string | null
          phone?: string | null
          province?: string | null
          tier_id?: string | null
          updated_at?: string
        }
        Update: {
          activation_status?: string
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          kyc_status?: string
          last_name?: string | null
          national_id?: string | null
          phone?: string | null
          province?: string | null
          tier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "loan_tiers"
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      evaluate_tier_eligibility: {
        Args: { _user_id: string }
        Returns: {
          active_loan_count: number
          eligible: boolean
          outstanding_principal: number
          reasons: string[]
          tier_id: string
          tier_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "borrower"
      kyc_doc_status: "pending" | "approved" | "rejected"
      kyc_doc_type: "id_front" | "id_back" | "selfie"
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
      app_role: ["admin", "borrower"],
      kyc_doc_status: ["pending", "approved", "rejected"],
      kyc_doc_type: ["id_front", "id_back", "selfie"],
    },
  },
} as const
