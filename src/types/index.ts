export interface Record {
  id: string;
  title: string;
  content: string;
  mood: MoodType;
  category: string;
  weather?: WeatherType;
  location?: LocationData;
  images?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  recordCount: number;
  createdAt: Date;
}

export type MoodType = 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'calm' 
  | 'excited' 
  | 'tired' 
  | 'anxious' 
  | 'grateful';

export type WeatherType = 
  | 'sunny' 
  | 'cloudy' 
  | 'rainy' 
  | 'snowy' 
  | 'windy' 
  | 'foggy';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
}

export interface FilterOptions {
  keyword?: string;
  category?: string;
  mood?: MoodType;
  weather?: WeatherType;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  enableNotifications: boolean;
  enableLocation: boolean;
  enableWeather: boolean;
  defaultCategory?: string;
}