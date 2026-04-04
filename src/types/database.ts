export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      alibaba_items: {
        Row: {
          id: string;
          title: string;
          price_min_usd: number | null;
          price_max_usd: number | null;
          image_url: string | null;
          product_url: string;
          seller_name: string | null;
          source_keyword: string;
          item_category:
            | "acrylic_stand"
            | "figure"
            | "can_badge"
            | "itabag"
            | "dakimakura";
          raw_json: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          price_min_usd?: number | null;
          price_max_usd?: number | null;
          image_url?: string | null;
          product_url: string;
          seller_name?: string | null;
          source_keyword: string;
          item_category:
            | "acrylic_stand"
            | "figure"
            | "can_badge"
            | "itabag"
            | "dakimakura";
          raw_json: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          price_min_usd?: number | null;
          price_max_usd?: number | null;
          image_url?: string | null;
          product_url?: string;
          seller_name?: string | null;
          source_keyword?: string;
          item_category?:
            | "acrylic_stand"
            | "figure"
            | "can_badge"
            | "itabag"
            | "dakimakura";
          raw_json?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      characters: {
        Row: {
          id: string;
          name_ja: string;
          name_zh: string;
          name_en: string;
          slug: string;
          game: "genshin" | "starrail" | "wutheringwaves";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_ja: string;
          name_zh: string;
          name_en: string;
          slug: string;
          game?: "genshin" | "starrail" | "wutheringwaves";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name_ja?: string;
          name_zh?: string;
          name_en?: string;
          slug?: string;
          game?: "genshin" | "starrail" | "wutheringwaves";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          title_ja: string;
          title_zh: string | null;
          character_id: string;
          game: "genshin" | "starrail" | "wutheringwaves";
          item_type:
            | "figure"
            | "acrylic_stand"
            | "plush"
            | "apparel"
            | "stationery"
            | "other";
          source: string | null;
          price_cny: number | null;
          price_jpy_estimate: number | null;
          image_url: string | null;
          purchase_urls: Json;
          release_date: string | null;
          is_china_exclusive: boolean;
          availability: "preorder" | "available" | "sold_out" | "unknown";
          description: string | null;
          last_verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title_ja: string;
          title_zh?: string | null;
          character_id: string;
          game?: "genshin" | "starrail" | "wutheringwaves";
          item_type:
            | "figure"
            | "acrylic_stand"
            | "plush"
            | "apparel"
            | "stationery"
            | "other";
          source?: string | null;
          price_cny?: number | null;
          price_jpy_estimate?: number | null;
          image_url?: string | null;
          purchase_urls?: Json;
          release_date?: string | null;
          is_china_exclusive?: boolean;
          availability?: "preorder" | "available" | "sold_out" | "unknown";
          description?: string | null;
          last_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title_ja?: string;
          title_zh?: string | null;
          character_id?: string;
          game?: "genshin" | "starrail" | "wutheringwaves";
          item_type?:
            | "figure"
            | "acrylic_stand"
            | "plush"
            | "apparel"
            | "stationery"
            | "other";
          source?: string | null;
          price_cny?: number | null;
          price_jpy_estimate?: number | null;
          image_url?: string | null;
          purchase_urls?: Json;
          release_date?: string | null;
          is_china_exclusive?: boolean;
          availability?: "preorder" | "available" | "sold_out" | "unknown";
          description?: string | null;
          last_verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "items_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
