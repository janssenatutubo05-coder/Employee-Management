import { useForm } from '@inertiajs/react';
import EmployeeForm from '../../Components/EmployeeForm';
import AppLayout from '../../Layouts/AppLayout';

export default function Create({ departments }) {
    const form = useForm({
        first_name: '',
        last_name: '',
        email: '',
        position: '',
        department_id: '',
        status: 'Active',
        password: '',
        role: 'Employee',
    });

    return (
        <AppLayout title="Add Employee">
            <h1 className="mb-6 text-2xl font-semibold text-slate-900">Add Employee</h1>
            <EmployeeForm
                form={form}
                departments={departments}
                offerLogin
                submitLabel="Save employee"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/employees');
                }}
            />
        </AppLayout>
    );
}
