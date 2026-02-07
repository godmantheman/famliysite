'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return; // Updated condition

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error("Login Supabase Error:", error);
                alert('로그인 실패: ' + error.message);
                setLoading(false); // Ensure loading is stopped
                return;
            }

            if (data?.user) {
                // Check if user has a profile/family
                /* 
                   Ideally we check profile here, but for now let's just redirect.
                   If we encounter issues with redirects, we can use window.location.href or router.replace
                */
                console.log("Login success:", data.user);
                router.push('/dashboard');
            }
        } catch (e) {
            console.error("Login Unexpected Error:", e);
            alert('로그인 중 알 수 없는 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    return (
        <Card className={styles.card}>
            <h1 className={styles.title}>반가워요! 👋</h1>
            <p className={styles.subtitle}>가족 공간에 로그인하세요</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="이메일"
                    placeholder="이메일을 입력하세요"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label="비밀번호"
                    placeholder="비밀번호를 입력하세요"
                    type="password"
                    value={password} // Added value prop
                    onChange={(e) => setPassword(e.target.value)} // Added onChange handler
                    required
                />

                <Button type="submit" fullWidth disabled={loading}>
                    {loading ? '로그인 중...' : '로그인'}
                </Button>
            </form>

            <div className={styles.footer}>
                <p>계정이 없으신가요? <Link href="/signup" className={styles.link}>회원가입</Link></p>
            </div>
        </Card>
    );
}
