import { LoginFormData } from "@/app/auth/page";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface LoginFormProps {
  loginForm: UseFormReturn<LoginFormData>;
  onLoginSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginForm = ({
  loginForm,
  onLoginSubmit,
  isLoading,
  showPassword,
  setShowPassword,
}: LoginFormProps) => {
  return (
    <form
      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
      className="space-y-5"
    >
      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" />
          Email
        </label>
        <input
          type="email"
          {...loginForm.register("email")}
          placeholder="tu@gmail.com"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {loginForm.formState.errors.email && (
          <p className="text-red-500 text-xs mt-1">
            {loginForm.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Contraseña */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...loginForm.register("password")}
            placeholder="Contraseña"
            className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {loginForm.formState.errors.password && (
          <p className="text-red-500 text-xs mt-1">
            {loginForm.formState.errors.password.message}
          </p>
        )}
      </div>

      {/* Botón Login */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? "Cargando..." : "Iniciar sesión"}
        {!isLoading && <Sparkles className="w-4 h-4" />}
      </button>
    </form>
  );
};

export default LoginForm;
