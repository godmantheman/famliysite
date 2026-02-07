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
                <h1 className={styles.title}>Welcome home, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className={styles.date}>{date}</p>
            </header>

            <div className={styles.grid}>
                <Card className={styles.todayCard}>
                    <h2>Today's Schedule</h2>
                    <div className={styles.emptyState}>No events scheduled for today.</div>
                </Card>

                <Card className={styles.chatCard}>
                    <h2>Recent Messages</h2>
                    <div className={styles.emptyState}>No recent messages.</div>
                </Card>

                <Card className={styles.todoCard}>
                    <h2>To-Do List</h2>
                    <div className={styles.emptyState}>All tasks completed!</div>
                </Card>
            </div>
        </div>
    );
}
