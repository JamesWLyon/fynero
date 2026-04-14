export function Title({ title, className }: { title: string; className?: string }) {
    return (
        <h1 className={`text-3xl font-bold ${className || ''}`}>{title}</h1>
    );
}

export function SubTitle({ children, className }: { children: React.ReactElement; className?: string }) {
    return (
        <h2 className={`text-lg text-gray-200 font-semibold ${className || ''}`}>{children}</h2>
    );
}

export function CardTitle({ title, className }: { title: string; className?: string }) {
    return (
        <h3 className={`text-lg ${className || ''}`}>{title}</h3>
    );
}

export function CardSubTitle({ title, className }: { title: string; className?: string }) {
    return (
        <h4 className={`text-md ${className || ''}`}>{title}</h4>
    );
}