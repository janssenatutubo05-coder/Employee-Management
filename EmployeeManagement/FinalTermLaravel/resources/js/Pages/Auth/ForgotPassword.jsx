import { Link, useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import { TextInput } from '../../Components/Form';
import GuestLayout from '../../Layouts/GuestLayout';

export default function ForgotPassword({ status }) {
    const form = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post('/forgot-password');
    };

    return (
        <GuestLayout title="Forgot password" subtitle="Enter your email and we'll send you a reset link.">
            {status && (
                <div className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">{status}</div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <TextInput label="Email" name="email" type="email" form={form} autoFocus />
                <Button type="submit" className="w-full" disabled={form.processing}>
                    Email reset link
                </Button>
            </form>

            <p className="mt-5 text-center text-sm">
                <Link href="/login" className="text-teal-700 hover:underline">
                    Back to log in
                </Link>
            </p>
        </GuestLayout>
    );
}
