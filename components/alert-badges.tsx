import { Badge } from "@/components/ui/badge"

export const AlertBadges = {
    Priority: ({ priority }: { priority: string }) => {
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
    },

    Status: ({ status }: { status: string }) => {
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
}