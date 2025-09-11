'use client'

import { useState } from "react"

interface Enrollment {
    id: number
    title: string
    image_url: string
    date: string
    body: string
}

export default function EnrollmentPreview({ initialEnrollment }: { initialEnrollment: Enrollment[] }) {
    const [enrollment] = useState<Enrollment | null>(initialEnrollment[0] || null)

    if (!enrollment) return <p>No enrollment data available.</p>

    return (
        <div className="border p-6 rounded shadow-md flex flex-col gap-6">
            <h2 className="text-2xl font-bold">{enrollment.title}</h2>
            <img 
                src={enrollment.image_url} 
                alt={enrollment.title} 
                className="w-40 h-40 object-cover rounded" 
            />
            <div>
                <p className="text-gray-500 mt-1">{new Date(enrollment.date).toLocaleDateString()}</p>
                <p className="mt-4">{enrollment.body}</p>
            </div>
        </div>
    )
}
