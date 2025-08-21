"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Package2,
  Menu,
  X,
  TrendingUp,
  User,
  Settings,
  Sparkles,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview & Analytics",
  },
  {
    name: "Services",
    href: "/packages",
    icon: Package,
    description: "Service Packages",
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package2,
    description: "Stock Management",
  },
  {
    name: "Daily Expenses",
    href: "/expenses",
    icon: TrendingUp,
    description: "Financial Reports",
  },
  {
    name: "Sales Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Business Insights",
  },
]

const accountNavigation = [
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    description: "Account Details",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Preferences",
  },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-68 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/60 shadow-xl transform transition-all duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-6">
            <div className="absolute inset-0 bg-black/10" suppressHydrationWarning></div>
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <Image
                  src="/HUSN.png"
                  alt="HUSN Logo"
                  width={48}
                  height={48}
                  className="rounded-full object-cover shadow-lg ring-4 ring-white/30"
                />
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"
                  suppressHydrationWarning
                ></div>
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-white drop-shadow-sm">HUSN</span>
                <p className="text-white/80 text-sm font-medium">Beauty Salon</p>
              </div>
              <Sparkles className="absolute top-2 right-2 h-5 w-5 text-white/60" />
            </div>
          </div>

          <nav className="flex-1 p-6 space-y-8">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Main Menu</h3>
              <div className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-[1.02]"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:transform hover:scale-[1.01]",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90"></div>
                      )}
                      <item.icon
                        className={cn(
                          "h-5 w-5 relative z-10 transition-transform group-hover:scale-110",
                          isActive ? "text-white" : "text-slate-500",
                        )}
                      />
                      <div className="relative z-10">
                        <div className="font-medium">{item.name}</div>
                        <div className={cn("text-xs opacity-75", isActive ? "text-white/80" : "text-slate-500")}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Account</h3>
              <div className="space-y-2">
                {accountNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-[1.02]"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:transform hover:scale-[1.01]",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-90"></div>
                      )}
                      <item.icon
                        className={cn(
                          "h-5 w-5 relative z-10 transition-transform group-hover:scale-110",
                          isActive ? "text-white" : "text-slate-500",
                        )}
                      />
                      <div className="relative z-10">
                        <div className="font-medium">{item.name}</div>
                        <div className={cn("text-xs opacity-75", isActive ? "text-white/80" : "text-slate-500")}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
