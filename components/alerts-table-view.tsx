"use client"

import { Button } from "@/components/ui/button"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table"
import {
    Calendar, Camera, ChevronLeft,
    ChevronRight, FileText, MapPin, User
} from "lucide-react"
import type { Alert } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { AlertBadges } from "./alert-badges"

interface AlertsTableViewProps {
    alerts: Alert[]
    currentPage: number
    totalPages: number
    setCurrentPage: (page: number) => void
    onSelect: (alert: Alert) => void
}

export function AlertsTableView({
    alerts,
    currentPage,
    totalPages,
    setCurrentPage,
    onSelect
}: AlertsTableViewProps) {
    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Оповещение</TableHead>
                            <TableHead>Ссылка на закон</TableHead>
                            <TableHead>Местоположение</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Приоритет</TableHead>
                            <TableHead>Источник</TableHead>
                            <TableHead>Время</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alerts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    Оповещения не найдены.
                                </TableCell>
                            </TableRow>
                        ) : (
                            alerts.map((alert) => (
                                <TableRow key={alert.id}>
                                    <TableCell className="font-medium">{alert.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <FileText className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                            {alert.lawReference}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                            {alert.location}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <AlertBadges.Status status={alert.status} />
                                    </TableCell>
                                    <TableCell>
                                        <AlertBadges.Priority priority={alert.priority} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {alert.source === "Камера" ? (
                                                <Camera className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                            ) : (
                                                <User className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                            {alert.source}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                            {formatDate(alert.timestamp)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => onSelect(alert)}>
                                            Просмотр
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Предыдущая страница</span>
                    </Button>
                    <span className="text-sm">
                        Страница {currentPage} из {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Следующая страница</span>
                    </Button>
                </div>
            )}
        </div>
    )
}