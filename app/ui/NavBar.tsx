import Link from "next/link";
import { navItems } from "../config/nav";
import WideButton from "./WideButton";

function renderNav(items: any[], parentPath = "") {
    return items.map((item) => {
        // GROUP labels
        if (!item.name) {
            return (
                <div key={item.label} className="mt-6">
                    <p className="text-gray-400 uppercase mb-2">
                        {item.label}
                    </p>
                    <div className="flex flex-col gap-2">
                        {renderNav(item.children, parentPath)}
                    </div>
                </div>
            );
        }

        // Build URL
        const path =
            item.name === "home"
                ? "/"
                : `${parentPath}/${item.name}`;

        return (
            <div key={path}>
                <Link
                    href={path}
                    className="block text-white hover:text-blue-400"
                >
                    {item.label}
                </Link>

                {/* Nested items */}
                {item.children && (
                    <div className="ml-4 mt-1 flex flex-col gap-1">
                        {renderNav(item.children, path)}
                    </div>
                )}
            </div>
        );
    });
}


export default function Navbar() {
    return (
        <aside className="w-64 h-screen bg-primary p-4 flex flex-col">
            {renderNav(navItems)}
            
            <div className="mt-auto">
                <WideButton variant="accentBorder">→ Logout</WideButton>
            </div>
        </aside>
    );
}