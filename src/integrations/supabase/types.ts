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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          created_at: string
          doc_type: Database["public"]["Enums"]["kyc_doc_type"]
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["doc_status"]
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type: Database["public"]["Enums"]["kyc_doc_type"]
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: Database["public"]["Enums"]["kyc_doc_type"]
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_notes: string | null
          id: string
          product_id: string
          purpose: string | null
          requested_amount: number
          status: Database["public"]["Enums"]["application_status"]
          term_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          id?: string
          product_id: string
          purpose?: string | null
          requested_amount: number
          status?: Database["public"]["Enums"]["application_status"]
          term_days: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_notes?: string | null
          id?: string
          product_id?: string
          purpose?: string | null
          requested_amount?: number
          status?: Database["public"]["Enums"]["application_status"]
          term_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_applications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "loan_products"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_products: {
        Row: {
          active: boolean
          country: Database["public"]["Enums"]["country_code"]
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          description: string | null
          eligibility: Json
          id: string
          interest_rate_pct: number
          max_amount: number
          min_amount: number
          name: string
          term_days: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          country: Database["public"]["Enums"]["country_code"]
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          eligibility?: Json
          id?: string
          interest_rate_pct: number
          max_amount: number
          min_amount: number
          name: string
          term_days: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          country?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          eligibility?: Json
          id?: string
          interest_rate_pct?: number
          max_amount?: number
          min_amount?: number
          name?: string
          term_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          application_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          disbursed_at: string | null
          due_date: string
          id: string
          interest: number
          outstanding: number
          principal: number
          product_id: string
          status: Database["public"]["Enums"]["loan_status"]
          total_payable: number
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          disbursed_at?: string | null
          due_date: string
          id?: string
          interest: number
          outstanding: number
          principal: number
          product_id: string
          status?: Database["public"]["Enums"]["loan_status"]
          total_payable: number
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          disbursed_at?: string | null
          due_date?: string
          id?: string
          interest?: number
          outstanding?: number
          principal?: number
          product_id?: string
          status?: Database["public"]["Enums"]["loan_status"]
          total_payable?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "loan_products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          id: string
          payload: Json | null
          read_at: string | null
          sent_at: string | null
          template: string
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          sent_at?: string | null
          template: string
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          payload?: Json | null
          read_at?: string | null
          sent_at?: string | null
          template?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          country: Database["public"]["Enums"]["country_code"] | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          employment: string | null
          full_name: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          national_id: string | null
          phone_e164: string | null
          risk_score: number
          suspended_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          country?: Database["public"]["Enums"]["country_code"] | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          employment?: string | null
          full_name?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          national_id?: string | null
          phone_e164?: string | null
          risk_score?: number
          suspended_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          country?: Database["public"]["Enums"]["country_code"] | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          employment?: string | null
          full_name?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          national_id?: string | null
          phone_e164?: string | null
          risk_score?: number
          suspended_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      repayment_schedules: {
        Row: {
          amount_due: number
          amount_paid: number
          created_at: string
          due_date: string
          id: string
          installment_no: number
          loan_id: string
          status: Database["public"]["Enums"]["schedule_status"]
          updated_at: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number
          created_at?: string
          due_date: string
          id?: string
          installment_no: number
          loan_id: string
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_no?: number
          loan_id?: string
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repayment_schedules_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          direction: Database["public"]["Enums"]["tx_direction"]
          failure_reason: string | null
          id: string
          loan_id: string | null
          msisdn: string | null
          provider: Database["public"]["Enums"]["tx_provider"]
          provider_ref: string | null
          raw_payload: Json | null
          status: Database["public"]["Enums"]["tx_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          direction: Database["public"]["Enums"]["tx_direction"]
          failure_reason?: string | null
          id?: string
          loan_id?: string | null
          msisdn?: string | null
          provider: Database["public"]["Enums"]["tx_provider"]
          provider_ref?: string | null
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["tx_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          direction?: Database["public"]["Enums"]["tx_direction"]
          failure_reason?: string | null
          id?: string
          loan_id?: string | null
          msisdn?: string | null
          provider?: Database["public"]["Enums"]["tx_provider"]
          provider_ref?: string | null
          raw_payload?: Json | null
          status?: Database["public"]["Enums"]["tx_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "borrower" | "reviewer" | "admin"
      application_status:
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "withdrawn"
      country_code: "KE" | "UG" | "TZ" | "RW" | "GH" | "NG"
      currency_code: "KES" | "UGX" | "TZS" | "RWF" | "GHS" | "NGN"
      doc_status: "pending" | "approved" | "rejected"
      kyc_doc_type: "national_id" | "passport" | "utility_bill" | "selfie"
      kyc_status: "pending" | "in_review" | "approved" | "rejected"
      loan_status:
        | "pending_disbursement"
        | "active"
        | "completed"
        | "defaulted"
        | "written_off"
      notification_channel: "email" | "sms" | "inapp"
      schedule_status: "upcoming" | "paid" | "partial" | "overdue"
      tx_direction: "disbursement" | "repayment" | "refund" | "reversal"
      tx_provider: "mtn" | "airtel" | "mpesa" | "manual"
      tx_status: "pending" | "success" | "failed" | "reversed"
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
      app_role: ["borrower", "reviewer", "admin"],
      application_status: [
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "withdrawn",
      ],
      country_code: ["KE", "UG", "TZ", "RW", "GH", "NG"],
      currency_code: ["KES", "UGX", "TZS", "RWF", "GHS", "NGN"],
      doc_status: ["pending", "approved", "rejected"],
      kyc_doc_type: ["national_id", "passport", "utility_bill", "selfie"],
      kyc_status: ["pending", "in_review", "approved", "rejected"],
      loan_status: [
        "pending_disbursement",
        "active",
        "completed",
        "defaulted",
        "written_off",
      ],
      notification_channel: ["email", "sms", "inapp"],
      schedule_status: ["upcoming", "paid", "partial", "overdue"],
      tx_direction: ["disbursement", "repayment", "refund", "reversal"],
      tx_provider: ["mtn", "airtel", "mpesa", "manual"],
      tx_status: ["pending", "success", "failed", "reversed"],
    },
  },
} as const
