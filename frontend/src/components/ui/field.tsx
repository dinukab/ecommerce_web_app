export function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

export function FieldLabel({ 
  children, 
  htmlFor 
}: { 
  children: React.ReactNode
  htmlFor?: string 
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
      {children}
    </label>
  )
}

export function FieldDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600">{children}</p>
}
