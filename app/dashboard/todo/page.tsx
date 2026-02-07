'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Plus, Trash2 } from 'lucide-react';
import styles from './page.module.css';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/auth-context';

interface Todo {
    id: number;
    text: string;
    completed: boolean;
    type: 'shared' | 'personal';
    assignee?: string;
}

export default function TodoPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'shared' | 'personal'>('shared');
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');

    const filteredTodos = todos.filter(todo => todo.type === activeTab);

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        const todo: Todo = {
            id: Date.now(),
            text: newTodo,
            completed: false,
            type: activeTab,
            assignee: user?.name,
        };

        setTodos([...todos, todo]);
        setNewTodo('');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>할 일 목록</h1>
            </div>

            <div className={styles.tabs}>
                <div
                    className={clsx(styles.tab, activeTab === 'shared' && styles.activeTab)}
                    onClick={() => setActiveTab('shared')}
                >
                    가족 공유
                </div>
                <div
                    className={clsx(styles.tab, activeTab === 'personal' && styles.activeTab)}
                    onClick={() => setActiveTab('personal')}
                >
                    개인
                </div>
            </div>

            <div className={styles.listContainer}>
                {filteredTodos.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                        등록된 할 일이 없습니다.
                    </div>
                )}
                {filteredTodos.map(todo => (
                    <div key={todo.id} className={clsx(styles.todoItem, todo.completed && styles.completed)}>
                        <div
                            className={clsx(styles.checkbox, todo.completed && styles.checked)}
                            onClick={() => toggleTodo(todo.id)}
                        >
                            {todo.completed && <Check size={16} color="white" />}
                        </div>

                        <div className={styles.itemContent}>
                            <div className={styles.itemText} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                                {todo.text}
                            </div>
                            <div className={styles.itemMeta}>
                                담당자: {todo.assignee || '미지정'}
                            </div>
                        </div>

                        <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)}>
                            <Trash2 size={18} style={{ color: '#ef4444' }} />
                        </Button>
                    </div>
                ))}
            </div>

            <form onSubmit={handleAdd} className={styles.addForm}>
                <Input
                    placeholder={`새로운 ${activeTab === 'shared' ? '공유' : '개인'} 할 일을 입력하세요...`}
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    className="flex-1"
                    style={{ width: '100%' }}
                />
                <Button type="submit">
                    <Plus size={18} style={{ marginRight: '8px' }} /> 추가
                </Button>
            </form>
        </div>
    );
}
