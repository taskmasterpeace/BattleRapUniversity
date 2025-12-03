"use client"

import { BLOGGERS } from "@/lib/bloggers"

interface BloggerSelectorProps {
  selected: string | "all"
  onChange: (blogger: string | "all") => void
}

export function BloggerSelector({ selected, onChange }: BloggerSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
      <button
        onClick={() => onChange("all")}
        className={`px-4 py-2 rounded-full font-bold uppercase text-sm whitespace-nowrap transition-colors ${
          selected === "all" ? "bg-orange-500 text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
        }`}
      >
        All Bloggers
      </button>

      {BLOGGERS.map((blogger) => (
        <button
          key={blogger.slug}
          onClick={() => onChange(blogger.slug)}
          className={`px-4 py-2 rounded-full font-bold uppercase text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
            selected === blogger.slug ? "text-black" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
          style={selected === blogger.slug ? { backgroundColor: blogger.color } : {}}
        >
          <span>{blogger.icon}</span>
          <span className="hidden sm:inline">{blogger.name}</span>
        </button>
      ))}
    </div>
  )
}
