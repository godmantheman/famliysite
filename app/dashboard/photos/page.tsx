'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import styles from './page.module.css';

interface Photo {
    id: number;
    url: string;
    title: string;
    date: string;
    author: string;
}

const MOCK_PHOTOS: Photo[] = [];

export default function PhotosPage() {
    const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);

    const handleUpload = () => {
        const title = prompt('사진 설명을 입력하세요:');
        if (title) {
            const newPhoto: Photo = {
                id: Date.now(),
                url: `https://picsum.photos/seed/${Date.now()}/400/400`,
                title,
                date: new Date().toISOString().split('T')[0],
                author: '나'
            };
            setPhotos([newPhoto, ...photos]);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>가족 앨범</h1>
                <Button onClick={handleUpload}>
                    <Upload size={18} style={{ marginRight: '8px' }} /> 사진 업로드
                </Button>
            </div>

            {photos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
                    아직 등록된 사진이 없습니다. 첫 번째 추억을 기록해보세요! 📸
                </div>
            )}

            <div className={styles.grid}>
                {photos.map(photo => (
                    <div key={photo.id} className={styles.photoCard}>
                        <img src={photo.url} alt={photo.title} className={styles.image} />
                        <div className={styles.overlay}>
                            <div className={styles.meta}>{photo.title}</div>
                            <div className={styles.date}>{photo.date} • {photo.author}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
