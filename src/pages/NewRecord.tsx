import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Container, Header } from '@/components/Layout';
import { useStore } from '@/store';
import { 
  weatherService, 
  locationService, 
  imageService 
} from '@/services/daily';
import { 
  MOOD_CONFIG, 
  WEATHER_CONFIG, 
  formatDate,
  cn 
} from '@/utils';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Cloud,
  Tag,
  Save,
  Loader
} from 'lucide-react';
import { MoodType, WeatherType } from '@/types';

export const NewRecord: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    createRecord, 
    updateRecord, 
    getRecord,
    categories,
    settings 
  } = useStore();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>('calm');
  const [category, setCategory] = useState('');
  const [weather, setWeather] = useState<WeatherType | undefined>();
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Load existing record if editing
  useEffect(() => {
    if (id) {
      const loadRecord = async () => {
        const record = await getRecord(id);
        if (record) {
          setTitle(record.title || '');
          setContent(record.content);
          setMood(record.mood);
          setCategory(record.category);
          setWeather(record.weather);
          setTags(record.tags || []);
          setImages(record.images || []);
          if (record.location) {
            setLocation(record.location.city || '');
          }
        }
      };
      loadRecord();
    }
  }, [id, getRecord]);

  // Auto-detect location and weather if enabled
  useEffect(() => {
    if (settings?.enableLocation && !id) {
      getCurrentLocation();
    }
    if (settings?.enableWeather && !id) {
      getCurrentWeather();
    }
  }, [settings, id]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const locData = await locationService.getCurrentLocation();
      if (locData && locData.city) {
        setLocation(locData.city);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getCurrentWeather = async () => {
    setIsLoadingWeather(true);
    try {
      // For demo, we'll use a default location
      const weatherData = await weatherService.getCurrentWeather(39.9042, 116.4074); // Beijing
      setWeather(weatherData);
    } catch (error) {
      console.error('Failed to get weather:', error);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    
    for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
      const file = files[i];
      try {
        const compressedBlob = await imageService.compressImage(file, 800, 800, 0.7);
        const reader = new FileReader();
        
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === Math.min(files.length, 5 - images.length)) {
              setImages([...images, ...newImages]);
            }
          }
        };
        
        reader.readAsDataURL(compressedBlob);
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim()) && tags.length < 10) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('请输入记录内容');
      return;
    }

    if (!category) {
      alert('请选择分类');
      return;
    }

    setIsSubmitting(true);

    try {
      const recordData = {
        title: title.trim() || generateTitle(content),
        content: content.trim(),
        mood,
        category,
        weather,
        location: location ? {
          latitude: 0,
          longitude: 0,
          city: location,
        } : undefined,
        tags: tags.length > 0 ? tags : undefined,
        images: images.length > 0 ? images : undefined,
      };

      if (id) {
        await updateRecord(id, recordData);
      } else {
        await createRecord(recordData);
      }

      navigate('/');
    } catch (error) {
      console.error('Failed to save record:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTitle = (content: string): string => {
    const firstLine = content.split('\n')[0];
    return firstLine.length > 20 ? firstLine.substring(0, 20) + '...' : firstLine;
  };

  return (
    <Layout>
      <Container>
        <Header 
          title={id ? "编辑记录" : "新建记录"}
          subtitle={id ? "" : "记录此刻的心情与感受"}
          actions={
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </button>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              记录内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的想法、感受或者今天发生的事情..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Title (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题（可选）
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给你的记录起个标题"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              心情 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {Object.entries(MOOD_CONFIG).map(([moodType, config]) => (
                <button
                  key={moodType}
                  type="button"
                  onClick={() => setMood(moodType as MoodType)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    mood === moodType
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  )}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {config.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              分类 <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Weather */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              天气（可选）
            </label>
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-6 gap-2">
                {Object.entries(WEATHER_CONFIG).map(([weatherType, config]) => (
                  <button
                    key={weatherType}
                    type="button"
                    onClick={() => setWeather(weatherType as WeatherType)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                      weather === weatherType
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    )}
                  >
                    <span className="text-lg">{config.icon}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {config.label}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={getCurrentWeather}
                disabled={isLoadingWeather}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
              >
                <Cloud className="h-4 w-4" />
                {isLoadingWeather ? "获取中..." : "获取天气"}
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              位置（可选）
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例如：北京"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
              >
                <MapPin className="h-4 w-4" />
                {isLoadingLocation ? "定位中..." : "获取位置"}
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标签（可选，最多10个）
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="输入标签后按回车添加"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              图片（可选，最多5张）
            </label>
            <div className="space-y-3">
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-6 w-6 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    点击上传图片（最多5张）
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`上传图片 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {id ? "更新记录" : "保存记录"}
                </>
              )}
            </button>
          </div>
        </form>
      </Container>
    </Layout>
  );
};