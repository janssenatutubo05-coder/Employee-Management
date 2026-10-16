import { Link, useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import { TextInput } from '../../Components/Form';
import GuestLayout from '../../Layouts/GuestLayout';

export default function Register() {
    const form = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/register', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout title="Register" subtitle="Create an employee account.">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <TextInput label="First name" name="first_name" form={form} autoFocus />
                    <TextInput label="Last name" name="last_name" form={form} />
                </div>
                <TextInput label="Email" name="email" type="email" form={form} autoComplete="username" />
                <TextInput label="Password" name="password" type="password" form={form} autoComplete="new-password" />
                <TextInput
                    label="Confirm password"
                    name="password_confirmation"
                    type="password"
                    form={form}
                    autoComplete="new-password"
                />

                <Button type="submit" className="w-full" disabled={form.processing}>
                    Register
                </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
                Already registered?{' '}
                <Link href="/login" className="text-teal-700 hover:underline">
                    Log in
                </Link>
            </p>
        </GuestLayout>
    );
}
