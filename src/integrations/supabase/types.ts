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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      answer_likes: {
        Row: {
          answer_id: string
          user_id: string
        }
        Insert: {
          answer_id: string
          user_id: string
        }
        Update: {
          answer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_likes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          author_id: string
          corpo: string
          created_at: string
          id: string
          likes_count: number
          melhor: boolean
          oculto: boolean
          question_id: string
        }
        Insert: {
          author_id: string
          corpo: string
          created_at?: string
          id?: string
          likes_count?: number
          melhor?: boolean
          oculto?: boolean
          question_id: string
        }
        Update: {
          author_id?: string
          corpo?: string
          created_at?: string
          id?: string
          likes_count?: number
          melhor?: boolean
          oculto?: boolean
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_author_profile_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          descricao: string | null
          emoji: string
          nome: string
          slug: string
        }
        Insert: {
          descricao?: string | null
          emoji?: string
          nome: string
          slug: string
        }
        Update: {
          descricao?: string | null
          emoji?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          user_id: string
        }
        Update: {
          comment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          corpo: string
          created_at: string
          deleted_at: string | null
          id: string
          likes_count: number
          oculto: boolean
          parent_id: string | null
          post_id: string
        }
        Insert: {
          author_id: string
          corpo: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          likes_count?: number
          oculto?: boolean
          parent_id?: string | null
          post_id: string
        }
        Update: {
          author_id?: string
          corpo?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          likes_count?: number
          oculto?: boolean
          parent_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_profile_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          item_ref: string
          item_tipo: string
          item_titulo: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_ref: string
          item_tipo: string
          item_titulo?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_ref?: string
          item_tipo?: string
          item_titulo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_profile_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_profile_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          descricao: string | null
          emoji: string
          id: string
          nome: string
          slug: string
          tipo: string
          uf: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          emoji?: string
          id?: string
          nome: string
          slug: string
          tipo?: string
          uf?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          emoji?: string
          id?: string
          nome?: string
          slug?: string
          tipo?: string
          uf?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          corpo: string | null
          created_at: string
          id: string
          lida: boolean
          link: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          corpo?: string | null
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          corpo?: string | null
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_saves: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comments_count: number
          corpo: string
          created_at: string
          deleted_at: string | null
          group_id: string | null
          id: string
          imagens: string[]
          kind: Database["public"]["Enums"]["post_kind"]
          likes_count: number
          oculto: boolean
          tags: string[]
          titulo: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          comments_count?: number
          corpo: string
          created_at?: string
          deleted_at?: string | null
          group_id?: string | null
          id?: string
          imagens?: string[]
          kind?: Database["public"]["Enums"]["post_kind"]
          likes_count?: number
          oculto?: boolean
          tags?: string[]
          titulo?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          comments_count?: number
          corpo?: string
          created_at?: string
          deleted_at?: string | null
          group_id?: string | null
          id?: string
          imagens?: string[]
          kind?: Database["public"]["Enums"]["post_kind"]
          likes_count?: number
          oculto?: boolean
          tags?: string[]
          titulo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_profile_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          capa_url: string | null
          cidade: string | null
          created_at: string
          empresa: string | null
          especialidades: string[]
          estado: string | null
          experiencia: string | null
          handle: string | null
          id: string
          instagram: string | null
          mostrar_cidade: boolean
          mostrar_instagram: boolean
          mostrar_site: boolean
          mostrar_telefone: boolean
          mostrar_whatsapp: boolean
          nome: string
          nome_profissional: string | null
          notificacoes: Json
          perfil_publico: boolean
          permitir_mensagens: boolean
          servicos: string[]
          site: string | null
          suspenso: boolean
          telefone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          capa_url?: string | null
          cidade?: string | null
          created_at?: string
          empresa?: string | null
          especialidades?: string[]
          estado?: string | null
          experiencia?: string | null
          handle?: string | null
          id: string
          instagram?: string | null
          mostrar_cidade?: boolean
          mostrar_instagram?: boolean
          mostrar_site?: boolean
          mostrar_telefone?: boolean
          mostrar_whatsapp?: boolean
          nome?: string
          nome_profissional?: string | null
          notificacoes?: Json
          perfil_publico?: boolean
          permitir_mensagens?: boolean
          servicos?: string[]
          site?: string | null
          suspenso?: boolean
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          capa_url?: string | null
          cidade?: string | null
          created_at?: string
          empresa?: string | null
          especialidades?: string[]
          estado?: string | null
          experiencia?: string | null
          handle?: string | null
          id?: string
          instagram?: string | null
          mostrar_cidade?: boolean
          mostrar_instagram?: boolean
          mostrar_site?: boolean
          mostrar_telefone?: boolean
          mostrar_whatsapp?: boolean
          nome?: string
          nome_profissional?: string | null
          notificacoes?: Json
          perfil_publico?: boolean
          permitir_mensagens?: boolean
          servicos?: string[]
          site?: string | null
          suspenso?: boolean
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          answers_count: number
          author_id: string
          categoria: string
          corpo: string | null
          created_at: string
          id: string
          imagens: string[]
          oculto: boolean
          resolvida: boolean
          tags: string[]
          titulo: string
        }
        Insert: {
          answers_count?: number
          author_id: string
          categoria?: string
          corpo?: string | null
          created_at?: string
          id?: string
          imagens?: string[]
          oculto?: boolean
          resolvida?: boolean
          tags?: string[]
          titulo: string
        }
        Update: {
          answers_count?: number
          author_id?: string
          categoria?: string
          corpo?: string | null
          created_at?: string
          id?: string
          imagens?: string[]
          oculto?: boolean
          resolvida?: boolean
          tags?: string[]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_author_profile_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          alvo_id: string
          alvo_tipo: string
          created_at: string
          detalhe: string | null
          id: string
          motivo: string
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          alvo_id: string
          alvo_tipo: string
          created_at?: string
          detalhe?: string | null
          id?: string
          motivo: string
          reporter_id: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          alvo_id?: string
          alvo_tipo?: string
          created_at?: string
          detalhe?: string | null
          id?: string
          motivo?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_profile_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_slug: string
          created_at: string
          user_id: string
        }
        Insert: {
          badge_slug: string
          created_at?: string
          user_id: string
        }
        Update: {
          badge_slug?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_slug_fkey"
            columns: ["badge_slug"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "user_badges_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          pontos: number
          updated_at: string
          user_id: string
        }
        Insert: {
          pontos?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          pontos?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_profile_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
      add_points: {
        Args: { _delta: number; _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "member"
      post_kind:
        | "discussao"
        | "duvida"
        | "antes_depois"
        | "produto"
        | "tecido"
        | "automotivo"
        | "dica"
        | "atencao"
      report_status: "aberta" | "em_analise" | "resolvida" | "descartada"
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
      app_role: ["admin", "moderator", "member"],
      post_kind: [
        "discussao",
        "duvida",
        "antes_depois",
        "produto",
        "tecido",
        "automotivo",
        "dica",
        "atencao",
      ],
      report_status: ["aberta", "em_analise", "resolvida", "descartada"],
    },
  },
} as const
