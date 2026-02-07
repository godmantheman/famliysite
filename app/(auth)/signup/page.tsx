'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import styles from '../login/page.module.css';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [familyCode, setFamilyCode] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !name || !password) return;

        setLoading(true);

        // 1. Sign up with Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
                }
            }
        });

        if (authError) {
            alert('회원가입 실패: ' + authError.message);
            setLoading(false);
            return;
        }

        // 2. If family code provided, join family (Optional for now, requires more logic)
        // For this step, we just rely on the trigger to create the profile.
        // Joining a family can be done after signup or we can add logic here if we had an API endpoint or RLS allowed it.
        // Since RLS for profiles allows update by own user, we can update family_id if the user exists.

        if (familyCode && authData.user) {
            // Find family by code
            const { data: families } = await supabase
                .from('families')
                .select('id')
                .eq('invite_code', familyCode)
                .single();

            if (families) {
                await supabase
                    .from('profiles')
                    .update({ family_id: families.id })
                    .eq('id', authData.user.id);
            } else {
                console.warn("Family code not found or invalid");
            }
        } else if (authData.user) {
            // Create a new family if no code? Or just leave it null?
            // Let's create a new family for the user automatically if no code
            const { data: newFamily } = await supabase
                .from('families')
                .insert({
                    name: `${name}네 가족`,
                    invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
                })
                .select()
                .single();

            if (newFamily) {
                await supabase
                    .from('profiles')
                    .update({ family_id: newFamily.id })
                    .eq('id', authData.user.id);
            }
        }

        setLoading(false);
        alert('회원가입이 완료되었습니다! 로그인해주세요.');
        router.push('/login');
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
