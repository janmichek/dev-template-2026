import { type ChangeEvent, type ReactNode, useId } from 'react';

type ClearableSelectProps = {
  label: string;
  placeholder: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  children: ReactNode;
};

export function ClearableSelect({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  children,
}: ClearableSelectProps) {
  const id = useId();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    onChange(next === '' ? undefined : next);
  }

  return (
    <div className="select-row">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="select"
        aria-label={label}
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
      {value !== undefined && (
        <button
          type="button"
          className="button"
          disabled={disabled}
          onClick={() => onChange(undefined)}
        >
          Clear
        </button>
      )}
    </div>
  );
}
