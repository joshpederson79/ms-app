import { forwardRef } from 'react';
import styles from './Input.module.css';

const Textarea = forwardRef(function Textarea({ label, error, hint, mono = false, id, ...props }, ref) {
  const areaId = id || props.name;
  return (
    <div className={styles.field}>
      {label && <label htmlFor={areaId}>{label}</label>}
      <textarea
        ref={ref}
        id={areaId}
        className={`${styles.input} ${styles.textarea} ${mono ? styles.mono : ''}`}
        {...props}
      />
      {hint && <span className="muted">{hint}</span>}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
});

export default Textarea;
