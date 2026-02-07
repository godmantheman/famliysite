'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Image as ImageIcon, Smile } from 'lucide-react';
import styles from './page.module.css';
import { clsx } from 'clsx';

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
    avatar?: string;
}

const MOCK_MESSAGES: Message[] = [
    { id: '1', text: '저녁 뭐 먹을까?', senderId: '2', senderName: 'Mom', timestamp: new Date(Date.now() - 3600000), avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mom' },
    { id: '2', text: '치킨 어때요?', senderId: '3', senderName: 'Brother', timestamp: new Date(Date.now() - 3500000), avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Brother' },
];

export default function ChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            senderId: user.id,
            senderName: user.name,
            timestamp: new Date(),
            avatar: user.avatar,
        };

        setMessages([...messages, newMessage]);
        setInputText('');

        // Simulate reply
        setTimeout(() => {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                text: '좋아요!',
                senderId: '2',
                senderName: 'Mom',
                timestamp: new Date(),
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mom'
            };
            setMessages(prev => [...prev, reply]);
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.searchBar}>
                    <Input placeholder="Search messages..." />
                </div>
                <div className={styles.chatList}>
                    <div className={`${styles.chatItem} ${styles.activeChat}`}>
                        <div className={styles.avatar} style={{ backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=family)` }}></div>
                        <div className={styles.chatInfo}>
                            <div className={styles.chatName}>Family Group</div>
                            <div className={styles.lastMessage}>{messages[messages.length - 1]?.text}</div>
                        </div>
                    </div>
                    {/* Mock other chats */}
                    <div className={styles.chatItem}>
                        <div className={styles.avatar} style={{ backgroundColor: '#FFC6C6' }}></div>
                        <div className={styles.chatInfo}>
                            <div className={styles.chatName}>Mom</div>
                            <div className={styles.lastMessage}>Where are you?</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.main}>
                <div className={styles.header}>
                    Family Group
                </div>

                <div className={styles.messageList}>
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
                        placeholder="Type a message..."
                        className={styles.chatInput}
                    />
                    <Button type="submit" size="icon"><Send size={18} /></Button>
                </form>
            </div>
        </div>
    );
}
