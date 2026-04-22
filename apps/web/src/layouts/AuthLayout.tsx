// apps/web/src/layouts/AuthLayout.tsx

import { Outlet } from 'react-router-dom'

/**
 * LAYOUT: AuthLayout
 * 
 * ACTUAL: Layout simple para login/register
 *         - Fondo con gradiente
 *         - Logo grande
 *         - Links de ayuda
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  )
}