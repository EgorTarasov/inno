"use client"

import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Camera, FileText, MapPin, User } from "lucide-react"
import type { Alert } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { AlertBadges } from "./alert-badges"
import Link from "next/link"

interface AlertDetailsDialogProps {
    alert: Alert | null
    onClose: () => void
}

export function AlertDetailsDialog({ alert, onClose }: AlertDetailsDialogProps) {
    // Create the query parameters
    const createProtocolLink = () => {
        if (!alert) return "/protocols";

        const params = new URLSearchParams({
            alertId: alert.id,
            title: alert.title,
            description: alert.description,
            location: alert.location,
            lawReference: alert.lawReference,
            priority: alert.priority,
            timestamp: alert.timestamp,
            imageUrl: alert.imageUrl || ''
        });

        return `/protocols?${params.toString()}`;
    };

    return (
        <Dialog open={!!alert} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{alert?.title}</DialogTitle>
                    <DialogDescription>ID оповещения: {alert?.id}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 md:grid-cols-2">
                    {alert?.imageUrl && (
                        <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                            <img
                                src={alert.imageUrl || "/placeholder.svg"}
                                alt={alert.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <h4 className="mb-1 text-sm font-medium">Описание</h4>
                            <p className="text-sm text-muted-foreground">{alert?.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="mb-1 text-sm font-medium">Ссылка на закон</h4>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <FileText className="mr-1 h-3.5 w-3.5" />
                                    {alert?.lawReference}
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-1 text-sm font-medium">Местоположение</h4>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-1 h-3.5 w-3.5" />
                                    {alert?.location}
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-1 text-sm font-medium">Статус</h4>
                                {alert && <AlertBadges.Status status={alert.status} />}
                            </div>

                            <div>
                                <h4 className="mb-1 text-sm font-medium">Приоритет</h4>
                                {alert && <AlertBadges.Priority priority={alert.priority} />}
                            </div>

                            <div>
                                <h4 className="mb-1 text-sm font-medium">Источник</h4>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    {alert?.source === "Камера" ? (
                                        <Camera className="mr-1 h-3.5 w-3.5" />
                                    ) : (
                                        <User className="mr-1 h-3.5 w-3.5" />
                                    )}
                                    {alert?.source}
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-1 text-sm font-medium">Время</h4>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-1 h-3.5 w-3.5" />
                                    {alert && formatDate(alert.timestamp)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Закрыть</Button>
                    <Link href={createProtocolLink()}>
                        <Button>
                            Принять меры
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    )
}