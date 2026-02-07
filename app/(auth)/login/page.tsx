'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import styles from './page.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const { login } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        await login(email);
        setLoading(false);
        router.push('/dashboard');
    };

    return (
        <Card className={styles.card}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to your family space</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label="Password"
                    placeholder="Enter custom password"
                    type="password"
                    required
                />

                <Button type="submit" fullWidth disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>

            <div className={styles.footer}>
                <p>Don't have an account? <Link href="/signup" className={styles.link}>Sign up</Link></p>
            </div>
        </Card>
    );
}
