'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import { clsx } from 'clsx';

interface Message {
    id: string;
    text: string;
    senderId: string; // mapped from user_id
    senderName: string; // will need to join with profiles
    timestamp: Date; // mapped from created_at
    avatar?: string;
}

export default function ChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch initial messages
    useEffect(() => {
        if (!user?.familyId) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                id,
                text,
                created_at,
                user_id,
                profiles (
                    name,
                    avatar_url
                )
            `)
                .eq('family_id', user.familyId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching messages:', error);
            } else if (data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const formattedMessages: Message[] = data.map((msg: any) => ({
                    id: msg.id,
                    text: msg.text,
                    senderId: msg.user_id,
                    senderName: msg.profiles?.name || 'Unknown',
                    timestamp: new Date(msg.created_at),
                    avatar: msg.profiles?.avatar_url
                }));
                setMessages(formattedMessages);
            }
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('family_chat')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `family_id=eq.${user.familyId}`
                },
                async (payload) => {
                    // Fetch sender profile for the new message
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('name, avatar_url')
                        .eq('id', payload.new.user_id)
                        .single();

                    const newMessage: Message = {
                        id: payload.new.id,
                        text: payload.new.text,
                        senderId: payload.new.user_id,
                        senderName: profile?.name || 'Unknown',
                        timestamp: new Date(payload.new.created_at),
                        avatar: profile?.avatar_url
                    };

                    setMessages((prev) => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.familyId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user || !user.familyId) return;

        const textToSend = inputText;
        setInputText(''); // Clear input immediately for better UX

        const { error } = await supabase
            .from('messages')
            .insert({
                family_id: user.familyId,
                user_id: user.id,
                text: textToSend
            });

        if (error) {
            console.error('Error sending message:', error);
            alert('메시지 전송 실패');
            setInputText(textToSend); // Restore text on failure
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.searchBar}>
                    <Input placeholder="메시지 검색..." />
                </div>
                <div className={styles.chatList}>
                    <div className={`${styles.chatItem} ${styles.activeChat}`}>
                        <div className={styles.avatar} style={{ backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=family)` }}></div>
                        <div className={styles.chatInfo}>
                            <div className={styles.chatName}>가족 단체방</div>
                            <div className={styles.lastMessage}>{messages[messages.length - 1]?.text || '대화가 없습니다.'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.header}>
                    가족 단체방
                </div>

                <div className={styles.messageList}>
                    {!user?.familyId && (
                        <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
                            ⚠️ 가족 그룹에 속해있지 않습니다. 초대 코드를 통해 가족에 합류하거나 새로운 가족을 생성해주세요.
                        </div>
                    )}
                    {messages.length === 0 && user?.familyId && (
                        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--muted-foreground)' }}>
                            첫 메시지를 보내보세요! 👋
                        </div>
                    )}
                    {messages.map((msg) => {
                        const isOwn = msg.senderId === user?.id;
                        return (
                            <div key={msg.id} className={clsx(styles.message, isOwn && styles.ownMessage)}>
                                {!isOwn && <div className={styles.avatar}><img src={msg.avatar} alt="" style={{ width: '100%', height: '100%' }} /></div>}

                                <div className={styles.messageContent}>
                                    {!isOwn && <span className={styles.messageAuthor}>{msg.senderName}</span>}
                                    <div className={styles.messageBubble}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className={styles.inputArea}>
                    <Button type="button" variant="ghost" size="icon"><ImageIcon size={20} /></Button>
                    <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className={styles.chatInput}
                        disabled={!user?.familyId}
                    />
                    <Button type="submit" size="icon" disabled={!user?.familyId}><Send size={18} /></Button>
                </form>
            </div>
        </div>
    );
}
