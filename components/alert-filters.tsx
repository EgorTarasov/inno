"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface AlertFiltersProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    statusFilter: string
    setStatusFilter: (status: string) => void
    priorityFilter: string
    setPriorityFilter: (priority: string) => void
}

export function AlertFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter
}: AlertFiltersProps) {
    return (
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
    )
}