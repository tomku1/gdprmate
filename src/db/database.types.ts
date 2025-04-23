export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      analyses: {
        Row: {
          completed_at: string | null;
          created_at: string;
          document_id: string;
          duration_ms: number | null;
          error_message: string | null;
          id: string;
          model_version: string;
          started_at: string;
          status: Database["public"]["Enums"]["analysis_status_enum"];
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          document_id: string;
          duration_ms?: number | null;
          error_message?: string | null;
          id?: string;
          model_version: string;
          started_at?: string;
          status: Database["public"]["Enums"]["analysis_status_enum"];
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          document_id?: string;
          duration_ms?: number | null;
          error_message?: string | null;
          id?: string;
          model_version?: string;
          started_at?: string;
          status?: Database["public"]["Enums"]["analysis_status_enum"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analyses_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      analysis_issues: {
        Row: {
          analysis_id: string;
          category: Database["public"]["Enums"]["issue_category_enum"];
          created_at: string;
          description: string;
          id: string;
          suggestion: string;
          user_id: string;
        };
        Insert: {
          analysis_id: string;
          category: Database["public"]["Enums"]["issue_category_enum"];
          created_at?: string;
          description: string;
          id?: string;
          suggestion: string;
          user_id: string;
        };
        Update: {
          analysis_id?: string;
          category?: Database["public"]["Enums"]["issue_category_enum"];
          created_at?: string;
          description?: string;
          id?: string;
          suggestion?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_issues_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "analyses";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          created_at: string;
          detected_language: string;
          id: string;
          mime_type: string;
          original_filename: string;
          s3_key: string;
          size_bytes: number;
          text_content: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          detected_language: string;
          id?: string;
          mime_type: string;
          original_filename: string;
          s3_key: string;
          size_bytes: number;
          text_content: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          detected_language?: string;
          id?: string;
          mime_type?: string;
          original_filename?: string;
          s3_key?: string;
          size_bytes?: number;
          text_content?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      suggestion_interactions: {
        Row: {
          created_at: string;
          id: string;
          interaction_type: Database["public"]["Enums"]["interaction_type_enum"];
          issue_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          interaction_type: Database["public"]["Enums"]["interaction_type_enum"];
          issue_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          interaction_type?: Database["public"]["Enums"]["interaction_type_enum"];
          issue_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "suggestion_interactions_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "analysis_issues";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      analysis_status_enum: "pending" | "in_progress" | "completed" | "failed";
      interaction_type_enum: "accepted" | "rejected";
      issue_category_enum: "critical" | "important" | "minor";
    };
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      analysis_status_enum: ["pending", "in_progress", "completed", "failed"],
      interaction_type_enum: ["accepted", "rejected"],
      issue_category_enum: ["critical", "important", "minor"],
    },
  },
} as const;
