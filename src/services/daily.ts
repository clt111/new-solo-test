import { WeatherType, LocationData } from '@/types';

// Weather Service
class WeatherService {
  private apiKey = 'demo_key'; // 使用免费的天气API
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherType> {
    try {
      // 模拟天气数据，实际使用时需要真实的API密钥
      const weatherConditions = ['sunny', 'cloudy', 'rainy', 'windy'] as WeatherType[];
      return weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      
      // 实际API调用示例：
      // const response = await fetch(
      //   `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      // );
      // const data = await response.json();
      // return this.mapWeatherCondition(data.weather[0].main);
    } catch (error) {
      console.error('Failed to get weather:', error);
      return 'sunny'; // 默认返回晴天
    }
  }

  private mapWeatherCondition(condition: string): WeatherType {
    const conditionMap: Record<string, WeatherType> = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'rainy',
      'Snow': 'snowy',
      'Mist': 'foggy',
      'Fog': 'foggy',
      'Wind': 'windy',
    };
    return conditionMap[condition] || 'sunny';
  }
}

// Location Service
class LocationService {
  async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // 获取地址信息
            const address = await this.getAddressFromCoords(latitude, longitude);
            resolve({
              latitude,
              longitude,
              ...address,
            });
          } catch (error) {
            resolve({
              latitude,
              longitude,
            });
          }
        },
        (error) => {
          console.error('Failed to get location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5分钟缓存
        }
      );
    });
  }

  private async getAddressFromCoords(lat: number, lon: number): Promise<Partial<LocationData>> {
    try {
      // 使用Nominatim API (免费，无需密钥)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      return {
        address: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village,
      };
    } catch (error) {
      console.error('Failed to get address:', error);
      return {};
    }
  }
}

// Daily Tip Service
class DailyTipService {
  private tips = [
    "每一天都是新的开始，保持积极的心态！",
    "记录生活中的美好瞬间，让回忆更加珍贵。",
    "适当的运动能让心情更加愉悦。",
    "深呼吸，放松心情，一切都会好起来的。",
    "感恩身边的人和事，生活会更美好。",
    "保持规律的作息，身体和心理都会更健康。",
    "学会放下，才能拥抱更多可能。",
    "小确幸就在身边，用心去发现。",
    "与大自然接触，让心灵得到净化。",
    "记录情绪变化，更好地了解自己。",
  ];

  getRandomTip(): string {
    return this.tips[Math.floor(Math.random() * this.tips.length)];
  }

  getTipOfTheDay(): string {
    const today = new Date().toDateString();
    const storedTip = localStorage.getItem(`tip_${today}`);
    
    if (storedTip) {
      return storedTip;
    }
    
    const newTip = this.getRandomTip();
    localStorage.setItem(`tip_${today}`, newTip);
    return newTip;
  }
}

// Mood Analysis Service
class MoodAnalysisService {
  analyzeMoodTrends(records: any[]) {
    const moodCounts: Record<string, number> = {};
    const moodByDay: Record<string, string[]> = {};
    
    records.forEach(record => {
      const date = new Date(record.createdAt).toDateString();
      const mood = record.mood;
      
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      
      if (!moodByDay[date]) {
        moodByDay[date] = [];
      }
      moodByDay[date].push(mood);
    });

    const mostFrequentMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    const totalRecords = records.length;
    const moodPercentages = Object.entries(moodCounts)
      .reduce((acc, [mood, count]) => {
        acc[mood] = Math.round((count / totalRecords) * 100);
        return acc;
      }, {} as Record<string, number>);

    return {
      moodCounts,
      moodPercentages,
      mostFrequentMood,
      totalRecords,
      moodByDay,
    };
  }

  getMoodSuggestions(currentMood: string, recentMoods: string[]): string[] {
    const suggestions: Record<string, string[]> = {
      sad: [
        "尝试听一些轻快的音乐",
        "与朋友聊聊天",
        "去户外走走，呼吸新鲜空气",
        "做一些自己喜欢的事情",
      ],
      angry: [
        "深呼吸，数到10",
        "尝试冥想或瑜伽",
        "写下来自己的感受",
        "找一个安静的地方冷静一下",
      ],
      anxious: [
        "练习深呼吸技巧",
        "列出让你焦虑的事情并制定计划",
        "听一些舒缓的音乐",
        "尝试渐进式肌肉放松",
      ],
      tired: [
        "确保充足的睡眠",
        "适当休息，不要过度劳累",
        "喝一杯温水，补充水分",
        "做一些轻松的伸展运动",
      ],
    };

    return suggestions[currentMood] || [
      "保持当前的好状态",
      "记录下这个美好的时刻",
      "与他人分享你的快乐",
    ];
  }
}

// Notification Service
class NotificationService {
  private permission: NotificationPermission = 'default';

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    this.permission = await Notification.requestPermission();
    return this.permission;
  }

  async sendReminder(title: string, body: string, delayMinutes: number = 0): Promise<void> {
    if (this.permission !== 'granted') {
      const newPermission = await this.requestPermission();
      if (newPermission !== 'granted') {
        console.warn('Notification permission denied');
        return;
      }
    }

    if (delayMinutes > 0) {
      setTimeout(() => {
        this.showNotification(title, body);
      }, delayMinutes * 60 * 1000);
    } else {
      this.showNotification(title, body);
    }
  }

  private showNotification(title: string, body: string): void {
    new Notification(title, {
      body,
      icon: '/icon-192x192.png', // 需要添加图标文件
      badge: '/icon-72x72.png',
    });
  }

  scheduleDailyReminder(hour: number = 20, minute: number = 0): void {
    const now = new Date();
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();
    
    setTimeout(() => {
      this.sendReminder('树洞提醒', '今天过得怎么样？来记录一下你的心情吧！');
      // 递归调用以安排明天的提醒
      this.scheduleDailyReminder(hour, minute);
    }, delay);
  }
}

// Image Service
class ImageService {
  async compressImage(file: File, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          let { width, height } = img;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, file.type, quality);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async resizeImageForPreview(file: File, maxWidth: number = 300, maxHeight: number = 300): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL(file.type));
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

// Export services
export const weatherService = new WeatherService();
export const locationService = new LocationService();
export const dailyTipService = new DailyTipService();
export const moodAnalysisService = new MoodAnalysisService();
export const notificationService = new NotificationService();
export const imageService = new ImageService();
