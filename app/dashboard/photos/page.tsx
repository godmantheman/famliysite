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

const MOCK_PHOTOS: Photo[] = [
    { id: 1, url: 'https://picsum.photos/seed/family1/400/400', title: 'Summer Vacation', date: '2023-08-15', author: 'Dad' },
    { id: 2, url: 'https://picsum.photos/seed/family2/400/400', title: 'Birthday Party', date: '2023-11-20', author: 'Mom' },
    { id: 3, url: 'https://picsum.photos/seed/family3/400/400', title: 'Christmas', date: '2023-12-25', author: 'Me' },
    { id: 4, url: 'https://picsum.photos/seed/family4/400/400', title: 'Picnic', date: '2024-04-10', author: 'Mom' },
    { id: 5, url: 'https://picsum.photos/seed/family5/400/400', title: 'New Puppy', date: '2024-05-01', author: 'Brother' },
];

export default function PhotosPage() {
    const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);

    const handleUpload = () => {
        const title = prompt('Enter photo description:');
        if (title) {
            const newPhoto: Photo = {
                id: Date.now(),
                url: `https://picsum.photos/seed/${Date.now()}/400/400`,
                title,
                date: new Date().toISOString().split('T')[0],
                author: 'Me'
            };
            setPhotos([newPhoto, ...photos]);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Family Album</h1>
                <Button onClick={handleUpload}>
                    <Upload size={18} style={{ marginRight: '8px' }} /> Upload Photo
                </Button>
            </div>

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
