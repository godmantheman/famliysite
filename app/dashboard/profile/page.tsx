'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Save } from 'lucide-react';
import styles from './page.module.css';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [status, setStatus] = useState('Happy to be here! 😊');

    const handleSave = () => {
        // Mock save
        setIsEditing(false);
        alert('Profile updated!');
    };

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.avatarContainer}>
                        <img src={user?.avatar} alt={user?.name} className={styles.avatar} />
                        <button className={styles.editAvatar}>
                            <Camera size={20} />
                        </button>
                    </div>
                    {!isEditing ? (
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{name}</h1>
                            <p style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
                            <p style={{ marginTop: '0.5rem' }}>{status}</p>
                        </div>
                    ) : null}
                </div>

                {isEditing ? (
                    <div className={styles.form}>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Personal Information</h2>
                            <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <Input label="Status Message" value={status} onChange={(e) => setStatus(e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave}><Save size={16} style={{ marginRight: '8px' }} /> Save Changes</Button>
                        </div>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)} fullWidth>Edit Profile</Button>
                )}
            </Card>
        </div>
    );
}
