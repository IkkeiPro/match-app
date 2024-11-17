import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../utils/auth';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    gender: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // ユーザー名の重複チェック
      const { data: existingUser } = await supabase
        .from('user_mst')
        .select('username')
        .eq('username', formData.username)
        .single();

      if (existingUser) {
        setError('このユーザー名は既に使用されています');
        return;
      }

      // メールアドレスの重複チェック
      const { data: existingEmail } = await supabase
        .from('user_mst')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingEmail) {
        setError('このメールアドレスは既に使用されています');
        return;
      }

      // パスワードをハッシュ化
      const hashedPassword = await hashPassword(formData.password);

      // ユーザー情報をテーブルに保存
      const { error: insertError } = await supabase
        .from('user_mst')
        .insert([{
          username: formData.username,
          email: formData.email,
          password_hash: hashedPassword,
          gender: formData.gender
        }]);

      if (insertError) throw insertError;
      navigate('/signupok');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'エラーが発生しました');
    }
  };

  const isDisabled = Object.values(formData).some(value => !value);

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">新規登録</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="ユーザーネーム"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={error && error.includes('ユーザー名') ? error : undefined}
        />
        <Input
          label="メールアドレス"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={error && error.includes('メールアドレス') ? error : undefined}
        />
        <Input
          label="パスワード"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          minLength={6}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            性別
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">選択してください</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
        </div>
        {error && !error.includes('ユーザー名') && !error.includes('メールアドレス') && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        <Button type="submit" fullWidth disabled={isDisabled}>
          登録
        </Button>
      </form>
    </div>
  );
};