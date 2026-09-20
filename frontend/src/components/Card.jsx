import styles from './Card.module.css';

export default function Card({ as: Tag = 'div', interactive = false, className = '', ...props }) {
  return <Tag className={`${styles.card} ${interactive ? styles.interactive : ''} ${className}`} {...props} />;
}
