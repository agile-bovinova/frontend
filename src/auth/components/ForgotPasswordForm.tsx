import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import { authService } from "../services/auth-service";

interface ForgotPasswordFormProps {
    /** Return to the login form. */
    onBack: () => void;
}

type Step = "request" | "reset";

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
    const [step, setStep] = useState<Step>("request");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleRequest = async () => {
        setError("");
        if (!emailIsValid) {
            setError("Ingresa un email válido.");
            return;
        }
        setIsSubmitting(true);
        try {
            await authService.forgotPassword(email.trim());
            // The backend answers 200 regardless, so we always move forward.
            setInfo("Si el correo está registrado, te enviamos un código de 6 dígitos. Revisa tu bandeja.");
            setStep("reset");
        } catch {
            // Even on an unexpected error we keep the neutral message (no enumeration).
            setInfo("Si el correo está registrado, te enviamos un código de 6 dígitos. Revisa tu bandeja.");
            setStep("reset");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = async () => {
        setError("");
        if (!/^\d{6}$/.test(code)) {
            setError("El código debe tener 6 dígitos.");
            return;
        }
        if (newPassword.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        setIsSubmitting(true);
        try {
            await authService.resetPassword({ email: email.trim(), code, newPassword });
            setSuccess(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo restablecer la contraseña.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        "w-full px-4 py-3 border border-[#7E8F82] rounded-[12px] text-sm outline-none transition-[border-color] duration-200 focus:border-[#10A065] placeholder:text-[#9CA3AF]";

    if (success) {
        return (
            <div className="w-full font-inter text-[#0E1A12] flex flex-col gap-5 text-center">
                <p className="text-[#0A7E4D] text-sm font-semibold">
                    ¡Contraseña actualizada! Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <button
                    type="button"
                    className="w-full h-14 bg-gradient-to-r from-[#10A065] to-[#0A7E4D] text-white font-inter text-sm font-semibold rounded-[14px] flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-[0.97] shadow-md hover:shadow-lg"
                    onClick={onBack}
                >
                    Volver a iniciar sesión
                </button>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (step === "request") {
            handleRequest();
        } else {
            handleReset();
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full font-inter text-[#0E1A12] flex flex-col gap-5">
            <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-[#4F6354] hover:text-[#0A7E4D] w-fit"
                onClick={onBack}
            >
                <ArrowLeft size={16} /> Volver
            </button>

            <div>
                <h2 className="text-lg font-bold text-[#0E1A12]">Recuperar contraseña</h2>
                <p className="text-sm text-[#4F6354] mt-1">
                    {step === "request"
                        ? "Ingresa tu correo y te enviaremos un código para restablecer tu contraseña."
                        : "Ingresa el código de 6 dígitos que enviamos a tu correo y tu nueva contraseña."}
                </p>
            </div>

            {step === "request" ? (
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="fp-email" className="text-sm font-medium text-[#4F6354]">Email</label>
                    <input
                        id="fp-email"
                        type="email"
                        placeholder="john@mail.com"
                        className={inputClass}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    />
                </div>
            ) : (
                <>
                    {info && <span className="text-[#0A7E4D] text-xs font-inter">{info}</span>}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="fp-code" className="text-sm font-medium text-[#4F6354]">Código de verificación</label>
                        <input
                            id="fp-code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            className={`${inputClass} tracking-[8px] text-center font-semibold`}
                            value={code}
                            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="fp-new" className="text-sm font-medium text-[#4F6354]">Nueva contraseña</label>
                        <div className="relative">
                            <input
                                id="fp-new"
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
                                className={`${inputClass} pr-12`}
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
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
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="fp-confirm" className="text-sm font-medium text-[#4F6354]">Confirmar contraseña</label>
                        <input
                            id="fp-confirm"
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            className={inputClass}
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                        />
                    </div>
                </>
            )}

            {error && <span className="text-[#D04A3A] text-xs font-inter">{error}</span>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-gradient-to-r from-[#10A065] to-[#0A7E4D] text-white font-inter text-sm font-semibold rounded-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-[0.97] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                aria-busy={isSubmitting}
            >
                {isSubmitting ? (
                    <CircularProgress size={18} sx={{ color: "white" }} />
                ) : step === "request" ? (
                    "Enviar código"
                ) : (
                    "Restablecer contraseña"
                )}
            </button>

            {step === "reset" && (
                <button
                    type="button"
                    className="text-sm text-[#4F6354] hover:text-[#0A7E4D] mx-auto"
                    onClick={() => { setStep("request"); setError(""); setInfo(""); }}
                    disabled={isSubmitting}
                >
                    ¿No recibiste el código? Reenviar
                </button>
            )}
        </form>
    );
}
