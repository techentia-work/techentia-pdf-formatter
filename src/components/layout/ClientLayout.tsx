'use client';

import { Sidebar, Navbar, ToastProvider } from '@/components';
import { useResize } from '@/hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { collapsed, setCollapsed } = useResize();

    const [queryClient] = useState(() =>
        new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 5 * 60 * 1000,
                    gcTime: 30 * 60 * 1000,
                    refetchOnReconnect: true,
                },
            },
        })
    );

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <ToastProvider />
                <div className={`flex flex-col transition-all duration-300 h-screen ${collapsed ? 'ml-16.25' : 'md:ml-64'}`}>
                    <Navbar />
                    <main className="px-4 pt-17.5 bg-red-60 h-full">{children}</main>
                </div>
            </QueryClientProvider>
        </>
    );
}
