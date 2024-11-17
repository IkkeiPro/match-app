import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Heart, MessageCircle } from 'lucide-react';

export const Menu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">メニュー</h1>
      <Button
        onClick={() => navigate('/match')}
        fullWidth
        className="flex items-center justify-center gap-2 py-4"
      >
        <Heart className="w-6 h-6" />
        マッチング
      </Button>
      <Button
        onClick={() => navigate('/chatlist')}
        fullWidth
        className="flex items-center justify-center gap-2 py-4"
        variant="secondary"
      >
        <MessageCircle className="w-6 h-6" />
        チャット
      </Button>
    </div>
  );
};