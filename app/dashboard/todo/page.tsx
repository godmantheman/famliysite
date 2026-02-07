'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Check, Plus, Trash2 } from 'lucide-react';
import styles from './page.module.css';
import { clsx } from 'clsx';

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

    // Fetch Todos
    useEffect(() => {
        if (!user?.id) return; // Ensure user is loaded

        const fetchTodos = async () => {
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .or(`family_id.eq.${user.familyId},type.eq.personal&user_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching todos:', error);
            }

            if (data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const formattedTodos: Todo[] = data.map((t: any) => ({
                    id: t.id,
                    text: t.text,
                    completed: t.is_completed,
                    type: t.type,
                    assignee: t.assignee_name
                }));
                setTodos(formattedTodos);
            }
        };

        fetchTodos();

        // Subscribe
        const channel = supabase
            .channel('todos')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'todos' },
                () => {
                    // Simplified refresh for now, or handle specific events
                    fetchTodos();
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user?.familyId, user?.id]);


    const filteredTodos = todos.filter(todo => todo.type === activeTab);

    const toggleTodo = async (id: number) => {
        // Optimistic update
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));

        const todoToUpdate = todos.find(t => t.id === id);
        if (!todoToUpdate) return;

        await supabase
            .from('todos')
            .update({ is_completed: !todoToUpdate.completed })
            .eq('id', id);
    };

    const deleteTodo = async (id: number) => {
        // Optimistic update
        setTodos(todos.filter(todo => todo.id !== id));

        await supabase.from('todos').delete().eq('id', id);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim() || !user) return;

        const todoData = {
            family_id: activeTab === 'shared' ? user.familyId : null, // Only assign familyId if shared
            user_id: user.id,
            text: newTodo,
            type: activeTab,
            assignee_name: user.name,
            is_completed: false
        };

        const { data, error } = await supabase
            .from('todos')
            .insert(todoData)
            .select()
            .single();

        if (error) {
            console.error('Error adding todo:', error);
            // Revert optimistic update or show error
            return;
        }

        if (data) {
            const newTodoItem: Todo = {
                id: data.id,
                text: data.text,
                completed: data.is_completed,
                type: data.type,
                assignee: data.assignee_name
            };
            setTodos([newTodoItem, ...todos]);
            setNewTodo('');
        }
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
                {!user?.familyId && activeTab === 'shared' && (
                    <div style={{ textAlign: 'center', padding: '1rem', background: '#fff3cd', borderRadius: '8px', marginBottom: '1rem', color: '#856404' }}>
                        가족 그룹에 합류하면 &apos;가족 공유&apos; 기능을 사용할 수 있습니다.
                    </div>
                )}
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
                    disabled={activeTab === 'shared' && !user?.familyId}
                />
                <Button type="submit" disabled={activeTab === 'shared' && !user?.familyId}>
                    <Plus size={18} style={{ marginRight: '8px' }} /> 추가
                </Button>
            </form>
        </div>
    );
}
