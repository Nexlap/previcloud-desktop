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
      abbonamenti: {
        Row: {
          attivo: boolean | null
          cliente_id: string
          created_at: string | null
          deleted_at: string | null
          giorno_scadenza: number | null
          id: string
          importo_default: number
          nome: string | null
          note: string | null
          numero_mensilita: number | null
          preventivo_id: string | null
          tipo: string | null
          user_id: string
        }
        Insert: {
          attivo?: boolean | null
          cliente_id: string
          created_at?: string | null
          deleted_at?: string | null
          giorno_scadenza?: number | null
          id?: string
          importo_default: number
          nome?: string | null
          note?: string | null
          numero_mensilita?: number | null
          preventivo_id?: string | null
          tipo?: string | null
          user_id: string
        }
        Update: {
          attivo?: boolean | null
          cliente_id?: string
          created_at?: string | null
          deleted_at?: string | null
          giorno_scadenza?: number | null
          id?: string
          importo_default?: number
          nome?: string | null
          note?: string | null
          numero_mensilita?: number | null
          preventivo_id?: string | null
          tipo?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "abbonamenti_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clienti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abbonamenti_preventivo_id_fkey"
            columns: ["preventivo_id"]
            isOneToOne: false
            referencedRelation: "preventivi"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage: {
        Row: {
          costo_euro: number | null
          created_at: string | null
          endpoint: string
          errore: string | null
          id: string
          latenza_ms: number | null
          modello: string | null
          token_input: number | null
          token_output: number | null
          user_id: string | null
        }
        Insert: {
          costo_euro?: number | null
          created_at?: string | null
          endpoint: string
          errore?: string | null
          id?: string
          latenza_ms?: number | null
          modello?: string | null
          token_input?: number | null
          token_output?: number | null
          user_id?: string | null
        }
        Update: {
          costo_euro?: number | null
          created_at?: string | null
          endpoint?: string
          errore?: string | null
          id?: string
          latenza_ms?: number | null
          modello?: string | null
          token_input?: number | null
          token_output?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      clienti: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          indirizzo: string | null
          nome: string
          note: string | null
          telefono: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          indirizzo?: string | null
          nome: string
          note?: string | null
          telefono?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          indirizzo?: string | null
          nome?: string
          note?: string | null
          telefono?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clienti_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      eventi: {
        Row: {
          created_at: string | null
          dati: Json | null
          evento: string
          id: string
          schermata: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dati?: Json | null
          evento: string
          id?: string
          schermata?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dati?: Json | null
          evento?: string
          id?: string
          schermata?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      metodi_pagamento: {
        Row: {
          created_at: string | null
          dati: Json | null
          id: string
          nome: string
          predefinito: boolean | null
          tipo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dati?: Json | null
          id?: string
          nome: string
          predefinito?: boolean | null
          tipo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dati?: Json | null
          id?: string
          nome?: string
          predefinito?: boolean | null
          tipo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifiche: {
        Row: {
          archiviata: boolean
          created_at: string
          id: string
          invio_id: string | null
          letta: boolean
          messaggio: string
          payload: Json
          preventivo_id: string | null
          snooze_until: string | null
          tipo: string
          titolo: string
          user_id: string
        }
        Insert: {
          archiviata?: boolean
          created_at?: string
          id?: string
          invio_id?: string | null
          letta?: boolean
          messaggio: string
          payload?: Json
          preventivo_id?: string | null
          snooze_until?: string | null
          tipo: string
          titolo: string
          user_id: string
        }
        Update: {
          archiviata?: boolean
          created_at?: string
          id?: string
          invio_id?: string | null
          letta?: boolean
          messaggio?: string
          payload?: Json
          preventivo_id?: string | null
          snooze_until?: string | null
          tipo?: string
          titolo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifiche_invio_id_fkey"
            columns: ["invio_id"]
            isOneToOne: false
            referencedRelation: "preventivo_invii"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_preventivo_id_fkey"
            columns: ["preventivo_id"]
            isOneToOne: false
            referencedRelation: "preventivi"
            referencedColumns: ["id"]
          },
        ]
      }
      preventivi: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data_pagamento: string | null
          deleted_at: string | null
          id: string
          importo_totale: number | null
          is_ultimo: boolean | null
          messaggi_chat: Json | null
          messaggio_cliente: string | null
          nome_cliente: string | null
          numero_preventivo: string | null
          pagato: boolean
          pdf_url: string | null
          preventivo_padre_id: string | null
          stato: string | null
          template: string | null
          testo_preventivo: string | null
          titolo: string | null
          user_id: string | null
          versione: number | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          deleted_at?: string | null
          id?: string
          importo_totale?: number | null
          is_ultimo?: boolean | null
          messaggi_chat?: Json | null
          messaggio_cliente?: string | null
          nome_cliente?: string | null
          numero_preventivo?: string | null
          pagato?: boolean
          pdf_url?: string | null
          preventivo_padre_id?: string | null
          stato?: string | null
          template?: string | null
          testo_preventivo?: string | null
          titolo?: string | null
          user_id?: string | null
          versione?: number | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          deleted_at?: string | null
          id?: string
          importo_totale?: number | null
          is_ultimo?: boolean | null
          messaggi_chat?: Json | null
          messaggio_cliente?: string | null
          nome_cliente?: string | null
          numero_preventivo?: string | null
          pagato?: boolean
          pdf_url?: string | null
          preventivo_padre_id?: string | null
          stato?: string | null
          template?: string | null
          testo_preventivo?: string | null
          titolo?: string | null
          user_id?: string | null
          versione?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "preventivi_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clienti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventivi_preventivo_padre_id_fkey"
            columns: ["preventivo_padre_id"]
            isOneToOne: false
            referencedRelation: "preventivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventivi_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preventivo_invii: {
        Row: {
          audit_json: Json
          canale: string | null
          created_at: string
          firma_immagine_url: string | null
          firmato_at: string | null
          id: string
          inviato_at: string
          link_token: string
          metodo_firma: string | null
          pdf_firmato_url: string | null
          preventivo_id: string
          reminder_disabilitato: boolean
          revocato_at: string | null
          scade_at: string
          token_hash: string
          user_id: string
        }
        Insert: {
          audit_json?: Json
          canale?: string | null
          created_at?: string
          firma_immagine_url?: string | null
          firmato_at?: string | null
          id?: string
          inviato_at?: string
          link_token: string
          metodo_firma?: string | null
          pdf_firmato_url?: string | null
          preventivo_id: string
          reminder_disabilitato?: boolean
          revocato_at?: string | null
          scade_at: string
          token_hash: string
          user_id: string
        }
        Update: {
          audit_json?: Json
          canale?: string | null
          created_at?: string
          firma_immagine_url?: string | null
          firmato_at?: string | null
          id?: string
          inviato_at?: string
          link_token?: string
          metodo_firma?: string | null
          pdf_firmato_url?: string | null
          preventivo_id?: string
          reminder_disabilitato?: boolean
          revocato_at?: string | null
          scade_at?: string
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preventivo_invii_preventivo_id_fkey"
            columns: ["preventivo_id"]
            isOneToOne: false
            referencedRelation: "preventivi"
            referencedColumns: ["id"]
          },
        ]
      }
      preventivo_invii_eventi: {
        Row: {
          created_at: string
          id: string
          invio_id: string
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          invio_id: string
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          invio_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "preventivo_invii_eventi_invio_id_fkey"
            columns: ["invio_id"]
            isOneToOne: false
            referencedRelation: "preventivo_invii"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          categoria: string | null
          citta: string | null
          colore_brand: string | null
          contatore_preventivi: number | null
          created_at: string | null
          firma_nome: string | null
          id: string
          is_admin: boolean | null
          listino: string | null
          logo_url: string | null
          messaggi_cliente: Json
          nome_azienda: string | null
          note_pagamento: string | null
          onboarding_completato: boolean
          piva: string | null
          plan: string | null
          reminder_firma_giorni: number
          reminder_firma_globale_disabilitato: boolean
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_customer_id: string | null
          stripe_onboarding_status: string | null
          telefono: string | null
          template_preferito: string | null
          termini_accettati: boolean
          termini_accettati_at: string | null
          tono: string | null
          trial_ends_at: string | null
        }
        Insert: {
          categoria?: string | null
          citta?: string | null
          colore_brand?: string | null
          contatore_preventivi?: number | null
          created_at?: string | null
          firma_nome?: string | null
          id: string
          is_admin?: boolean | null
          listino?: string | null
          logo_url?: string | null
          messaggi_cliente?: Json
          nome_azienda?: string | null
          note_pagamento?: string | null
          onboarding_completato?: boolean
          piva?: string | null
          plan?: string | null
          reminder_firma_giorni?: number
          reminder_firma_globale_disabilitato?: boolean
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_customer_id?: string | null
          stripe_onboarding_status?: string | null
          telefono?: string | null
          template_preferito?: string | null
          termini_accettati?: boolean
          termini_accettati_at?: string | null
          tono?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          categoria?: string | null
          citta?: string | null
          colore_brand?: string | null
          contatore_preventivi?: number | null
          created_at?: string | null
          firma_nome?: string | null
          id?: string
          is_admin?: boolean | null
          listino?: string | null
          logo_url?: string | null
          messaggi_cliente?: Json
          nome_azienda?: string | null
          note_pagamento?: string | null
          onboarding_completato?: boolean
          piva?: string | null
          plan?: string | null
          reminder_firma_giorni?: number
          reminder_firma_globale_disabilitato?: boolean
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_customer_id?: string | null
          stripe_onboarding_status?: string | null
          telefono?: string | null
          template_preferito?: string | null
          termini_accettati?: boolean
          termini_accettati_at?: string | null
          tono?: string | null
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      profili_fiscali: {
        Row: {
          aliquota_iva: number | null
          aliquota_sostitutiva: number | null
          attivo: boolean | null
          coefficiente_redditivita: number | null
          costi_deducibili_percentuale: number | null
          created_at: string | null
          id: string
          inps_percentuale: number | null
          inps_tipo: string | null
          regime: string
          riduzione_contributiva: boolean | null
          riduzione_percentuale: number | null
          ritenuta_acconto: number | null
          rivalsa_inps: boolean | null
          rivalsa_percentuale: number | null
          soglia_fatturato: number | null
          soglia_occasionale: number | null
          user_id: string | null
        }
        Insert: {
          aliquota_iva?: number | null
          aliquota_sostitutiva?: number | null
          attivo?: boolean | null
          coefficiente_redditivita?: number | null
          costi_deducibili_percentuale?: number | null
          created_at?: string | null
          id?: string
          inps_percentuale?: number | null
          inps_tipo?: string | null
          regime?: string
          riduzione_contributiva?: boolean | null
          riduzione_percentuale?: number | null
          ritenuta_acconto?: number | null
          rivalsa_inps?: boolean | null
          rivalsa_percentuale?: number | null
          soglia_fatturato?: number | null
          soglia_occasionale?: number | null
          user_id?: string | null
        }
        Update: {
          aliquota_iva?: number | null
          aliquota_sostitutiva?: number | null
          attivo?: boolean | null
          coefficiente_redditivita?: number | null
          costi_deducibili_percentuale?: number | null
          created_at?: string | null
          id?: string
          inps_percentuale?: number | null
          inps_tipo?: string | null
          regime?: string
          riduzione_contributiva?: boolean | null
          riduzione_percentuale?: number | null
          ritenuta_acconto?: number | null
          rivalsa_inps?: boolean | null
          rivalsa_percentuale?: number | null
          soglia_fatturato?: number | null
          soglia_occasionale?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profili_fiscali_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_abbonamento: {
        Row: {
          abbonamento_id: string
          acconto: number | null
          anno: number
          created_at: string | null
          data_incasso: string | null
          id: string
          importo: number
          mese: number
          note: string | null
          saldo_residuo: number | null
          stato: string | null
        }
        Insert: {
          abbonamento_id: string
          acconto?: number | null
          anno: number
          created_at?: string | null
          data_incasso?: string | null
          id?: string
          importo: number
          mese: number
          note?: string | null
          saldo_residuo?: number | null
          stato?: string | null
        }
        Update: {
          abbonamento_id?: string
          acconto?: number | null
          anno?: number
          created_at?: string | null
          data_incasso?: string | null
          id?: string
          importo?: number
          mese?: number
          note?: string | null
          saldo_residuo?: number | null
          stato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_abbonamento_abbonamento_id_fkey"
            columns: ["abbonamento_id"]
            isOneToOne: false
            referencedRelation: "abbonamenti"
            referencedColumns: ["id"]
          },
        ]
      }
      segnalazioni: {
        Row: {
          created_at: string | null
          descrizione: string
          id: string
          priorita: string | null
          schermata: string | null
          stato: string | null
          tipo: string
          titolo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          descrizione: string
          id?: string
          priorita?: string | null
          schermata?: string | null
          stato?: string | null
          tipo: string
          titolo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          descrizione?: string
          id?: string
          priorita?: string | null
          schermata?: string | null
          stato?: string | null
          tipo?: string
          titolo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      servizi: {
        Row: {
          costo: number | null
          created_at: string | null
          descrizione: string | null
          id: string
          nome: string
          ordine: number | null
          unita: string | null
          user_id: string | null
        }
        Insert: {
          costo?: number | null
          created_at?: string | null
          descrizione?: string | null
          id?: string
          nome: string
          ordine?: number | null
          unita?: string | null
          user_id?: string | null
        }
        Update: {
          costo?: number | null
          created_at?: string | null
          descrizione?: string | null
          id?: string
          nome?: string
          ordine?: number | null
          unita?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servizi_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessioni: {
        Row: {
          id: string
          numero_sessioni: number | null
          primo_accesso: string | null
          ultimo_accesso: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          numero_sessioni?: number | null
          primo_accesso?: string | null
          ultimo_accesso?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          numero_sessioni?: number | null
          primo_accesso?: string | null
          ultimo_accesso?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trascrizioni: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          durata_secondi: number | null
          id: string
          preventivo_generato: boolean | null
          testo: string | null
          titolo: string | null
          user_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          durata_secondi?: number | null
          id?: string
          preventivo_generato?: boolean | null
          testo?: string | null
          titolo?: string | null
          user_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          durata_secondi?: number | null
          id?: string
          preventivo_generato?: boolean | null
          testo?: string | null
          titolo?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trascrizioni_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clienti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trascrizioni_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
