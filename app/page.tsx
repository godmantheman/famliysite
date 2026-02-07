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
          Connect Your <br />
          <span className={styles.highlight}>Family Space</span>
        </h1>

        <p className={styles.subtitle}>
          A shared digital home for your family. Chat, schedule, plan, and share moments together in one beautiful private space.
        </p>

        <div className={styles.buttonGroup}>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary">Create Account</Button>
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
