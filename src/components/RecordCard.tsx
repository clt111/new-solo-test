import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, formatDate, generateExcerpt, MOOD_CONFIG, WEATHER_CONFIG } from '@/utils';
import { Record } from '@/types';
import { 
  Calendar, 
  MapPin, 
  Tag, 
  Image,
  Cloud,
  Heart,
  MessageCircle,
  MoreVertical
} from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

interface RecordCardProps {
  record: Record;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

export const RecordCard: React.FC<RecordCardProps> = ({ 
  record, 
  onDelete, 
  onEdit,
  className 
}) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = React.useState(false);

  // Swipe handlers for mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => setShowActions(true),
    onSwipedRight: () => setShowActions(false),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleClick = () => {
    navigate(`/detail/${record.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(record.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条记录吗？')) {
      onDelete?.(record.id);
    }
  };

  const moodConfig = MOOD_CONFIG[record.mood];
  const weatherConfig = record.weather ? WEATHER_CONFIG[record.weather] : null;

  return (
    <div
      {...handlers}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-xl shadow-sm",
        "border border-gray-200 dark:border-gray-700",
        "p-4 sm:p-6",
        "transition-all duration-200",
        "hover:shadow-md hover:scale-[1.01]",
        "dark:hover:shadow-gray-700/50",
        "cursor-pointer overflow-hidden",
        className
      )}
      onClick={handleClick}
    >
      {/* Swipe Actions (Mobile) */}
      <div className={cn(
        "absolute inset-y-0 right-0 flex items-center gap-1 pr-2",
        "transition-transform duration-200",
        showActions ? "translate-x-0" : "translate-x-full"
      )}>
        <button
          onClick={handleEdit}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          编辑
        </button>
        <button
          onClick={handleDelete}
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          删除
        </button>
      </div>

      {/* Card Content */}
      <div className={cn(showActions && "pr-20")}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {record.title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {record.title}
              </h3>
            )}
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(record.createdAt)}
              </div>
              
              {weatherConfig && (
                <div className="flex items-center gap-1">
                  <span>{weatherConfig.icon}</span>
                  <span>{weatherConfig.label}</span>
                </div>
              )}
              
              {record.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-20">
                    {record.location.city || '未知位置'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mood */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-2xl">{moodConfig.emoji}</div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {moodConfig.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
            {generateExcerpt(record.content, 150)}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category */}
            {record.category && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {record.category}
                </span>
              </div>
            )}

            {/* Tags */}
            {record.tags && record.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {record.tags.length}
                </span>
              </div>
            )}

            {/* Images */}
            {record.images && record.images.length > 0 && (
              <div className="flex items-center gap-1">
                <Image className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {record.images.length}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              编辑
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              删除
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Swipe Hint for Mobile */}
      <div className="sm:hidden absolute bottom-1 right-1 text-xs text-gray-400">
        左滑操作
      </div>
    </div>
  );
};

interface RecordListProps {
  records: Record[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

export const RecordList: React.FC<RecordListProps> = ({ 
  records, 
  onDelete, 
  onEdit,
  className 
}) => {
  if (records.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <MessageCircle className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          还没有记录
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          点击右下角的 + 按钮开始记录你的心情吧
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
