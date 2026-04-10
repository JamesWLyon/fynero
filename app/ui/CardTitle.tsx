export default function CardTitle({ title, className }: { title: string; className?: string }) {
    return (
        <h3 className={`text-md  mb-2 ${className || ''}`}>{title}</h3>
    );
}