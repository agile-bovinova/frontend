import { Eye, EyeOff } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/auth-store";

interface LoginFormProps {
    /** Switch the auth screen to the password-recovery flow. */
    onForgotPassword?: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps = {}) {
    const navigate = useNavigate();
    const { user, login, setUser, setError, error, isLoading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localError, setLocalError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser({ [name]: value });
        setLocalError("");
        if (error) setError(null);
    };

    const displayError = localError || error;

    const handleLogin = async () => {
        if (!user.email?.trim()) {
            setLocalError("El email es requerido.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            setLocalError("Ingresa un email válido.");
            return;
        }
        if (!user.password) {
            setLocalError("La contraseña es requerida.");
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await login();
            if (success) {
                navigate("/dashboard", { replace: true });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || isLoading) return;
        handleLogin();
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full font-inter text-[#0E1A12] flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-[#4F6354]">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@mail.com"
                    className="w-full px-4 py-3 border border-[#7E8F82] rounded-[12px] text-sm outline-none transition-[border-color] duration-200 focus:border-[#10A065] placeholder:text-[#9CA3AF]"
                    value={user.email}
                    onChange={handleChange}
                />
            </div>
            <div className="flex flex-col gap-1.5 relative">
                <label htmlFor="password" className="text-sm font-medium text-[#4F6354]">Contraseña</label>
                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="********"
                        className="w-full px-4 py-3 border border-[#7E8F82] rounded-[12px] text-sm outline-none transition-[border-color] duration-200 focus:border-[#10A065] placeholder:text-[#9CA3AF] pr-12"
                        value={user.password}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E8F82] hover:text-[#4F6354]"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            {onForgotPassword && (
                <button
                    type="button"
                    className="text-sm text-[#0A7E4D] hover:underline w-fit self-end -mt-2"
                    onClick={onForgotPassword}
                >
                    ¿Olvidaste tu contraseña?
                </button>
            )}

            {displayError && (
                <span className="text-[#D04A3A] text-xs font-inter">{displayError}</span>
            )}

            <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full h-14 bg-gradient-to-r from-[#10A065] to-[#0A7E4D] text-white font-inter text-sm font-semibold rounded-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.97] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                aria-busy={isSubmitting || isLoading}
            >
                {isSubmitting || isLoading ? (
                    <CircularProgress size={18} sx={{ color: "white" }} />
                ) : (
                    "Iniciar sesión"
                )}
            </button>
        </form>
    );
}
