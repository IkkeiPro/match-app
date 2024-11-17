import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Heart } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <Heart className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">マッチングアプリへようこそ</h1>
        <p className="text-lg text-gray-600 mb-8">
          素敵な出会いを見つけましょう。あなたの運命の人があなたを待っているかもしれません。
        </p>
      </div>
      <div className="space-y-4">
        <Button
          onClick={() => navigate('/signin')}
          fullWidth
          className="text-lg py-3"
        >
          サインイン
        </Button>
        <Button
          onClick={() => navigate('/signup')}
          variant="secondary"
          fullWidth
          className="text-lg py-3"
        >
          新規登録
        </Button>
      </div>
    </div>
  );
};