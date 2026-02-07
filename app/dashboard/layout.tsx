'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Calendar, CheckSquare, Image as ImageIcon, User, LogOut, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import styles from './layout.module.css';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
    { href: '/dashboard', label: '홈', icon: Home },
    { href: '/dashboard/chat', label: '가족 채팅', icon: MessageCircle },
    { href: '/dashboard/calendar', label: '캘린더', icon: Calendar },
    { href: '/dashboard/todo', label: '할 일', icon: CheckSquare },
    { href: '/dashboard/photos', label: '앨범', icon: ImageIcon },
    { href: '/dashboard/profile', label: '프로필', icon: User },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <Heart fill="currentColor" /> 우리가족
                </div>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(styles.navItem, isActive && styles.active)}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.userProfile}>
                    <div className={styles.avatar}>
                        {user?.avatar && <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%' }} />}
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{user?.name}</div>
                        <div className={styles.userEmail}>{user?.email}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={logout} title="로그아웃">
                        <LogOut size={18} />
                    </Button>
                </div>
            </aside>

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
