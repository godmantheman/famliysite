import React from 'react';
import styles from './input.module.css';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, id, ...props }, ref) => {
        return (
            <div className={styles.container}>
                {label && <label htmlFor={id} className={styles.label}>{label}</label>}
                <input
                    id={id}
                    ref={ref}
                    className={clsx(styles.input, className)}
                    {...props}
                />
            </div>
        );
    }
);
Input.displayName = 'Input';
