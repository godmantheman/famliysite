'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Camera, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './page.module.css';

export default function ProfilePage() {
    const { user, refreshProfile, isLoading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Initial load from state
    useEffect(() => {
        if (user) {
            setName(user.name || '');
        }
    }, [user]);

    // Fetch latest status separately
    useEffect(() => {
        if (user) {
            const fetchExtra = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('status_message, full_name')
                    .eq('id', user.id)
                    .maybeSingle();

                if (data) {
                    setStatus(data.status_message || '');
                    if (data.full_name && !name) setName(data.full_name);
                }
            };
            fetchExtra();
        }
    }, [user, name]);

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

            await refreshProfile();
            alert('프로필이 업데이트되었습니다.');
            setIsEditing(false);
        } catch (error: any) {
            alert('저장 실패: ' + (error.message || "알 수 없는 오류"));
        } finally {
            setLoading(false);
        }
    };

    const handleManualSync = async () => {
        setSyncing(true);
        try {
            await refreshProfile();
            // Small delay for effect
            await new Promise(resolve => setTimeout(resolve, 800));
        } finally {
            setSyncing(false);
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
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user?.name || '기본 사용자'}</h1>
                            <p style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
                            <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: 'var(--muted-foreground)' }}>
                                {status || '상태 메시지가 없습니다.'}
                            </p>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>나의 가족 연결 상태</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleManualSync}
                        disabled={syncing || isLoading}
                        style={{ height: '32px', fontSize: '0.8rem' }}
                    >
                        <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
                        {syncing ? '동기화 중...' : '강제 동기화'}
                    </Button>
                </div>

                <div className={styles.statusBox} style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: user?.familyId ? '#ebfbee' : '#fff5f5',
                    border: `1px solid ${user?.familyId ? '#37b24d' : '#fa5252'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {user?.familyId ? (
                        <>
                            <CheckCircle2 color="#37b24d" size={24} />
                            <div>
                                <strong style={{ color: '#2b8a3e', display: 'block' }}>가족 그룹에 연결됨</strong>
                                <span style={{ fontSize: '0.85rem', color: '#51cf66' }}>가족 모든 기능을 이용할 수 있습니다.</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertCircle color="#fa5252" size={24} />
                            <div>
                                <strong style={{ color: '#c92a2a', display: 'block' }}>가족 그룹 미소속</strong>
                                <span style={{ fontSize: '0.85rem', color: '#ff8787' }}>초대 코드로 합류하거나 새로 생성해야 합니다.</span>
                            </div>
                        </>
                    )}
                </div>

                {!user?.familyId && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '1rem', lineHeight: 1.5 }}>
                        ❓ 가입 시 정보를 입력했는데도 이 메시지가 보인다면, <strong>강제 동기화</strong> 버튼을 눌러보세요.
                        문제가 지속될 경우 로그아웃 후 다시 시도해주시기 바랍니다.
                    </p>
                )}
            </div>
        </div>
    );
}
