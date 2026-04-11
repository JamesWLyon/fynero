export const backgroundVariants = {
    primary: "bg-[radial-gradient(circle_at_center,var(--color-fourth)_0%,var(--color-third)_85%,#05080e_100%)]",
    secondary: "bg-[linear-gradient(to_right,var(--color-fifth),var(--color-fourth))]",
} as const;

export type BackgroundVariant = keyof typeof backgroundVariants;