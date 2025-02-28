"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProtocolForm from "@/components/protocol-form"
import ProtocolPreview from "@/components/protocol-preview"
import type { Protocol } from "@/lib/types"
import { generateRandomId } from "@/lib/utils"
import { useSession } from "next-auth/react"

const createDefaultProtocol = (): Protocol => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const timeStr = today.toTimeString().split(" ")[0].substring(0, 5);

    return {
        id: generateRandomId(),
        dateCreated: dateStr,
        placeCreated: "",
        official: {
            fullName: "",
            position: "",
            organization: "",
        },
        offender: {
            fullName: "",
            address: "",
            documentType: "passport",
            documentNumber: "",
        },
        violation: {
            date: dateStr,
            time: timeStr,
            location: "",
            article: "",
            description: "",
            circumstances: "",
            evidence: [],
        },
        witnesses: [],
        offenderExplanation: "",
        signatures: {
            official: false,
            offender: false,
            witnesses: [],
        },
        notes: "",
    };
};

// Create a component that uses search params 
function ProtocolPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session, status } = useSession()
    const [protocol, setProtocol] = useState<Protocol>(createDefaultProtocol())
    const [activeTab, setActiveTab] = useState("form")

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // Get user data from session
            const user = session.user;

            setProtocol(prev => ({
                ...prev,
                official: {
                    fullName: user.name || "",
                    position: user.role || "Инспектор",
                    organization: "Городская инспекция",
                }
            }));
        }
    }, [session, status]);

    useEffect(() => {
        const alertId = searchParams.get('alertId');
        if (!alertId) return;

        const title = searchParams.get('title') || '';
        const description = searchParams.get('description') || '';
        const location = searchParams.get('location') || '';
        const lawReference = searchParams.get('lawReference') || '';
        const timestamp = searchParams.get('timestamp') || '';
        const imageUrl = searchParams.get('imageUrl') || '';

        // Create a date and time string from the timestamp
        let date = new Date().toISOString().split("T")[0];
        let time = new Date().toTimeString().split(" ")[0].substring(0, 5);

        try {
            const eventDate = new Date(timestamp);
            date = eventDate.toISOString().split("T")[0];
            time = eventDate.toTimeString().split(" ")[0].substring(0, 5);
        } catch (e) {
            console.error("Error parsing timestamp:", e);
        }

        // Update protocol with query parameter values
        setProtocol(prev => ({
            ...prev,
            violation: {
                ...prev.violation,
                location: location,
                article: lawReference,
                description: title,
                circumstances: description,
                date: date,
                time: time,
                evidence: imageUrl ?
                    [`Фото с места нарушения: ${imageUrl}`, ...prev.violation.evidence] :
                    prev.violation.evidence
            },
            notes: `Протокол создан на основе оповещения #${alertId}`
        }));
    }, [searchParams]);


    const handleProtocolChange = (updatedProtocol: Protocol) => {
        setProtocol(updatedProtocol)
    }

    const handleSaveProtocol = async () => {
        try {
            const response = await fetch("/api/protocols", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(protocol),
            })

            if (!response.ok) {
                throw new Error("Failed to save protocol")
            }

            // If we have an alertId, update the alert status to in-progress
            const alertId = searchParams.get('alertId');
            if (alertId) {
                await fetch(`/api/alerts/${alertId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: "in-progress" }),
                });
            }

            router.push("/protocols/list")
        } catch (error) {
            console.error("Error saving protocol:", error)
        }
    }

    return (
        <div className="container mx-auto p-4">
            <header className="mb-6">
                <h1 className="text-3xl font-bold">Протокол об административном правонарушении</h1>
                <p className="text-muted-foreground">Создание и оформление протокола</p>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="form">Форма протокола</TabsTrigger>
                    <TabsTrigger value="preview">Предпросмотр PDF</TabsTrigger>
                </TabsList>

                <TabsContent value="form">
                    <Card>
                        <CardHeader>
                            <CardTitle>Заполните данные протокола</CardTitle>
                            <CardDescription>Введите информацию о нарушении, нарушителе и должностном лице</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProtocolForm
                                protocol={protocol}
                                onChange={handleProtocolChange}
                                onPreview={() => setActiveTab("preview")}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="preview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Предпросмотр протокола</CardTitle>
                            <CardDescription>Проверьте правильность заполнения перед сохранением или печатью</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProtocolPreview protocol={protocol} />
                            <div className="mt-6 flex justify-end gap-4">
                                <Button variant="outline" onClick={() => setActiveTab("form")}>
                                    Вернуться к редактированию
                                </Button>
                                <Button onClick={handleSaveProtocol}>Сохранить протокол</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Loading fallback component
function ProtocolsLoading() {
    return <div className="container mx-auto p-4">Загрузка...</div>
}

// Main page component with Suspense
export default function ProtocolsPage() {
    return (
        <Suspense fallback={<ProtocolsLoading />}>
            <ProtocolPageContent />
        </Suspense>
    )
}