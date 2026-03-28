"use client";
import { CustomLink } from "@/components/CustomLink";
import { useAuthStore } from "@/store/authStore";
import { BookOpen, LayoutDashboard, Upload, Terminal, MessageSquare, LogOut, User } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/editor", label: "Editor", icon: Terminal },
  { href: "/chatbot", label: "Chatbot", icon: MessageSquare },
];

export default function Navbar() {
  const { appUser, firebaseUser, logout } = useAuthStore();

  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2">
        <BookOpen className="text-indigo-400 w-5 h-5" />
        <span className="font-bold text-white">StudyShare</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <CustomLink key={href} href={href}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm">
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-800 transition-colors outline-none">
          <Avatar className="w-7 h-7">
            <AvatarImage src={firebaseUser?.photoURL || ""} />
            <AvatarFallback className="bg-indigo-600 text-xs">
              {appUser?.displayName?.[0] || appUser?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-300 hidden md:block">
            {appUser?.displayName || appUser?.email}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
          <DropdownMenuItem className="text-gray-400 text-xs">{appUser?.email}</DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
            <User className="w-4 h-4 mr-2" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout} className="hover:bg-gray-800 cursor-pointer text-red-400">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
