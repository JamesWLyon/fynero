import { CardTitle } from "@/app/ui/Titles";

export default function Card({ children, className }: { children: React.ReactNode; className?: string, 
}) {
    return (
        <div className={`bg-accent/5 backdrop-blur-[2.5px] p-6 rounded-lg shadow-md border border-accent/10 ${className || ''}`}>
            {children}
        </div>
    );
}