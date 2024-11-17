import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface MatchedUser {
  id: string;
  username: string;
}

export const ChatList: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);

  useEffect(() => {
    loadMatchedUsers();
  }, []);

  const loadMatchedUsers = async () => {
    if (!currentUser) return;

    // Get users who liked current user
    const { data: likedByData } = await supabase
      .from('suki_mst')
      .select('user_id')
      .eq('target_user_id', currentUser.id);

    // Get users who current user liked
    const { data: likedData } = await supabase
      .from('suki_mst')
      .select('target_user_id')
      .eq('user_id', currentUser.id);

    if (!likedByData || !likedData) return;

    // Find mutual likes
    const mutualLikes = likedByData
      .map(item => item.user_id)
      .filter(id => 
        likedData.some(like => like.target_user_id === id)
      );

    if (mutualLikes.length === 0) {
      setMatchedUsers([]);
      return;
    }

    // Get user details for mutual likes
    const { data: userData } = await supabase
      .from('user_mst')
      .select('id, username')
      .in('id', mutualLikes);

    setMatchedUsers(userData || []);
  };

  if (matchedUsers.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">マッチしているユーザーがいません</h2>
        <p className="text-gray-600">新しい出会いを探してみましょう！</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">チャット一覧</h2>
      <div className="space-y-4">
        {matchedUsers.map(user => (
          <button
            key={user.id}
            onClick={() => navigate(`/chat/${user.id}`)}
            className="w-full p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-left"
          >
            <p className="text-lg font-medium">{user.username}</p>
          </button>
        ))}
      </div>
    </div>
  );
};