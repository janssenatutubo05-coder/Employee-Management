import { useForm } from '@inertiajs/react';
import EmployeeForm from '../../Components/EmployeeForm';
import AppLayout from '../../Layouts/AppLayout';

export default function Edit({ employee, departments }) {
    const form = useForm({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        position: employee.position,
        department_id: employee.department_id ?? '',
        status: employee.status,
        password: '',
        role: 'Employee',
    });

    return (
        <AppLayout title="Edit Employee">
            <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit Employee</h1>
            <EmployeeForm
                form={form}
                departments={departments}
                offerLogin={!employee.has_account}
                submitLabel="Update employee"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.put(`/employees/${employee.id}`);
                }}
            />
        </AppLayout>
    );
}
