interface AuthLayoutProps {
  title: string
  children: React.ReactNode
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-purple-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/75 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">{title}</h1>
        {children}
      </div>
    </div>
  )
}
