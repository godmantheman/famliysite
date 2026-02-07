import React from 'react';
import styles from './layout.module.css';
import { Heart } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.logo}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Heart fill="currentColor" /> Family App
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
