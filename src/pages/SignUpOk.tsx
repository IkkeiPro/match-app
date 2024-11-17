import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { CheckCircle } from 'lucide-react';

export const SignUpOk: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-4">サインアップできました</h1>
      <p className="text-gray-600 mb-8">
        アカウントの作成が完了しました。サインインしてサービスをご利用ください。
      </p>
      <Button onClick={() => navigate('/signin')} fullWidth>
        サインインする
      </Button>
    </div>
  );
};