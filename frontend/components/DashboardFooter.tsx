import Link from "next/link";

export default function DashboardFooter() {
    return (
        <footer className="py-3 mx-6 md:mx-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500 border-t border-white/10">
            <p>StudyShare — built for focused learning.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/docs/api" className="hover:text-[#a8a4fc] transition-colors">
                    API docs
                </Link>
                <Link href="/" className="hover:text-[#a8a4fc] transition-colors">
                    Home
                </Link>
            </div>
        </footer>
    )
}