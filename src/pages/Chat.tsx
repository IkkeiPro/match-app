import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Send } from 'lucide-react';
import clsx from 'clsx';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatPartner {
  id: string;
  username: string;
}

export const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState<ChatPartner | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId && currentUser) {
      loadChatPartner();
      loadMessages();
      const subscription = subscribeToMessages();
      return () => {
        subscription();
      };
    }
  }, [userId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatPartner = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_mst')
        .select('id, username')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) setPartner(data);
    } catch (error) {
      console.error('Error loading chat partner:', error);
    }
  };

  const loadMessages = async () => {
    if (!currentUser?.id || !userId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_trn')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!currentUser?.id || !userId) return () => {};

    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_trn',
          filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id}))`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id || !userId || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from('chat_trn').insert([
        {
          sender_id: currentUser.id,
          receiver_id: userId,
          content: newMessage.trim(),
        },
      ]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        <div className="p-4 border-b bg-purple-50">
          <h2 className="text-xl font-bold text-purple-900">
            {partner?.username || 'チャット'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={clsx('flex flex-col max-w-[70%] space-y-1', {
                'ml-auto items-end': message.sender_id === currentUser?.id,
              })}
            >
              <div
                className={clsx('p-3 rounded-lg break-words', {
                  'bg-purple-600 text-white': message.sender_id === currentUser?.id,
                  'bg-gray-100': message.sender_id !== currentUser?.id,
                })}
              >
                <p>{message.content}</p>
              </div>
              <span className="text-xs text-gray-500">
                {formatMessageTime(message.created_at)}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            送信
          </Button>
        </form>
      </div>
    </div>
  );
};