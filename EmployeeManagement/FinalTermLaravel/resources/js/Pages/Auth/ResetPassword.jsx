import { useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import { TextInput } from '../../Components/Form';
import GuestLayout from '../../Layouts/GuestLayout';

export default function ResetPassword({ token, email }) {
    const form = useForm({ token, email: email ?? '', password: '', password_confirmation: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post('/reset-password', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout title="Reset password" subtitle="Choose a new password.">
            <form onSubmit={submit} className="space-y-4">
                <TextInput label="Email" name="email" type="email" form={form} />
                <TextInput label="New password" name="password" type="password" form={form} autoFocus />
                <TextInput label="Confirm password" name="password_confirmation" type="password" form={form} />
                <Button type="submit" className="w-full" disabled={form.processing}>
                    Reset password
                </Button>
            </form>
        </GuestLayout>
    );
}
