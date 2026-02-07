'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import { withTimeout } from '@/lib/timeout';
import styles from './signup.module.css';

export default function SignupPage() {
    const [step, setStep] = useState<'HOME' | 'CREATE_FAMILY' | 'JOIN_FAMILY'>('HOME');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [familyName, setFamilyName] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const handleBack = () => setStep('HOME');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Signup: handleSubmit initiated");
        setLoading(true);

        try {
            // 1. Auth Signup
            console.log("Signup: Reaching out to Supabase Auth...");
            const response = await withTimeout(
                (async () => {
                    return await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: name,
                                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
                            }
                        }
                    });
                })(),
                "Supabase SignUp"
            );

            if (response.error) throw response.error;
            const user = response.data.user;
            if (!user) throw new Error("계정 생성에 실패했습니다 (User data null)");
            console.log("Signup: Auth user created:", user.id);

            // Wait a bit for the profile trigger to run (optional but helpful for immediate fetch)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 2. Family Logic
            if (step === 'CREATE_FAMILY') {
                console.log("Signup: Creating new family:", familyName);
                const code = Math.random().toString(36).substring(2, 8).toUpperCase();

                const familyResponse = await withTimeout(
                    (async () => {
                        return await supabase
                            .from('families')
                            .insert({ name: familyName, invite_code: code })
                            .select()
                            .maybeSingle();
                    })(),
                    "Creating Family"
                );

                if (familyResponse.error) throw familyResponse.error;
                const newFamily = familyResponse.data;
                if (!newFamily) throw new Error("가족 그룹 생성 결과가 없습니다.");
                console.log("Signup: Family created:", newFamily.id, "Code:", code);

                console.log("Signup: Upserting user profile with family_id...");
                // Use UPSERT instead of UPDATE to ensure the record exists
                const profileResponse = await withTimeout(
                    (async () => {
                        return await supabase
                            .from('profiles')
                            .upsert({
                                id: user.id,
                                family_id: newFamily.id,
                                full_name: name,
                                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
                            });
                    })(),
                    "Upserting Profile (Family ID)"
                );
                if (profileResponse.error) {
                    console.error("Signup: Profile upsert failed.", profileResponse.error);
                    throw new Error("프로필 연동 중 오류가 발생했습니다: " + profileResponse.error.message);
                }

            } else if (step === 'JOIN_FAMILY') {
                console.log("Signup: Joining existing family with code:", inviteCode);
                const codeUpper = inviteCode.trim().toUpperCase();
                const findResponse = await withTimeout(
                    (async () => {
                        return await supabase
                            .from('families')
                            .select('id')
                            .eq('invite_code', codeUpper)
                            .maybeSingle();
                    })(),
                    "Finding Family"
                );

                if (findResponse.error) throw findResponse.error;
                const family = findResponse.data;
                if (!family) throw new Error("유효하지 않은 초대 코드입니다. 다시 확인해주세요.");
                console.log("Signup: Family found:", family.id);

                console.log("Signup: Upserting user profile with joined family_id...");
                const profileUpdateResponse = await withTimeout(
                    (async () => {
                        return await supabase
                            .from('profiles')
                            .upsert({
                                id: user.id,
                                family_id: family.id,
                                full_name: name,
                                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
                            });
                    })(),
                    "Upserting Profile (Join Family)"
                );
                if (profileUpdateResponse.error) {
                    console.error("Signup: Profile join upsert failed.", profileUpdateResponse.error);
                    throw new Error("가족 그룹 참여 중 오류가 발생했습니다: " + profileUpdateResponse.error.message);
                }
            }

            console.log("Signup: All operations finished successfully!");
            alert('회원가입이 완료되었습니다! 이제 로그인하여 가족 공간을 확인해보세요.');
            router.push('/login');

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Signup Catch Block:", error);
            alert('회원가입 과정 중 에러가 발생했습니다: ' + (error.message || "알 수 없는 오류"));
        } finally {
            console.log("Signup: Loading state cleared");
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

                    <div className={styles.divider}>사용자 정보</div>

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
                        minLength={6}
                    />

                    <Button type="submit" fullWidth disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? '처리 중...' : (step === 'CREATE_FAMILY' ? '가족 생성 및 가입' : '가입 및 합류')}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
