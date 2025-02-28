"use client"

import { useState } from "react"
import { AlertFilters } from "./alert-filters"
import { AlertsCompactView } from "./alerts-compact-view"
import { AlertsTableView } from "./alerts-table-view"
import { AlertDetailsDialog } from "./alert-details-dialog"
import type { Alert } from "@/lib/types"
import { useAlerts } from "@/hooks/use-alerts"

interface AlertsListProps {
  alerts: Alert[]
  compact?: boolean
  showFilters?: boolean
}

export default function AlertsList({ alerts, compact = false, showFilters = false }: AlertsListProps) {
  const { refreshAlerts } = useAlerts(); // Access to global alerts context
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  const paginatedAlerts = compact
    ? filteredAlerts
    : filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <>
      {showFilters && (
        <AlertFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />
      )}

      {compact ? (
        <AlertsCompactView
          alerts={filteredAlerts}
          onSelect={setSelectedAlert}
        />
      ) : (
        <AlertsTableView
          alerts={paginatedAlerts}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          onSelect={setSelectedAlert}
        />
      )}

      <AlertDetailsDialog
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />
    </>
  )
}