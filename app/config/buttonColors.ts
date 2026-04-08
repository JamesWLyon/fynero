export const buttonVariants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-secondary text-white hover:bg-secondary-dark",
    danger: "bg-red-500 text-white hover:bg-red-600",
    secondaryBorder: "border border-secondary text-secondary",
    accentBorder: "border border-accent text-accent text-left",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;