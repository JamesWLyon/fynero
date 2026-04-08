import { buttonVariants, ButtonVariant } from "../config/buttonColors";

export default function WideButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
}) {
  return (
    <button
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
        `}
    >
      {children}
    </button>
  );
}