/**
 * Form building blocks. Each control reads its value and error from an
 * Inertia `useForm` object, and clears its own error as soon as the user edits
 * the field, which gives instant validation feedback.
 */
const base =
    'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2';

const inputClass = (hasError) =>
    `${base} ${
        hasError
            ? 'border-rose-400 focus:ring-rose-300'
            : 'border-slate-300 focus:border-teal-400 focus:ring-teal-300'
    }`;

export function Field({ label, error, htmlFor, children }) {
    return (
        <div>
            {label && (
                <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            {children}
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
    );
}

function useChange(form, name) {
    return (e) => {
        form.setData(name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
        if (form.errors[name]) form.clearErrors(name);
    };
}

export function TextInput({ label, name, form, type = 'text', ...rest }) {
    const onChange = useChange(form, name);

    return (
        <Field label={label} error={form.errors[name]} htmlFor={name}>
            <input
                id={name}
                name={name}
                type={type}
                value={form.data[name] ?? ''}
                onChange={onChange}
                className={inputClass(!!form.errors[name])}
                {...rest}
            />
        </Field>
    );
}

export function SelectInput({ label, name, form, children, ...rest }) {
    const onChange = useChange(form, name);

    return (
        <Field label={label} error={form.errors[name]} htmlFor={name}>
            <select
                id={name}
                name={name}
                value={form.data[name] ?? ''}
                onChange={onChange}
                className={inputClass(!!form.errors[name])}
                {...rest}
            >
                {children}
            </select>
        </Field>
    );
}

export function TextAreaInput({ label, name, form, rows = 3, ...rest }) {
    const onChange = useChange(form, name);

    return (
        <Field label={label} error={form.errors[name]} htmlFor={name}>
            <textarea
                id={name}
                name={name}
                rows={rows}
                value={form.data[name] ?? ''}
                onChange={onChange}
                className={inputClass(!!form.errors[name])}
                {...rest}
            />
        </Field>
    );
}
