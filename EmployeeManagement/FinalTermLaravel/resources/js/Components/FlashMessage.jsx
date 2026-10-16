import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(true);
    const message = flash?.success || flash?.error;

    useEffect(() => {
        setVisible(true);
        if (!message) return;
        const timer = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!message || !visible) return null;

    const tone = flash.error
        ? 'border-rose-100 bg-rose-50 text-rose-700'
        : 'border-teal-100 bg-teal-50 text-teal-700';

    return (
        <div role="status" className={`mb-4 rounded-lg border px-4 py-2.5 text-sm ${tone}`}>
            {message}
        </div>
    );
}
