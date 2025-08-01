export interface UserProfile {
  id: string
  user_id: string
  full_name?: string
  bio?: string
  university?: string
  career?: string
  semester?: number
  timezone?: string
  avatar_url?: string
  email?: string
  notification_settings?: {
    push_notifications?: boolean
    study_session_reminders?: boolean
    grade_notifications?: boolean
    calendar_reminders?: boolean
  }
  preferences?: any
  created_at: string
  updated_at: string
}

export interface UserProfileCreate {
  full_name?: string
  bio?: string
  university?: string
  career?: string
  semester?: number
  timezone?: string
  avatar_url?: string
  notification_settings?: {
    push_notifications?: boolean
    study_session_reminders?: boolean
    grade_notifications?: boolean
    calendar_reminders?: boolean
  }
}

export interface UserProfileUpdate {
  full_name?: string
  bio?: string
  university?: string
  career?: string
  semester?: number
  timezone?: string
  avatar_url?: string
  notification_settings?: {
    push_notifications?: boolean
    study_session_reminders?: boolean
    grade_notifications?: boolean
    calendar_reminders?: boolean
  }
  preferences?: any
}

export interface UserDevice {
  id: string
  user_id: string
  device_id: string
  device_name: string
  device_type: "ios" | "android" | "web"
  push_token?: string
  is_active: boolean
  last_seen: string
  created_at: string
  updated_at: string
}

export interface UserDeviceCreate {
  device_id: string
  device_name: string
  device_type: "ios" | "android" | "web"
  push_token?: string
}

export interface UserDeviceUpdate {
  device_name?: string
  push_token?: string
  is_active?: boolean
}

// Avatar configuration
export interface Avatar {
  id: string
  name: string
  path: any // require() path
}

export const AVAILABLE_AVATARS: Avatar[] = [
  {
    id: "avatar_1",
    name: "Saitama",
    path: require("@/assets/avatares/1.png"),
  },
  {
    id: "avatar_2",
    name: "Hermione Granger",
    path: require("@/assets/avatares/2.png"),
  },
  {
    id: "avatar_3",
    name: "Keanu Reeves",
    path: require("@/assets/avatares/3.png"),
  },
  {
    id: "avatar_4",
    name: "R2-D2",
    path: require("@/assets/avatares/4.png"),
  },
  {
    id: "avatar_5",
    name: "Wall-E",
    path: require("@/assets/avatares/5.png"),
  },
  {
    id: "avatar_6",
    name: "Aristóteles",
    path: require("@/assets/avatares/6.png"),
  },
  {
    id: "avatar_7",
    name: "Sailor Moon",
    path: require("@/assets/avatares/7.png"),
  },
  {
    id: "avatar_8",
    name: "Albert Einstein",
    path: require("@/assets/avatares/8.png"),
  },
  {
    id: "avatar_9",
    name: "Ada Lovelace",
    path: require("@/assets/avatares/9.png"),
  },
  {
    id: "avatar_10",
    name: "Bruce Lee",
    path: require("@/assets/avatares/10.png"),
  },
]
