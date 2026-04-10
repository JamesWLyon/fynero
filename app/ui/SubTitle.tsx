export default function SubTitle({ title, className }: { title: string; className?: string }) {
    return (
        <h2 className={`text-lg font-semibold mb-2 ${className || ''}`}>{title}</h2>
    );
}