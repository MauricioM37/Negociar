// apps/web/src/layouts/MainLayout.tsx

import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

/**
 * LAYOUT: MainLayout
 * 
 * ACTUAL: Layout completo con Navbar y Footer
 * FUTURO: Podría incluir:
 *         - Sidebar para filtros avanzados
 *         - Banner de promociones
 *         - Chat de atención al cliente
 */
export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Outlet /> {/* Aquí se renderiza la página específica */}
      </main>
      <Footer />
    </div>
  )
}
