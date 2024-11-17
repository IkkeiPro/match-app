import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { hashPassword } from '../utils/auth';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const hashedPassword = await hashPassword(password);

      const { data: user, error: err } = await supabase
        .from('user_mst')
        .select()
        .eq('username', username)
        .eq('password_hash', hashedPassword)
        .single();

      if (err || !user) {
        setError('ユーザー名またはパスワードが正しくありません');
        return;
      }

      setUser(user);
      navigate('/menu');
    } catch (err) {
      setError('エラーが発生しました');
    }
  };

  const isDisabled = !username || !password;

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">サインイン</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="ユーザーネーム"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        <Button type="submit" fullWidth disabled={isDisabled}>
          サインイン
        </Button>
      </form>
    </div>
  );
};