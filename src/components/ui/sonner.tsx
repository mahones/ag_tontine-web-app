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
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast shadow-lg border",
          success:
            "!bg-green-50 !text-green-800 !border-green-500 dark:!bg-green-950 dark:!text-green-300 dark:!border-green-700",
          error:
            "!bg-red-50 !text-red-800 !border-red-500 dark:!bg-red-950 dark:!text-red-300 dark:!border-red-700",
          warning:
            "!bg-orange-50 !text-orange-800 !border-orange-500 dark:!bg-orange-950 dark:!text-orange-300 dark:!border-orange-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
