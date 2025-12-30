import { useTheme } from '@/lib/contexts/theme-context'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: [
            'group toast',
            'group-[.toaster]:bg-card group-[.toaster]:text-card-foreground',
            'group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            'group-[.toaster]:rounded-lg',
            // Animation
            'group-[.toaster]:animate-in group-[.toaster]:slide-in-from-top-2',
            'group-[.toaster]:fade-in-0 group-[.toaster]:duration-300',
          ].join(' '),
          title: 'group-[.toast]:font-semibold group-[.toast]:text-foreground',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-sm',
          actionButton: [
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
            'group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5',
            'group-[.toast]:text-sm group-[.toast]:font-medium',
            'group-[.toast]:transition-colors group-[.toast]:hover:bg-primary/90',
          ].join(' '),
          cancelButton: [
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
            'group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5',
            'group-[.toast]:text-sm group-[.toast]:font-medium',
            'group-[.toast]:transition-colors group-[.toast]:hover:bg-muted/80',
          ].join(' '),
          closeButton: [
            'group-[.toast]:bg-transparent group-[.toast]:text-muted-foreground',
            'group-[.toast]:hover:bg-muted group-[.toast]:rounded-md',
            'group-[.toast]:transition-colors',
          ].join(' '),
          // Variant styling
          success: [
            'group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900',
            'group-[.toaster]:border-green-200',
            'dark:group-[.toaster]:bg-green-950 dark:group-[.toaster]:text-green-100',
            'dark:group-[.toaster]:border-green-900',
          ].join(' '),
          error: [
            'group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900',
            'group-[.toaster]:border-red-200',
            'dark:group-[.toaster]:bg-red-950 dark:group-[.toaster]:text-red-100',
            'dark:group-[.toaster]:border-red-900',
          ].join(' '),
          warning: [
            'group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900',
            'group-[.toaster]:border-yellow-200',
            'dark:group-[.toaster]:bg-yellow-950 dark:group-[.toaster]:text-yellow-100',
            'dark:group-[.toaster]:border-yellow-900',
          ].join(' '),
          info: [
            'group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900',
            'group-[.toaster]:border-blue-200',
            'dark:group-[.toaster]:bg-blue-950 dark:group-[.toaster]:text-blue-100',
            'dark:group-[.toaster]:border-blue-900',
          ].join(' '),
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--success)',
          '--success-text': 'var(--success-foreground)',
          '--error-bg': 'var(--destructive)',
          '--error-text': 'var(--destructive-foreground)',
        } as React.CSSProperties
      }
      position="top-right"
      expand={false}
      richColors
      closeButton
      {...props}
    />
  )
}

export { Toaster }
