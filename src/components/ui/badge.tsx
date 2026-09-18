import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Étiquette de marque neutre (ex. « Siège »), pas un statut métier.
        default: "bg-primary-subtle text-primary-subtle-foreground [a]:hover:bg-primary-subtle/80",
        // Statut « clôturé / clos » — voir StatusBadge dans le système de design.
        secondary:
          "bg-secondary-subtle text-secondary-subtle-foreground before:bg-secondary before:size-1.5 before:shrink-0 before:rounded-full [a]:hover:bg-secondary-subtle/80",
        // Statut « rejeté / expiré ».
        destructive:
          "bg-danger-subtle text-danger-subtle-foreground before:bg-danger before:size-1.5 before:shrink-0 before:rounded-full [a]:hover:bg-danger-subtle/80",
        // Statut « actif / converti ».
        success:
          "bg-success-subtle text-success-subtle-foreground before:bg-success before:size-1.5 before:shrink-0 before:rounded-full [a]:hover:bg-success-subtle/80",
        // Statut « en attente » — neutre, jamais orange (l'orange est réservé à la marque/CTA).
        warning:
          "bg-neutral-status-subtle text-neutral-status-subtle-foreground before:bg-neutral-status before:size-1.5 before:shrink-0 before:rounded-full [a]:hover:bg-neutral-status-subtle/80",
        // Statut « approuvé » — voix de marque ambre.
        tertiary:
          "bg-tertiary-subtle text-tertiary-subtle-foreground before:bg-tertiary before:size-1.5 before:shrink-0 before:rounded-full [a]:hover:bg-tertiary-subtle/80",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
