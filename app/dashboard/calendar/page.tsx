'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import styles from './page.module.css';
import { clsx } from 'clsx';

export default function CalendarPage() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Events
    const [events, setEvents] = useState<{ id: number, date: string, title: string }[]>([]);

    useEffect(() => {
        if (!user?.familyId) return;

        const fetchEvents = async () => {
            const { data } = await supabase
                .from('events')
                .select('*')
                .eq('family_id', user.familyId);

            if (data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setEvents(data.map((e: any) => ({
                    id: e.id,
                    date: new Date(e.event_date).toDateString(),
                    title: e.title
                })));
            }
        };
        fetchEvents();

        const channel = supabase
            .channel('calendar')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `family_id=eq.${user.familyId}` }, () => fetchEvents())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user?.familyId]);

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDateClick = async (date: Date) => {
        const title = prompt('새로운 일정 제목을 입력하세요:');
        if (title && user?.familyId) {
            // Optimistic
            const newEvent = { id: Date.now(), date: date.toDateString(), title };
            setEvents([...events, newEvent]);

            await supabase.from('events').insert({
                family_id: user.familyId,
                user_id: user.id,
                title,
                event_date: date.toISOString(),
            });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{format(currentDate, 'yyyy년 M월')}</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}><ChevronLeft /></Button>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}><ChevronRight /></Button>
                    <Button onClick={() => handleDateClick(new Date())} disabled={!user?.familyId}><Plus size={16} style={{ marginRight: '4px' }} /> 일정 추가</Button>
                </div>
            </div>

            <div className={styles.calendarGrid}>
                {weekDays.map((day) => (
                    <div key={day} className={styles.dayHeader}>{day}</div>
                ))}

                {calendarDays.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const dayEvents = events.filter(e => e.date === day.toDateString());

                    return (
                        <div
                            key={idx}
                            className={clsx(styles.dayCell, isCurrentMonth ? styles.currentMonth : styles.otherMonth)}
                            onClick={() => handleDateClick(day)}
                        >
                            <div className={clsx(styles.dateNumber, isToday(day) && styles.today)}>
                                {format(day, 'd')}
                            </div>

                            {dayEvents.map(event => (
                                <div key={event.id} className={styles.event}>
                                    {event.title}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
