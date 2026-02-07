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
    const [todos, setTodos] = useState<Todo[]>([
        { id: 1, text: 'Buy groceries', completed: false, type: 'shared', assignee: 'Mom' },
        { id: 2, text: 'Walk the dog', completed: true, type: 'shared', assignee: 'Dad' },
        { id: 3, text: 'Finish homework', completed: false, type: 'personal', assignee: 'Me' },
    ]);
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
                <h1 className={styles.title}>Tasks</h1>
            </div>

            <div className={styles.tabs}>
                <div
                    className={clsx(styles.tab, activeTab === 'shared' && styles.activeTab)}
                    onClick={() => setActiveTab('shared')}
                >
                    Family Shared
                </div>
                <div
                    className={clsx(styles.tab, activeTab === 'personal' && styles.activeTab)}
                    onClick={() => setActiveTab('personal')}
                >
                    My Personal
                </div>
            </div>

            <div className={styles.listContainer}>
                {filteredTodos.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                        No tasks in this list.
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
                                Assigned to: {todo.assignee || 'Unassigned'}
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
                    placeholder={`Add a new ${activeTab} task...`}
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    className="flex-1"
                    style={{ width: '100%' }}
                />
                <Button type="submit">
                    <Plus size={18} style={{ marginRight: '8px' }} /> Add
                </Button>
            </form>
        </div>
    );
}
