'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import styles from './signup.module.css';

// Separate CSS file for signup specific styles
// For now we might need to create it or reuse login styles with some overrides
// I'll create a new style file `signup.module.css` later, but for now I will use `page.module.css` from login 
// but wait, I can't import from another folder easily unless simple relative path. 
// I'll assume usage of a new css file or inline styles for simplicity? 
// No, I should create `signup.module.css`.

export default function SignupPage() {
    const [step, setStep] = useState<'HOME' | 'CREATE_FAMILY' | 'JOIN_FAMILY'>('HOME');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Common State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Create Family State
    const [familyName, setFamilyName] = useState('');

    // Join Family State (Invite Code)
    const [inviteCode, setInviteCode] = useState('');

    const handleBack = () => setStep('HOME');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign up user
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

            if (authError) throw authError;
            if (!authData.user) throw new Error("No user created");

            // 2. Handle Family Logic
            if (step === 'CREATE_FAMILY') {
                // Create new family
                const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                const { data: newFamily, error: familyError } = await supabase
                    .from('families')
                    .insert({
                        name: familyName,
                        invite_code: code
                    })
                    .select()
                    .single();

                if (familyError) throw familyError;

                // Update profile with family_id
                if (newFamily) {
                    await supabase
                        .from('profiles')
                        .update({ family_id: newFamily.id })
                        .eq('id', authData.user.id);
                }

            } else if (step === 'JOIN_FAMILY') {
                // Find family
                const { data: family, error: findError } = await supabase
                    .from('families')
                    .select('id')
                    .eq('invite_code', inviteCode)
                    .single();

                if (findError || !family) throw new Error("유효하지 않은 초대 코드입니다.");

                // Update profile
                await supabase
                    .from('profiles')
                    .update({ family_id: family.id })
                    .eq('id', authData.user.id);
            }

            alert('회원가입 완료! 로그인해주세요.');
            router.push('/login');

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Signup Error:", error);
            alert('회원가입 실패: ' + (error.message || "알 수 없는 오류"));
        } finally {
            setLoading(false);
        }
    };

    if (step === 'HOME') {
        return (
            <div className={styles.container}>
                <Card className={styles.selectionCard}>
                    <h1 className={styles.title}>환영합니다! 👋</h1>
                    <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>어떻게 시작하시겠어요?</p>

                    <div className={styles.options}>
                        <button className={styles.optionBtn} onClick={() => setStep('CREATE_FAMILY')}>
                            <div className={styles.iconBox} style={{ background: '#e7f5ff', color: '#4dabf7' }}>
                                <Users size={32} />
                            </div>
                            <h3>새로운 가족 만들기</h3>
                            <p>내가 가족 그룹을 만들고<br />초대 코드를 공유합니다.</p>
                        </button>

                        <button className={styles.optionBtn} onClick={() => setStep('JOIN_FAMILY')}>
                            <div className={styles.iconBox} style={{ background: '#fff0f6', color: '#faa2c1' }}>
                                <UserPlus size={32} />
                            </div>
                            <h3>초대 코드로 합류하기</h3>
                            <p>이미 가족이 만든 그룹의<br />초대 코드를 입력합니다.</p>
                        </button>
                    </div>
                </Card>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <Link href="/login" style={{ color: '#71717a', fontSize: '0.9rem' }}>이미 계정이 있으신가요? 로그인</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Card className={styles.formCard}>
                <button onClick={handleBack} className={styles.backBtn}>
                    <ArrowLeft size={20} /> 뒤로
                </button>

                <h1 className={styles.title}>
                    {step === 'CREATE_FAMILY' ? '새 가족 만들기' : '가족 그룹 합류하기'}
                </h1>

                <form onSubmit={handleSignup} className={styles.form}>
                    {step === 'CREATE_FAMILY' && (
                        <div className={styles.inputGroup}>
                            <label>가족 그룹 이름</label>
                            <Input
                                placeholder="예: 행복한 우리집"
                                value={familyName}
                                onChange={e => setFamilyName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {step === 'JOIN_FAMILY' && (
                        <div className={styles.inputGroup}>
                            <label>초대 코드</label>
                            <Input
                                placeholder="6자리 코드 입력"
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className={styles.divider}>관리자 계정 생성</div>

                    <Input
                        label="이름"
                        placeholder="본인 이름"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                    <Input
                        label="이메일"
                        type="email"
                        placeholder="이메일 주소"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="비밀번호"
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" fullWidth disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? '처리 중...' : (step === 'CREATE_FAMILY' ? '가족 생성 및 가입' : '가입 및 합류')}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
