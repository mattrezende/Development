import { Wheat as LogoIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { NavContent } from "@/components/layout/nav-content"

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "hidden h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex print:hidden",
        className
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <LogoIcon className="size-5 text-primary" />
        <span className="font-heading font-semibold text-white">e-bakery</span>
      </div>
      <NavContent />
    </aside>
  )
}
