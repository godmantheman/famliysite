'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import styles from './page.module.css';
import { clsx } from 'clsx';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Mock events
    const [events, setEvents] = useState<{ id: number, date: string, title: string }[]>([]);

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDateClick = (date: Date) => {
        // Simple mock adding event
        const title = prompt('새로운 일정 제목을 입력하세요:');
        if (title) {
            setEvents([...events, { id: Date.now(), date: date.toDateString(), title }]);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{format(currentDate, 'yyyy년 M월')}</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}><ChevronLeft /></Button>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}><ChevronRight /></Button>
                    <Button onClick={() => handleDateClick(new Date())}><Plus size={16} style={{ marginRight: '4px' }} /> 일정 추가</Button>
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
