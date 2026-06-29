export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <div className="inline-flex size-10 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg mb-3">
            Z
          </div>
          <h1 className="text-xl font-semibold">Zenno</h1>
          <p className="text-sm text-muted-foreground mt-1">Private workspace for your team</p>
        </div>
        {children}
      </div>
    </div>
  )
}
