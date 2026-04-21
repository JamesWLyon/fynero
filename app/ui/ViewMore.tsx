import Link from "next/link";

export default function ViewMore ({
    content,
    href,
}: {
    content: string;
    href: string;
}
) {

    return (
        <div className="mt-4 flex justify-end">
            <Link
                href={`/${href}`}
                className="
                    inline-flex items-center rounded-xl border border-white/10
                    bg-white/[0.03] px-4 py-2 text-sm text-white/80 transition
                    hover:bg-white/[0.05] hover:text-white
                "
            >
                {content}
            </Link>
        </div>
    );
}