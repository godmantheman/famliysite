'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface Photo {
    id: number;
    url: string;
    title: string;
    date: string;
    author: string;
}


export default function PhotosPage() {
    const { user } = useAuth();
    const [photos, setPhotos] = useState<Photo[]>([]);

    useEffect(() => {
        if (!user?.familyId) return;

        const fetchPhotos = async () => {
            const { data } = await supabase
                .from('photos')
                .select('*')
                .eq('family_id', user.familyId)
                .order('created_at', { ascending: false });

            if (data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setPhotos(data.map((p: any) => ({
                    id: p.id,
                    url: p.url,
                    title: p.title,
                    date: new Date(p.created_at).toISOString().split('T')[0],
                    author: '가족' // In real app, join with profiles
                })));
            }
        };
        fetchPhotos();

        const channel = supabase
            .channel('photos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'photos', filter: `family_id=eq.${user.familyId}` }, () => fetchPhotos())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user?.familyId]);


    const handleUpload = async () => {
        if (!user?.familyId) return;
        const title = prompt('사진 설명을 입력하세요:');
        if (title) {
            // In a real app, we would upload to storage here.
            // For now, we simulate by inserting a random URL
            const randomUrl = `https://picsum.photos/seed/${Date.now()}/400/400`;

            await supabase.from('photos').insert({
                family_id: user.familyId,
                user_id: user.id,
                url: randomUrl,
                title
            });
            // Optimistic update handled by realtime subscription or we could do it here
        }
    };


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>가족 앨범</h1>
                <Button onClick={handleUpload} disabled={!user?.familyId}>
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
