'use client'

import { Toaster as Sonner, ToasterProps } from 'sonner'

// The app does not (yet) wrap its tree in a next-themes ThemeProvider, so
// `useTheme()` here would just resolve to the "system" default which can
// produce unreadable dark toasts against the app's light surfaces. Pin to
// "light" until a real theme story is in place — callers can still override
// via props if needed.
const Toaster = ({ theme = 'light', ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
