import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  Factory,
  Wheat,
  ArrowLeftRight,
  ShoppingCart,
  Landmark,
  Wallet,
  LineChart,
  PiggyBank,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    title: "Visão geral",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Cadastros",
    items: [
      { label: "Produtos", href: "/produtos", icon: Package },
      { label: "Clientes", href: "/clientes", icon: Users },
    ],
  },
  {
    title: "Operação",
    items: [
      { label: "Pedidos", href: "/pedidos", icon: ClipboardList },
      { label: "Produção", href: "/producao", icon: Factory },
    ],
  },
  {
    title: "Estoque",
    items: [
      { label: "Insumos", href: "/estoque/insumos", icon: Wheat },
      { label: "Movimentações", href: "/estoque/movimentacoes", icon: ArrowLeftRight },
      { label: "Compras", href: "/estoque/compras", icon: ShoppingCart },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { label: "Contas a Receber", href: "/financeiro/receber", icon: Landmark },
      { label: "Contas a Pagar", href: "/financeiro/pagar", icon: Wallet },
      { label: "Fluxo de Caixa", href: "/financeiro/fluxo-caixa", icon: LineChart },
      { label: "Margem por Produto", href: "/financeiro/margem", icon: PiggyBank },
    ],
  },
]
