import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Button from '../../Components/Button';
import { TextInput } from '../../Components/Form';
import Modal from '../../Components/Modal';
import AppLayout from '../../Layouts/AppLayout';

export default function Index({ departments }) {
    const createForm = useForm({ name: '', description: '' });
    const editForm = useForm({ name: '', description: '' });
    const [editing, setEditing] = useState(null);

    const add = (e) => {
        e.preventDefault();
        createForm.post('/departments', { preserveScroll: true, onSuccess: () => createForm.reset() });
    };

    const startEdit = (department) => {
        editForm.setData({ name: department.name, description: department.description ?? '' });
        editForm.clearErrors();
        setEditing(department);
    };

    const saveEdit = (e) => {
        e.preventDefault();
        editForm.put(`/departments/${editing.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    };

    const remove = (department) => {
        if (confirm(`Delete ${department.name}? Its employees will be kept without a department.`)) {
            router.delete(`/departments/${department.id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout title="Departments">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Departments</h1>
                <p className="text-sm text-slate-500">Organize employees into departments.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <form onSubmit={add} className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5">
                    <h2 className="text-sm font-semibold text-slate-900">Add department</h2>
                    <TextInput label="Name" name="name" form={createForm} />
                    <TextInput label="Description" name="description" form={createForm} />
                    <Button type="submit" className="w-full" disabled={createForm.processing}>
                        Add department
                    </Button>
                </form>

                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white lg:col-span-2">
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr className="text-left text-xs uppercase text-slate-500">
                                <th className="px-5 py-3">Name</th>
                                <th className="px-5 py-3">Description</th>
                                <th className="px-5 py-3">Employees</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {departments.map((d) => (
                                <tr key={d.id}>
                                    <td className="px-5 py-3 font-medium text-slate-800">{d.name}</td>
                                    <td className="px-5 py-3 text-slate-600">{d.description ?? '—'}</td>
                                    <td className="px-5 py-3 text-slate-600">{d.employees_count}</td>
                                    <td className="space-x-3 px-5 py-3 text-right">
                                        <button onClick={() => startEdit(d)} className="text-xs font-medium text-teal-700 hover:underline">
                                            Edit
                                        </button>
                                        <button onClick={() => remove(d)} className="text-xs font-medium text-rose-600 hover:underline">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {departments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                                        No departments yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit department">
                <form onSubmit={saveEdit} className="space-y-4">
                    <TextInput label="Name" name="name" form={editForm} />
                    <TextInput label="Description" name="description" form={editForm} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setEditing(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={editForm.processing}>
                            Save
                        </Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
