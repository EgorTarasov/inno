"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export function AuthStatus() {
    const { data: session, status } = useSession();
    const [isSigningOut, setIsSigningOut] = useState(false);

    if (status === "loading") {
        return <div className="animate-pulse bg-gray-200 rounded-full w-8 h-8" />;
    }

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await signOut({ callbackUrl: "/login" });
    };

    if (session && session.user) {
        const initials = session.user.name
            ? session.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : session.user.email[0].toUpperCase();

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild >
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" >
                        <Avatar className="h-8 w-8" >
                            <AvatarFallback>{initials} </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                < DropdownMenuContent align="end" >
                    <div className="flex items-center justify-start gap-2 p-2" >
                        <div className="flex flex-col space-y-1 leading-none" >
                            {
                                session.user.name && (
                                    <p className="font-medium"> {session.user.name} </p>
                                )
                            }
                            < p className="text-sm text-muted-foreground truncate w-[200px]" >
                                {session.user.email}
                            </p>
                            < p className="text-xs text-muted-foreground capitalize" >
                                {session.user.role}
                            </p>
                        </div>
                    </div>
                    < DropdownMenuSeparator />
                    <DropdownMenuItem asChild >
                        <Link href="/profile" >
                            <User className="mr-2 h-4 w-4" />
                            <span>Профиль </span>
                        </Link>
                    </DropdownMenuItem>
                    < DropdownMenuItem
                        className="text-red-600 cursor-pointer"
                        disabled={isSigningOut}
                        onClick={handleSignOut}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{isSigningOut ? "Выход..." : "Выйти"} </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <div className="flex items-center gap-4" >
            <Button asChild variant="outline" size="sm" >
                <Link href="/login" > Вход </Link>
            </Button>
            < Button asChild size="sm" >
                <Link href="/register" > Регистрация </Link>
            </Button>
        </div>
    );
}