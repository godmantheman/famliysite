import React from 'react';
import styles from './card.module.css';
import { clsx } from 'clsx';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(styles.card, className)}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';
