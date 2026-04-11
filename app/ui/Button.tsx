import { buttonVariants, ButtonVariant } from "../config/buttons";

export default function Button({
  children,
  variant = "primary",
  className,
  type,
}: {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      className={`
        w-full
        py-2
        px-4
        rounded
        transition-colors
        hover:cursor-pointer
        transition-transform
        duration-200
        hover:scale-105
        ${buttonVariants[variant]}
        ${className || ""}
        `}
    >
      {children}
    </button>
  );
}