"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Calendar, Camera, FileText, MapPin, Search, User } from "lucide-react"
import type { Alert } from "@/lib/types"
import { formatDate } from "@/lib/utils"

interface AlertsListProps {
  alerts: Alert[]
  compact?: boolean
  showFilters?: boolean
}

export default function AlertsList({ alerts, compact = false, showFilters = false }: AlertsListProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.lawReference.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || alert.status === statusFilter
    const matchesPriority = priorityFilter === "all" || alert.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Высокий</Badge>
      case "medium":
        return <Badge variant="warning">Средний</Badge>
      case "low":
        return <Badge variant="outline">Низкий</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="destructive">Новый</Badge>
      case "in-progress":
        return <Badge variant="warning">В процессе</Badge>
      case "resolved":
        return <Badge variant="success">Решено</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      {showFilters && (
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск оповещений..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="new">Новый</SelectItem>
              <SelectItem value="in-progress">В процессе</SelectItem>
              <SelectItem value="resolved">Решено</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Приоритет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все приоритеты</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="low">Низкий</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {compact ? (
        <div className="space-y-2">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border p-2 hover:bg-muted/50"
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`h-4 w-4 ${alert.priority === "high" ? "text-destructive" : "text-muted-foreground"}`}
                />
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.lawReference}</p>
                </div>
              </div>
              {getStatusBadge(alert.status)}
            </div>
          ))}
        </div>
      ) : (
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
              {filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Оповещения не найдены.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => (
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
                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                    <TableCell>{getPriorityBadge(alert.priority)}</TableCell>
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
                      <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(alert)}>
                        Просмотр
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAlert?.title}</DialogTitle>
            <DialogDescription>ID оповещения: {selectedAlert?.id}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 md:grid-cols-2">
            {selectedAlert?.imageUrl && (
              <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                <img
                  src={selectedAlert.imageUrl || "/placeholder.svg"}
                  alt={selectedAlert.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="mb-1 text-sm font-medium">Описание</h4>
                <p className="text-sm text-muted-foreground">{selectedAlert?.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium">Ссылка на закон</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="mr-1 h-3.5 w-3.5" />
                    {selectedAlert?.lawReference}
                  </div>
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-medium">Местоположение</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    {selectedAlert?.location}
                  </div>
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-medium">Статус</h4>
                  {selectedAlert && getStatusBadge(selectedAlert.status)}
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-medium">Приоритет</h4>
                  {selectedAlert && getPriorityBadge(selectedAlert.priority)}
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-medium">Источник</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {selectedAlert?.source === "Камера" ? (
                      <Camera className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <User className="mr-1 h-3.5 w-3.5" />
                    )}
                    {selectedAlert?.source}
                  </div>
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-medium">Время</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    {selectedAlert && formatDate(selectedAlert.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Отклонить</Button>
            <Button>Принять меры</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

