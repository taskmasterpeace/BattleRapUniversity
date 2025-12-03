"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBattler } from "@/contexts/battler-context"
import {
  TrendingUp,
  TrendingDown,
  Mic,
  ShoppingBag,
  Home,
  Car,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

interface Transaction {
  id: string
  type: "income" | "expense"
  category: string
  description: string
  amount: number
  date: string
  icon: React.ElementType
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "income",
    category: "Battle Purse",
    description: "Main Stage Championship",
    amount: 5000,
    date: "2 days ago",
    icon: Mic,
  },
  {
    id: "2",
    type: "expense",
    category: "Travel",
    description: "Flight to Atlanta",
    amount: 350,
    date: "3 days ago",
    icon: Car,
  },
  {
    id: "3",
    type: "income",
    category: "Merchandise",
    description: "T-shirt sales",
    amount: 800,
    date: "1 week ago",
    icon: ShoppingBag,
  },
  {
    id: "4",
    type: "expense",
    category: "Rent",
    description: "Monthly rent",
    amount: 1500,
    date: "1 week ago",
    icon: Home,
  },
  {
    id: "5",
    type: "income",
    category: "Appearance",
    description: "Podcast interview",
    amount: 500,
    date: "2 weeks ago",
    icon: Mic,
  },
]

export default function FinancesPage() {
  const { activeBattler } = useBattler()
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  const totalBalance = activeBattler?.stats?.bankBalance || 12500
  const monthlyIncome = MOCK_TRANSACTIONS.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = MOCK_TRANSACTIONS.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const netChange = monthlyIncome - monthlyExpenses

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Balance Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-green-950/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-400 font-display mb-1">TOTAL BALANCE</p>
                <p className="text-4xl font-display font-black text-green-400">${totalBalance.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  {netChange >= 0 ? (
                    <span className="flex items-center gap-1 text-green-500 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      +${netChange.toLocaleString()} this month
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 text-sm">
                      <TrendingDown className="w-4 h-4" />${netChange.toLocaleString()} this month
                    </span>
                  )}
                </div>
              </div>
              <div className="w-16 h-16 bg-green-500/20 flex items-center justify-center">
                <PiggyBank className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Income/Expense Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-display">INCOME</p>
                <p className="text-xl font-display font-bold text-green-400">${monthlyIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-display">EXPENSES</p>
                <p className="text-xl font-display font-bold text-red-400">${monthlyExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {(["week", "month", "year"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1.5 text-xs font-display font-bold uppercase transition-colors ${
              timeRange === range
                ? "bg-orange-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-300 font-display flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-orange-500" />
              RECENT TRANSACTIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_TRANSACTIONS.map((transaction, index) => {
              const Icon = transaction.icon
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 flex items-center justify-center ${
                        transaction.type === "income" ? "bg-green-500/20" : "bg-red-500/20"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}
                      />
                    </div>
                    <div>
                      <p className="font-display font-bold text-zinc-200 text-sm">{transaction.description}</p>
                      <p className="text-xs text-zinc-500">
                        {transaction.category} • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-display font-bold ${
                      transaction.type === "income" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                  </span>
                </motion.div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
