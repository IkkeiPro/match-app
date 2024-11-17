import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Heart, X } from 'lucide-react';

interface User {
  id: string;
  username: string;
  gender: string;
}

export const Match: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!currentUser) return;

    try {
      // 既に判定済みのユーザーIDを取得
      const judgedUserIds = await getJudgedUserIds();
      
      // 現在のユーザーと異なる性別のユーザーを取得
      const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male';
      
      let query = supabase
        .from('user_mst')
        .select('id, username, gender')
        .eq('gender', oppositeGender);

      // 判定済みユーザーがいる場合のみ、除外条件を追加
      if (judgedUserIds.length > 0) {
        query = query.not('id', 'in', `(${judgedUserIds.map(id => `'${id}'`).join(',')})`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const getJudgedUserIds = async () => {
    if (!currentUser) return [];

    try {
      // すきテーブルから判定済みユーザーを取得
      const { data: likedData } = await supabase
        .from('suki_mst')
        .select('target_user_id')
        .eq('user_id', currentUser.id);

      // きらいテーブルから判定済みユーザーを取得
      const { data: dislikedData } = await supabase
        .from('kirai_mst')
        .select('target_user_id')
        .eq('user_id', currentUser.id);

      // 判定済みユーザーIDをマージして返す
      return [
        ...(likedData?.map(item => item.target_user_id) || []),
        ...(dislikedData?.map(item => item.target_user_id) || [])
      ];
    } catch (error) {
      console.error('Error getting judged users:', error);
      return [];
    }
  };

  const handleJudgment = async (liked: boolean) => {
    if (!currentUser || !users[currentIndex]) return;

    try {
      const targetUserId = users[currentIndex].id;
      const table = liked ? 'suki_mst' : 'kirai_mst';

      const { error } = await supabase
        .from(table)
        .insert([{
          user_id: currentUser.id,
          target_user_id: targetUserId
        }]);

      if (error) throw error;
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error recording judgment:', error);
    }
  };

  if (currentIndex >= users.length) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">表示できるユーザーがいません</h2>
        <p className="text-gray-600">また後でチェックしてください。</p>
      </div>
    );
  }

  const currentProfile = users[currentIndex];

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">{currentProfile.username}</h2>
      </div>
      <div className="flex justify-center gap-4">
        <Button
          variant="danger"
          onClick={() => handleJudgment(false)}
          className="flex items-center gap-2"
        >
          <X className="w-5 h-5" />
          きらい
        </Button>
        <Button
          onClick={() => handleJudgment(true)}
          className="flex items-center gap-2"
        >
          <Heart className="w-5 h-5" />
          すき
        </Button>
      </div>
    </div>
  );
};