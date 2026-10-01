"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, LogOut, Wheat as LogoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { NavContent } from "@/components/layout/nav-content"
import { authRepo } from "@/lib/repositories/auth.repo"

export function Topbar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    authRepo.logout()
    router.push("/login")
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-background px-3 md:px-6 print:hidden">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
            <SheetHeader className="h-14 flex-row items-center gap-2 border-b border-sidebar-border px-4">
              <LogoIcon className="size-5 text-primary" />
              <SheetTitle className="font-heading text-white">e-bakery</SheetTitle>
            </SheetHeader>
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="font-heading font-semibold md:hidden">e-bakery</span>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
        <LogOut className="size-4" />
        Sair
      </Button>
    </header>
  )
}
