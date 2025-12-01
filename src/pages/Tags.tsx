import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MOOD_CONFIG } from '../utils';
import { Tag, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Record } from '@/types';

interface TagStats {
  name: string;
  count: number;
  records: Record[];
  lastUsed: Date | null;
}

export default function Tags() {
  const { records, updateRecord } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tagStats = useMemo<TagStats[]>(() => {
    const tagMap: { [key: string]: TagStats } = {};
    
    records.forEach(record => {
      record.tags?.forEach(tag => {
        if (!tagMap[tag]) {
          tagMap[tag] = {
            name: tag,
            count: 0,
            records: [],
            lastUsed: null
          };
        }
        tagMap[tag].count++;
        tagMap[tag].records.push(record);
        const recordDate = new Date(record.createdAt);
        if (!tagMap[tag].lastUsed || recordDate > tagMap[tag].lastUsed!) {
          tagMap[tag].lastUsed = recordDate;
        }
      });
    });

    return Object.values(tagMap)
      .sort((a, b) => b.count - a.count)
      .filter(tag => 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [records, searchTerm]);

  const handleEditTag = (oldName: string) => {
    setEditingTag(oldName);
    setNewTagName(oldName);
  };

  const handleSaveTag = async () => {
    if (!editingTag || !newTagName.trim() || newTagName === editingTag) {
      setEditingTag(null);
      setNewTagName('');
      return;
    }

    // 更新所有包含旧标签的记录
    const recordsToUpdate = records.filter(record => 
      record.tags?.includes(editingTag)
    );

    for (const record of recordsToUpdate) {
      const newTags = record.tags?.map(tag => 
        tag === editingTag ? newTagName.trim() : tag
      ) || [];
      await updateRecord(record.id, { tags: newTags });
    }

    setEditingTag(null);
    setNewTagName('');
  };

  const handleDeleteTag = async (tagName: string) => {
    if (!confirm(`确定要删除标签 "${tagName}" 吗？所有包含此标签的记录都会被移除该标签。`)) {
      return;
    }

    // 从所有记录中移除该标签
    const recordsToUpdate = records.filter(record => 
      record.tags?.includes(tagName)
    );

    for (const record of recordsToUpdate) {
      const newTags = record.tags?.filter(tag => tag !== tagName) || [];
      await updateRecord(record.id, { tags: newTags });
    }
  };

  const handleViewTagRecords = (tagName: string) => {
    setSelectedTag(selectedTag === tagName ? null : tagName);
  };

  const selectedTagRecords = useMemo(() => {
    if (!selectedTag) return [];
    return records
      .filter(record => record.tags?.includes(selectedTag))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [records, selectedTag]);

  const totalTags = tagStats.length;
  const totalTagUsages = tagStats.reduce((sum, tag) => sum + tag.count, 0);
  const averageUsagePerTag = totalTags > 0 ? (totalTagUsages / totalTags).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">标签管理</h1>
          
          {/* 搜索栏 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Tag className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalTags}</div>
                  <div className="text-sm text-gray-600">总标签数</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="text-green-600 font-bold text-sm">总</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalTagUsages}</div>
                  <div className="text-sm text-gray-600">总使用次数</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="text-purple-600 font-bold text-sm">均</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{averageUsagePerTag}</div>
                  <div className="text-sm text-gray-600">平均使用次数</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 标签列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">标签列表</h2>
          </div>

          {tagStats.length === 0 ? (
            <div className="p-8 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">还没有标签</p>
              <p className="text-sm text-gray-400">创建记录时添加标签来管理内容</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tagStats.map((tag) => (
                <div key={tag.name} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Tag className="h-3 w-3 text-blue-600" />
                      </div>
                      
                      {editingTag === tag.name ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveTag();
                              } else if (e.key === 'Escape') {
                                setEditingTag(null);
                                setNewTagName('');
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveTag}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => {
                              setEditingTag(null);
                              setNewTagName('');
                            }}
                            className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{tag.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {tag.count}
                            </span>
                          </div>
                          {tag.lastUsed && (
                            <div className="text-sm text-gray-500">
                              最后使用: {format(tag.lastUsed, 'MM月dd日', { locale: zhCN })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {editingTag !== tag.name && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewTagRecords(tag.name)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="查看记录"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditTag(tag.name)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="编辑标签"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.name)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="删除标签"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 标签记录详情 */}
        {selectedTag && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  标签 "{selectedTag}" 的记录
                </h3>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {selectedTagRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">没有找到包含此标签的记录</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTagRecords.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => {
                          navigate(`/detail/${record.id}`);
                          setSelectedTag(null);
                        }}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                            style={{
                              backgroundColor: MOOD_CONFIG[record.mood as keyof typeof MOOD_CONFIG]?.color || '#9CA3AF'
                            }}
                          >
                            {MOOD_CONFIG[record.mood as keyof typeof MOOD_CONFIG]?.emoji}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {MOOD_CONFIG[record.mood as keyof typeof MOOD_CONFIG]?.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(record.createdAt), 'MM月dd日 HH:mm', { locale: zhCN })}
                              </span>
                            </div>
                            
                            {record.content && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {record.content}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-1">
                              {record.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    tag === selectedTag
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
