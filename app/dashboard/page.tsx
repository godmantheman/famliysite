'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/card';
import styles from './page.module.css';

export default function DashboardPage() {
    const { user } = useAuth();
    const date = new Date().toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>어서오세요, {user?.name?.split(' ')[0]}님! 👋</h1>
                <p className={styles.date}>{date}</p>
            </header>

            <div className={styles.grid}>
                <Card className={styles.todayCard}>
                    <h2>오늘의 일정</h2>
                    <div className={styles.emptyState}>오늘 예정된 일정이 없습니다.</div>
                </Card>

                <Card className={styles.chatCard}>
                    <h2>최근 메시지</h2>
                    <div className={styles.emptyState}>최근 대화가 없습니다.</div>
                </Card>

                <Card className={styles.todoCard}>
                    <h2>해야 할 일</h2>
                    <div className={styles.emptyState}>모든 할 일을 마쳤습니다!</div>
                </Card>
            </div>
        </div>
    );
}
