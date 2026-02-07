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
            <h1 className={styles.title}>가족이 되어보세요</h1>
            <p className={styles.subtitle}>새 계정 만들기</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="이름"
                    placeholder="홍길동"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Input
                    label="이메일"
                    placeholder="example@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label="비밀번호"
                    placeholder="비밀번호 설정"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Input
                    label="가족 코드 (선택)"
                    placeholder="기존 가족에 합류하려면 코드를 입력하세요"
                    type="text"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value)}
                />

                <Button type="submit" fullWidth disabled={loading}>
                    {loading ? '가입 중...' : '회원가입'}
                </Button>
            </form>

            <div className={styles.footer}>
                <p>이미 계정이 있으신가요? <Link href="/login" className={styles.link}>로그인</Link></p>
            </div>
        </Card>
    );
}
