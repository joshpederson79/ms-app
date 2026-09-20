import styles from './Button.module.css';

export default function Button({ variant = 'primary', className = '', ...props }) {
  return <button className={`${styles.button} ${styles[variant]} ${className}`} {...props} />;
}
