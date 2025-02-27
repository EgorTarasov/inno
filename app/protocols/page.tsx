"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProtocolForm from "@/components/protocol-form"
import ProtocolPreview from "@/components/protocol-preview"
import type { Protocol } from "@/lib/types"
import { generateRandomId } from "@/lib/utils"

const defaultProtocol: Protocol = {
    id: generateRandomId(),
    dateCreated: new Date().toISOString().split("T")[0],
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
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].substring(0, 5),
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
}

export default function ProtocolsPage() {
    const router = useRouter()
    const [protocol, setProtocol] = useState<Protocol>(defaultProtocol)
    const [activeTab, setActiveTab] = useState("form")

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

