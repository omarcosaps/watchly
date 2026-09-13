export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          email: string
          acquisition_source: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          acquisition_source: string
          created_at?: string
        }
        Update: {
          email?: string
          acquisition_source?: string
        }
        Relationships: []
      }
      preferences: {
        Row: {
          user_id: string
          country: string
          provider_ids: number[]
          updated_at: string
        }
        Insert: {
          user_id: string
          country: string
          provider_ids: number[]
          updated_at?: string
        }
        Update: {
          country?: string
          provider_ids?: number[]
          updated_at?: string
        }
        Relationships: []
      }
      watchlist_items: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          media_type: "movie" | "tv"
          title: string
          poster_path: string | null
          year: number | null
          watched: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          media_type: "movie" | "tv"
          title: string
          poster_path?: string | null
          year?: number | null
          watched?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          poster_path?: string | null
          year?: number | null
          watched?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email_registered: {
        Args: { p_email: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
