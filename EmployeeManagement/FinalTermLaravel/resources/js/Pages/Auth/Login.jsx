import { Link, useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import { TextInput } from '../../Components/Form';
import GuestLayout from '../../Layouts/GuestLayout';

export default function Login({ status }) {
    const form = useForm({ email: '', password: '', remember: false });

    const submit = (e) => {
        e.preventDefault();
        form.post('/login', { onFinish: () => form.reset('password') });
    };

    return (
        <GuestLayout title="Log in">
            {status && (
                <div className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">{status}</div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <TextInput label="Email" name="email" type="email" form={form} autoFocus autoComplete="username" />
                <TextInput
                    label="Password"
                    name="password"
                    type="password"
                    form={form}
                    autoComplete="current-password"
                />

                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        checked={form.data.remember}
                        onChange={(e) => form.setData('remember', e.target.checked)}
                    />
                    Remember me
                </label>

                <Button type="submit" className="w-full" disabled={form.processing}>
                    Log in
                </Button>
            </form>

            <div className="mt-5 flex justify-between text-sm">
                <Link href="/forgot-password" className="text-teal-700 hover:underline">
                    Forgot password?
                </Link>
                <Link href="/register" className="text-teal-700 hover:underline">
                    Create account
                </Link>
            </div>
        </GuestLayout>
    );
}
