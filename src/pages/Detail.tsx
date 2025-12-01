import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Container, Header, LoadingSpinner } from '@/components/Layout';
import { useStore } from '@/store';
import { 
  MOOD_CONFIG, 
  WEATHER_CONFIG, 
  formatDate,
  cn 
} from '@/utils';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Tag,
  Share2,
  Download,
  Heart
} from 'lucide-react';
import { Record } from '@/types';

export const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecord, deleteRecord } = useStore();
  const [record, setRecord] = useState<Record | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecord = async () => {
      if (id) {
        const recordData = await getRecord(id);
        setRecord(recordData);
      }
      setIsLoading(false);
    };
    loadRecord();
  }, [id, getRecord]);

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    if (confirm('确定要删除这条记录吗？')) {
      await deleteRecord(id!);
      navigate('/');
    }
  };

  const handleShare = async () => {
    if (navigator.share && record) {
      try {
        await navigator.share({
          title: record.title || '树洞记录',
          text: record.content.substring(0, 200),
          url: window.location.href,
        });
      } catch (error) {
        console.error('分享失败:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const handleExport = () => {
    if (!record) return;

    const content = `# ${record.title || '树洞记录'}

**时间**: ${formatDate(record.createdAt)}
**心情**: ${MOOD_CONFIG[record.mood].emoji} ${MOOD_CONFIG[record.mood].label}
**分类**: ${record.category}
${record.weather ? `**天气**: ${WEATHER_CONFIG[record.weather].icon} ${WEATHER_CONFIG[record.weather].label}` : ''}
${record.location ? `**位置**: ${record.location.city || '未知位置'}` : ''}
${record.tags && record.tags.length > 0 ? `**标签**: ${record.tags.join(', ')}` : ''}

---

${record.content}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.title || '记录'}-${record.createdAt.toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <Container>
          <LoadingSpinner size="lg" className="mt-20" />
        </Container>
      </Layout>
    );
  }

  if (!record) {
    return (
      <Layout>
        <Container>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              记录不存在
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              这条记录可能已被删除或不存在
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              返回首页
            </button>
          </div>
        </Container>
      </Layout>
    );
  }

  const moodConfig = MOOD_CONFIG[record.mood];
  const weatherConfig = record.weather ? WEATHER_CONFIG[record.weather] : null;

  return (
    <Layout>
      <Container>
        <Header 
          title={record.title || '记录详情'}
          subtitle={formatDate(record.createdAt)}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="分享"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="导出"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="编辑"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600"
                title="删除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="返回"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          }
        />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>{moodConfig.emoji} {moodConfig.label}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(record.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: '#3B82F6' }}
              />
              <span>{record.category}</span>
            </div>

            {weatherConfig && (
              <div className="flex items-center gap-2">
                <span>{weatherConfig.icon}</span>
                <span>{weatherConfig.label}</span>
              </div>
            )}

            {record.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{record.location.city || '未知位置'}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {record.tags && record.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {record.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Images */}
          {record.images && record.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {record.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`记录图片 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                    onClick={() => {
                      const img = new Image();
                      img.src = image;
                      const w = window.open('', '_blank');
                      if (w) {
                        w.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;"><img src="${image}" style="max-width:100%;max-height:100vh;object-fit:contain;" /></body></html>`);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {record.content}
            </div>
          </div>

          {/* Updated Info */}
          {record.updatedAt.getTime() !== record.createdAt.getTime() && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                最后更新于 {formatDate(record.updatedAt)}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Edit className="h-4 w-4" />
            编辑记录
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            删除记录
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            返回首页
          </button>
        </div>
      </Container>
    </Layout>
  );
};