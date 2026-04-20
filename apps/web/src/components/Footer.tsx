// apps/web/src/components/Footer.tsx

import { Link } from 'react-router-dom'

/**
 * COMPONENTE: Footer
 * 
 * ACTUAL: Footer informativo simple
 * FUTURO:
 *         - Links a redes sociales
 *         - Newsletter subscription
 *         - Métodos de pago
 *         - Certificados de seguridad
 */
export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
  <div className="container mx-auto px-6">
    {/* Sección Newsletter - Diseño Elegante en Azul Profundo */}
    <div className="relative bg-[#001D3D] rounded-3xl p-8 md:p-12 shadow-2xl mb-16 overflow-hidden">
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="text-center lg:text-left">
          <h4 className="text-2xl md:text-3xl font-bold text-white mb-2">
            No te pierdas de nada
          </h4>
          <p className="text-blue-100 opacity-80">
            Ofertas exclusivas de <span className="text-green-400 font-semibold italic">Negociar</span> cada semana.
          </p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <input 
            type="email"
            placeholder="tu@correo.com" 
            className="flex-1 md:w-80 px-6 py-4 rounded-2xl focus:outline-none bg-white/10 border border-white/20 text-white placeholder:text-blue-200 backdrop-blur-sm" 
          />
          <button className="px-8 py-4 rounded-2xl bg-green-500 text-[#001D3D] font-black hover:bg-green-400 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(74,222,128,0.3)]">
            UNIRME
          </button>
        </div>
      </div>
      {/* Círculos decorativos sutiles */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-green-500 rounded-full opacity-10 blur-3xl"></div>
    </div>

    {/* Grid de Contenido */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
      {/* Branding */}
      <div className="space-y-6">
        <h3 className="text-3xl font-black text-black tracking-tighter">
          NEGOCIAR<span className="text-blue-600">.</span>
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          La plataforma más segura de Argentina para renovar tus espacios y encontrar lo que buscas al mejor precio.
        </p>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer text-gray-400">
            <span className="font-bold text-xs">FB</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer text-gray-400">
            <span className="font-bold text-xs">IG</span>
          </div>
        </div>
      </div>

      {/* Links */}
      <div>
        <h4 className="font-bold text-black mb-6 text-sm uppercase tracking-widest">Marketplace</h4>
        <ul className="space-y-4 text-gray-600 text-sm">
          <li><Link to="/catalog" className="hover:text-blue-600 flex items-center gap-2 group transition-all">
            <span className="w-0 group-hover:w-2 h-[2px] bg-blue-600 transition-all"></span> Catálogo General
          </Link></li>
          <li><Link to="/seller" className="hover:text-blue-600 flex items-center gap-2 group transition-all">
            <span className="w-0 group-hover:w-2 h-[2px] bg-blue-600 transition-all"></span> Quiero Vender
          </Link></li>
          <li><Link to="/" className="hover:text-blue-600 flex items-center gap-2 group transition-all">
            <span className="w-0 group-hover:w-2 h-[2px] bg-blue-600 transition-all"></span> Promociones
          </Link></li>
        </ul>
      </div>

      {/* Soporte */}
      <div>
        <h4 className="font-bold text-black mb-6 text-sm uppercase tracking-widest">Recursos</h4>
        <ul className="space-y-4 text-gray-600 text-sm">
          <li><a href="#" className="hover:text-blue-600 transition-colors">Centro de Ayuda</a></li>
          <li><a href="#" className="hover:text-blue-600 transition-colors">Términos legales</a></li>
          <li><a href="#" className="hover:text-blue-600 transition-colors">Seguridad</a></li>
        </ul>
      </div>

      {/* Contacto */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h4 className="font-bold text-black mb-6 text-sm uppercase tracking-widest">Contacto</h4>
        <ul className="space-y-4 text-sm text-gray-600">
          <li className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Email</span>
            <span className="text-black font-semibold">ingeniera2@negociar.com</span>
          </li>
          <li className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Ubicación</span>
            <span className="text-black font-semibold">Corrientes, Argentina</span>
          </li>
        </ul>
      </div>
    </div>

    {/* Footer Bottom */}
    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-xs font-medium">
      <p>&copy; 2026 NEGOCIAR. Todos los derechos reservados.</p>
      <div className="flex gap-8">
        <span className="hover:text-black cursor-pointer transition-colors">POLÍTICA DE PRIVACIDAD</span>
        <span className="hover:text-black cursor-pointer transition-colors">COOKIES</span>
      </div>
    </div>
  </div>
</footer>
  )
}
