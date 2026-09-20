import { forwardRef } from 'react';
import styles from './Input.module.css';

// forwardRef so it works with react-hook-form's register().
const Input = forwardRef(function Input({ label, error, id, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <div className={styles.field}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input ref={ref} id={inputId} className={styles.input} {...props} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
});

export default Input;
