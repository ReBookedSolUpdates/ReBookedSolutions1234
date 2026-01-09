import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg max-w-xs sm:max-w-md text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3",
          description: "group-[.toast]:text-muted-foreground text-xs sm:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs sm:text-sm",
        },
      }}
      richColors
      position="top-right"
      {...props}
    />
  )
}

export { Toaster, toast }
