'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Camera, Save } from 'lucide-react';
import styles from './page.module.css';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            if (user.name && user.name !== name) {
                setName(user.name);
            }
            const fetchProfile = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('status_message')
                    .eq('id', user.id)
                    .single();
                if (data) setStatus(data.status_message || '');
            };
            fetchProfile();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        const { error } = await supabase
            .from('profiles')
            .update({ full_name: name, status_message: status })
            .eq('id', user.id);

        setLoading(false);
        setIsEditing(false);

        if (error) {
            alert('저장 실패: ' + error.message);
        } else {
            alert('프로필이 업데이트되었습니다.');
            window.location.reload();
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.avatarContainer}>
                        <div
                            className={styles.avatar}
                            style={{
                                backgroundImage: `url(${user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'})`,
                                backgroundSize: 'cover'
                            }}
                        />
                        <button className={styles.editAvatar}>
                            <Camera size={20} />
                        </button>
                    </div>
                    {!isEditing ? (
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{name}</h1>
                            <p style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
                            <p style={{ marginTop: '0.5rem' }}>{status || '상태 메시지가 없습니다.'}</p>
                        </div>
                    ) : null}
                </div>

                {isEditing ? (
                    <div className={styles.form}>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>개인 정보</h2>
                            <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} />
                            <Input label="상태 메시지" value={status} onChange={(e) => setStatus(e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>취소</Button>
                            <Button onClick={handleSave} disabled={loading}>
                                <Save size={16} style={{ marginRight: '8px' }} />
                                {loading ? '저장 중...' : '저장'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)} fullWidth style={{ marginTop: '2rem' }}>프로필 수정</Button>
                )}
            </Card>

            <div className={styles.familyInfo}>
                <h3>나의 가족</h3>
                <p>
                    {user?.familyId ? (
                        <>가족 그룹에 합류되어 있습니다.</>
                    ) : (
                        <span style={{ color: 'var(--muted-foreground)' }}>아직 가족 그룹에 속해있지 않습니다.</span>
                    )}
                </p>
            </div>
        </div>
    );
}
