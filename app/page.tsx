import Link from 'next/link';
import { Button } from '@/components/ui/button';
import styles from './page.module.css';
import { Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--primary)' }}>
          <Heart size={48} fill="currentColor" />
        </div>

        <h1 className={styles.title}>
          가족을 위한 <br />
          <span className={styles.highlight}>따뜻한 공간</span>
        </h1>

        <p className={styles.subtitle}>
          우리 가족만의 소중한 디지털 홈. 채팅, 일정 공유, 할 일 관리, 그리고 추억 앨범까지. 하나의 예쁜 공간에서 가족과 더 가까워지세요.
        </p>

        <div className={styles.buttonGroup}>
          <Link href="/login">
            <Button>로그인</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary">회원가입</Button>
          </Link>
        </div>

        <img
          src="https://picsum.photos/seed/family_hero/800/500"
          alt="Family App Hero"
          className={styles.heroImage}
        />
      </main>
    </div>
  );
}
