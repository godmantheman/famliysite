'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import styles from '../login/page.module.css'; // Reuse login styles

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [familyCode, setFamilyCode] = useState('');
    const { signup } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !name || !password) return;

        setLoading(true);
        await signup(name, email);
        setLoading(false);
        router.push('/dashboard');
    };

    return (
        <Card className={styles.card}>
            <h1 className={styles.title}>Join Family</h1>
            <p className={styles.subtitle}>Create your account</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="Full Name"
                    placeholder="John Doe"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Input
                    label="Email"
                    placeholder="john@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label="Password"
                    placeholder="Create a password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Input
                    label="Family Code (Optional)"
                    placeholder="Enter code to join existing family"
                    type="text"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value)}
                />

                <Button type="submit" fullWidth disabled={loading}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
            </form>

            <div className={styles.footer}>
                <p>Already have an account? <Link href="/login" className={styles.link}>Sign in</Link></p>
            </div>
        </Card>
    );
}
