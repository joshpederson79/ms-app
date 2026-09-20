import { forwardRef } from 'react';
import styles from './Input.module.css';

const Select = forwardRef(function Select({ label, error, id, children, ...props }, ref) {
  const selectId = id || props.name;
  return (
    <div className={styles.field}>
      {label && <label htmlFor={selectId}>{label}</label>}
      <select ref={ref} id={selectId} className={styles.input} {...props}>
        {children}
      </select>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
});

export default Select;
