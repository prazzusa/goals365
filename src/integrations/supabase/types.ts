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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      daily_goals: {
        Row: {
          category: string
          completed: boolean
          created_at: string
          date: string
          id: string
          notes: string | null
          progress: number
          title: string
          updated_at: string
          user_id: string
          weekly_goal_id: string | null
        }
        Insert: {
          category: string
          completed?: boolean
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          progress?: number
          title: string
          updated_at?: string
          user_id: string
          weekly_goal_id?: string | null
        }
        Update: {
          category?: string
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          progress?: number
          title?: string
          updated_at?: string
          user_id?: string
          weekly_goal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_goals_weekly_goal_id_fkey"
            columns: ["weekly_goal_id"]
            isOneToOne: false
            referencedRelation: "weekly_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_insights: {
        Row: {
          category: string | null
          created_at: string
          date: string
          energy_level: number | null
          id: string
          message: string | null
          mood: string | null
          suggestion: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          date: string
          energy_level?: number | null
          id?: string
          message?: string | null
          mood?: string | null
          suggestion?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          message?: string | null
          mood?: string | null
          suggestion?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          calories_burned: number | null
          created_at: string
          date: string
          duration: number | null
          exercise_name: string
          exercise_type: string
          id: string
          reps: number | null
          sets: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          date: string
          duration?: number | null
          exercise_name: string
          exercise_type: string
          id?: string
          reps?: number | null
          sets?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          date?: string
          duration?: number | null
          exercise_name?: string
          exercise_type?: string
          id?: string
          reps?: number | null
          sets?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          calories: number | null
          created_at: string
          date: string
          food_name: string
          id: string
          meal_category: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          created_at?: string
          date: string
          food_name: string
          id?: string
          meal_category: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          created_at?: string
          date?: string
          food_name?: string
          id?: string
          meal_category?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      momentum_scores: {
        Row: {
          balance_score: number | null
          consistency_score: number | null
          created_at: string
          effort_score: number | null
          id: string
          level: string | null
          longest_streak: number | null
          recovery_score: number | null
          score: number | null
          streak_days: number | null
          total_goals_completed: number | null
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          balance_score?: number | null
          consistency_score?: number | null
          created_at?: string
          effort_score?: number | null
          id?: string
          level?: string | null
          longest_streak?: number | null
          recovery_score?: number | null
          score?: number | null
          streak_days?: number | null
          total_goals_completed?: number | null
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          balance_score?: number | null
          consistency_score?: number | null
          created_at?: string
          effort_score?: number | null
          id?: string
          level?: string | null
          longest_streak?: number | null
          recovery_score?: number | null
          score?: number | null
          streak_days?: number | null
          total_goals_completed?: number | null
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      monthly_goals: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          month: number
          title: string
          updated_at: string
          user_id: string
          year: number
          yearly_goal_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          month: number
          title: string
          updated_at?: string
          user_id: string
          year: number
          yearly_goal_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          month?: number
          title?: string
          updated_at?: string
          user_id?: string
          year?: number
          yearly_goal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_goals_yearly_goal_id_fkey"
            columns: ["yearly_goal_id"]
            isOneToOne: false
            referencedRelation: "yearly_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number
          fitness_goals: Json | null
          id: string
          personal_goals: Json | null
          professional_goals: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          fitness_goals?: Json | null
          id?: string
          personal_goals?: Json | null
          professional_goals?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          fitness_goals?: Json | null
          id?: string
          personal_goals?: Json | null
          professional_goals?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          archetype: string | null
          created_at: string
          daily_time: number | null
          experience_level: string | null
          gender: string | null
          id: string
          is_premium: boolean | null
          motivation_style: string | null
          roadmap_generated_at: string | null
          selected_categories: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archetype?: string | null
          created_at?: string
          daily_time?: number | null
          experience_level?: string | null
          gender?: string | null
          id?: string
          is_premium?: boolean | null
          motivation_style?: string | null
          roadmap_generated_at?: string | null
          selected_categories?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archetype?: string | null
          created_at?: string
          daily_time?: number | null
          experience_level?: string | null
          gender?: string | null
          id?: string
          is_premium?: boolean | null
          motivation_style?: string | null
          roadmap_generated_at?: string | null
          selected_categories?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_goals: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          monthly_goal_id: string | null
          title: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          monthly_goal_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          monthly_goal_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_goals_monthly_goal_id_fkey"
            columns: ["monthly_goal_id"]
            isOneToOne: false
            referencedRelation: "monthly_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      yearly_goals: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          position: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          title?: string
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
