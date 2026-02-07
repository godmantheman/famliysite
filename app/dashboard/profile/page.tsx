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
    const { user, refreshProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    // Initial load from state
    useEffect(() => {
        if (user) {
            setName(user.name || '');
        }
    }, [user]);

    // Fetch latest status separately or via AuthContext if we extend it
    useEffect(() => {
        if (user) {
            const fetchExtra = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('status_message, full_name')
                    .eq('id', user.id)
                    .maybeSingle();

                if (data) {
                    setStatus(data.status_message || '');
                    if (data.full_name) setName(data.full_name);
                }
                if (error) console.error("Error fetching profile extra info:", error);
            };
            fetchExtra();
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: name,
                    status_message: status
                })
                .eq('id', user.id);

            if (error) throw error;

            // Sync with AuthContext instead of reloading page
            await refreshProfile();
            alert('프로필이 성공적으로 업데이트되었습니다.');
            setIsEditing(false);
        } catch (error: any) {
            alert('저장 실패: ' + (error.message || "알 수 없는 오류"));
        } finally {
            setLoading(false);
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
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user?.name || '본인 이름을 설정해주세요'}</h1>
                            <p style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
                            <p style={{ marginTop: '0.5rem' }}>{status || '상태 메시지가 없습니다.'}</p>
                        </div>
                    ) : null}
                </div>

                {isEditing ? (
                    <div className={styles.form}>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>개인 정보</h2>
                            <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} placeholder="실명을 입력해주세요" />
                            <Input label="상태 메시지" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="오늘 기분은 어떠신가요?" />
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
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>가족 그룹에 합류되어 있습니다!</span>
                    ) : (
                        <span style={{ color: 'var(--muted-foreground)' }}>아직 가족 그룹에 속해있지 않습니다.</span>
                    )}
                </p>
                {!user?.familyId && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                        가입 시 코드를 입력하지 않으셨다면, 로그아웃 후 다시 가입하거나 관리자에게 문의하세요.
                    </p>
                )}
            </div>
        </div>
    );
}
