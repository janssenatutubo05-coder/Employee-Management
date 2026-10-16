import { Link } from '@inertiajs/react';
import Button from './Button';
import { SelectInput, TextInput } from './Form';

/** Shared by Employees/Create and Employees/Edit. */
export default function EmployeeForm({ form, departments, onSubmit, submitLabel, offerLogin }) {
    return (
        <form onSubmit={onSubmit} className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid grid-cols-2 gap-4">
                <TextInput label="First name" name="first_name" form={form} />
                <TextInput label="Last name" name="last_name" form={form} />
            </div>
            <TextInput label="Email" name="email" type="email" form={form} />
            <TextInput label="Position" name="position" form={form} />

            <div className="grid grid-cols-2 gap-4">
                <SelectInput label="Department" name="department_id" form={form}>
                    <option value="">No department</option>
                    {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </SelectInput>
                <SelectInput label="Status" name="status" form={form}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </SelectInput>
            </div>

            {offerLogin && (
                <div className="space-y-4 rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                        Optional: give this employee a login by setting a password.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput label="Password" name="password" type="password" form={form} />
                        <SelectInput label="Role" name="role" form={form}>
                            <option value="Employee">Employee</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                        </SelectInput>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
                <Link href="/employees" className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
                    Cancel
                </Link>
                <Button type="submit" disabled={form.processing}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
