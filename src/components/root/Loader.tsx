import { Briefcase } from "lucide-react";

const Loader = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-6">
      {/* Logo con animación */}
      <div className="relative mb-10">
        <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-200 flex items-center justify-center">
          <Briefcase className="w-12 h-12 text-white" />
        </div>

        {/* Anillos concéntricos animados */}
        <div className="absolute -inset-6 rounded-full border-4 border-blue-200/30 animate-ping-slow"></div>
        <div className="absolute -inset-8 rounded-full border-4 border-blue-300/20 animate-ping-slower"></div>
      </div>

      {/* Texto de carga */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">
          Cargando datos
        </h2>
      </div>

      {/* Barra de progreso */}
      <div className="w-full max-w-md mb-8">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-br from-blue-500 to-cyan-500 rounded-full animate-loading-bar"
            style={{ width: "85%" }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-slate-500">0%</span>
          <span className="text-sm text-slate-500 font-medium">
            Cargando...
          </span>
          <span className="text-sm text-slate-500">100%</span>
        </div>
      </div>

      {/* Spinner sutil en la esquina inferior */}
      <div className="absolute bottom-8 right-8">
        <div className="relative">
          <div className="w-10 h-10 border-3 border-transparent border-t-blue-500 border-r-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-blue-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
