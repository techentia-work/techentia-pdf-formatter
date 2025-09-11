"use client";
import { Loader } from '@/components';
import { useForm } from '@/hooks';
import React from 'react'

export default function Page() {
    const { forms, formsError, isFormsLoading } = useForm();

    if (isFormsLoading) {
        return <Loader />
    }

    if (formsError) {
        return (
            <div className='h-full flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-xl font-semibold text-red-600 mb-2'>Error Loading Forms</h2>
                    <p className='text-gray-600'>{formsError.message}</p>
                </div>
            </div>
        )
    }

    return (
        <div className='h-full p-8'>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold text-gray-900'>Forms Dashboard</h1>
                <p className='text-gray-600'>Total forms: {forms?.length || 0}</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {forms?.map((form) => (
                    <div key={form.id} className='bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'>
                        <h3 className='font-semibold text-lg text-gray-900 mb-2'>{form.name}</h3>
                        {form.description && (
                            <p className='text-gray-600 text-sm mb-3'>{form.description}</p>
                        )}
                        <div className='flex items-center justify-between text-sm text-gray-500'>
                            <span>Fields: {form.fields?.length || 0}</span>
                            <span>ID: {form.id}</span>
                        </div>
                        {form.pdfUrl && (
                            <div className='mt-3'>
                                <a 
                                    href={form.pdfUrl} 
                                    target='_blank' 
                                    rel='noopener noreferrer'
                                    className='text-blue-600 hover:text-blue-800 text-sm underline'
                                >
                                    View PDF
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {forms?.length === 0 && (
                <div className='text-center py-12'>
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>No forms found</h3>
                    <p className='text-gray-500'>Create your first form to get started.</p>
                </div>
            )}
        </div>
    )
}