import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types
export interface Event {
  id: number
  name: string
  description: string
  event_type: string
  platform: string
  event_date: string
  event_time: string | null
  registration_deadline: string
  max_participants: number | null
  is_active: boolean
  is_paid: boolean
  price: number
  is_team_based: boolean
  team_size_min: number
  team_size_max: number
  rules: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  institution: string
  phone: string
  created_at: string
  profile_picture: string | null
  gender: string | null
  date_of_birth: string | null
  t_shirt_size: string | null
  social_media: any
  bio: string | null
  is_admin: boolean
}

export interface Registration {
  id: string
  user_id: string
  event_id: number
  registration_date: string
  status: string
}

export interface Team {
  id: string
  name: string
  leader_id: string
  event_id: number
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  data?: any
}

export interface Submission {
  id: string
  registration_id: string
  drive_link: string
  description: string | null
  submitted_at: string
  updated_at: string
}
