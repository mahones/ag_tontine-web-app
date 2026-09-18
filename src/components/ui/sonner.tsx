"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--surface-overlay)",
          "--normal-text": "var(--ink)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-md)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast shadow-md border",
          success: "!bg-success-subtle !text-success-subtle-foreground !border-success",
          error: "!bg-danger-subtle !text-danger-subtle-foreground !border-danger",
          // Avertissement = orange de marque (primary), jamais l'ambre : l'ambre est
          // réservé au badge de statut « Approuvé ».
          warning: "!bg-warning-subtle !text-warning-subtle-foreground !border-warning",
          info: "!bg-info-subtle !text-info-subtle-foreground !border-info",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
