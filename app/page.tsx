'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Calendar, MessageCircle, CheckSquare } from 'lucide-react';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>우리 가족만의 프라이빗 공간</div>
          <h1 className={styles.title}>
            가족을 더 가깝게,<br />
            일상을 더 특별하게
          </h1>
          <p className={styles.description}>
            바쁜 일상 속에서도 가족의 소중한 순간을 놓치지 마세요.<br />
            채팅, 앨범, 캘린더를 한 곳에서 관리하는 가장 쉬운 방법입니다.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/login">
              <Button size="lg" className={styles.primaryBtn}>
                시작하기 <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className={styles.secondaryBtn}>
                회원가입
              </Button>
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          {/* Placeholder for hero image - implementing purely with CSS for now */}
          <div className={styles.floatingCard} style={{ top: '10%', right: '10%', animationDelay: '0s' }}>
            <Heart size={32} color="#ff6b6b" fill="#ff6b6b" />
            <span>사랑하는 가족</span>
          </div>
          <div className={styles.floatingCard} style={{ bottom: '20%', left: '5%', animationDelay: '1s' }}>
            <Calendar size={32} color="#339af0" />
            <span>가족 여행 일정</span>
          </div>
          <div className={styles.floatingCard} style={{ top: '40%', right: '-5%', animationDelay: '2s' }}>
            <MessageCircle size={32} color="#51cf66" />
            <span>오늘 저녁 뭐 먹어?</span>
          </div>
          <div className={styles.circleBg} />
        </div>
      </section>

      {/* Feature Section */}
      <section className={styles.features}>
        <div className={styles.featureItem}>
          <div className={styles.iconBox} style={{ background: '#fff0f6', color: '#f783ac' }}>
            <Heart size={32} />
          </div>
          <h3>프라이빗 소셜</h3>
          <p>초대된 가족만 볼 수 있는 안전한 공간에서 사진과 이야기를 나누세요.</p>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.iconBox} style={{ background: '#e7f5ff', color: '#4dabf7' }}>
            <Calendar size={32} />
          </div>
          <h3>공유 캘린더</h3>
          <p>가족 행사, 생일, 제사 등 중요한 일정을 놓치지 않고 함께 관리해요.</p>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.iconBox} style={{ background: '#ebfbee', color: '#69db7c' }}>
            <CheckSquare size={32} />
          </div>
          <h3>할 일 관리</h3>
          <p>장보기 목록부터 집안일 분담까지, 체크리스트로 스마트하게 해결하세요.</p>
        </div>
      </section>
    </div>
  );
}
