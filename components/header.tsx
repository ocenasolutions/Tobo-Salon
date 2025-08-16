"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/packages": "Packages",
  "/bills": "Bills",
  "/reports": "Reports",
  "/inventory": "Inventory",
  "/expenses": "Expenses",
  "/profile": "Profile",
  "/settings": "Settings",
}

interface UserData {
  email: string
  isVerified: boolean
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const currentPage = pageNames[pathname] || "Dashboard"
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("auth-token")
        if (!token) return

        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      }
    }

    fetchUserData()
  }, [])

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleSettingsClick = () => {
    router.push("/settings")
  }

  const handleLogout = () => {
    localStorage.removeItem("auth-token")
    router.push("/auth")
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <header className="bg-background border-b border-border h-16 flex items-center justify-between px-6 ml-0 md:ml-64">
      {/* Left spacer (empty, balances the avatar on right) */}
      <div className="w-10"></div>

      {/* Center title */}
      <h1 className="text-2xl font-serif font-bold text-foreground text-center flex-1">
        {currentPage}
      </h1>

      {/* Right avatar dropdown */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
                <AvatarFallback>{user ? getInitials(user.email) : "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user ? user.email.split("@")[0] : "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user ? user.email : "Loading..."}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
