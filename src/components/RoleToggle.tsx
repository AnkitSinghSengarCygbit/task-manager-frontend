interface RoleToggleProps {
  value: 'user' | 'admin'
  onChange: (role: 'user' | 'admin') => void
}

export default function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-700 mb-2">I am a</p>
      {/* Sliding-pill toggle — pill slides left ↔ right on selection */}
      <div className="relative flex bg-gray-100 rounded-lg p-0.5">
        {/* Sliding background pill */}
        <div
          className={`absolute top-0.5 bottom-0.5 bg-blue-600 rounded-md transition-all duration-300 ease-in-out ${
            value === 'admin' ? 'left-1/2 right-0.5' : 'left-0.5 right-1/2'
          }`}
        />
        {(['user', 'admin'] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            /* no-sweep: this button has its own sliding animation */
            className={`no-sweep relative z-10 flex-1 py-2 rounded-md text-sm font-semibold capitalize transition-colors duration-300 ${
              value === role ? 'text-white' : 'text-gray-600'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  )
}
