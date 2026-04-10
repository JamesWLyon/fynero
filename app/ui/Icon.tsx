import { icons } from "@/app/config/icons";

type IconName = keyof typeof icons;

type IconProps = {
    name: IconName;
    size?: number;
    className?: string;
};

export default function Icon({ name, size = 16, className }: IconProps) {
    const LucidIcon = icons[name];
    
    if (!LucidIcon) return null;

    return <LucidIcon size={size} className={className} />;
}