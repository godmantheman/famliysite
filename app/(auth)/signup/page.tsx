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
            // Pre-validation for Join Family
            if (step === 'JOIN_FAMILY') {
                const codeUpper = inviteCode.trim().toUpperCase();
                const { data: family, error: findError } = await supabase
                    .from('families')
                    .select('id')
                    .eq('invite_code', codeUpper)
                    .maybeSingle();

                if (findError) throw findError;
                if (!family) throw new Error("유효하지 않은 초대 코드입니다. 다시 확인해주세요.");
            }

            // Generate code early if creating family
            const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const finalInviteCode = step === 'CREATE_FAMILY' ? generatedCode : inviteCode.trim().toUpperCase();

            // 1. Auth Signup with all data in metadata
            // The database trigger 'handle_new_user' will handle family creation/joining and profile setup
            console.log("Signup: Reaching out to Supabase Auth (Atomic Trigger Flow)...");
            const response = await withTimeout(
                (async () => {
                    return await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: name,
                                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                                signup_type: step,
                                family_name: step === 'CREATE_FAMILY' ? familyName : null,
                                invite_code: finalInviteCode
                            }
                        }
                    });
                })(),
                "Supabase SignUp"
            );

            if (response.error) throw response.error;
            const user = response.data.user;
            if (!user) throw new Error("계정 생성에 실패했습니다 (User data null)");

            console.log("Signup: Auth user created successfully. Atomic trigger handled profiling.");

            alert('회원가입이 성공적으로 완료되었습니다! 이메일 인증이 필요한 경우 메일을 확인해 주세요.');
            router.push('/login');

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Signup Catch Block:", error);
            // Translate common Supabase error messages
            let msg = error.message || "알 수 없는 오류";
            if (msg.includes("row-level security")) {
                msg = "보안 정책 문제로 요청이 거부되었습니다. 데이터베이스 설정을 다시 확인해주세요.";
            } else if (msg.includes("duplicate key")) {
                msg = "이미 존재하는 초대 코드입니다. 다른 이름으로 시도해보세요.";
            }
            alert('회원가입 과정 중 에러가 발생했습니다: ' + msg);
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
