export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          roll_no: string
          department: string
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          roll_no: string
          department: string
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          roll_no?: string
          department?: string
          year?: number
          created_at?: string
          updated_at?: string
        }
      }
      face_encodings: {
        Row: {
          id: string
          student_id: string
          encoding_data: Json
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          encoding_data: Json
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          encoding_data?: Json
          image_url?: string | null
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          date: string
          time: string
          status: string
          marked_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          date?: string
          time?: string
          status?: string
          marked_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          date?: string
          time?: string
          status?: string
          marked_by?: string | null
          created_at?: string
        }
      }
    }
  }
}
