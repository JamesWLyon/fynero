export const buttonVariants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-secondary text-white hover:bg-secondary-dark",
    danger: "bg-red-500 text-white hover:bg-red-600",
    secondaryBorder: "border border-secondary text-secondary",
    accentBorder: "border border-accent text-accent text-left",
    authButton: "mt-4 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-300 text-th font-medium shadow-lg justify-center items-center gap-2 flex max-w-[15rem] mx-auto transition linear duration-300 hover:scale-105 hover:cursor-pointer",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;