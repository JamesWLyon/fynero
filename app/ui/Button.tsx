import { buttonVariants, ButtonVariant } from "../config/buttons";

export default function Button({
  children,
  variant = "primary",
  className,
  type,
  click,
}: {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit" | "reset";
  click?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type={type}
      onClick={click}
      className={`
        w-full
        py-2
        px-4
        rounded
        flex items-center gap-2
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