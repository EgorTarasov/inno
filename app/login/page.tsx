"use client"
import LoginForm from "@/components/login-form";


export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-4">
                <LoginForm />
            </div>
        </div>
    );
}