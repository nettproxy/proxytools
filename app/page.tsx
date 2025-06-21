"use client"

import { Server, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-pink-400 via-white via-blue-400 to-blue-500 bg-clip-text text-transparent">
              <Server className="inline mr-2 mb-1 h-5 w-5 text-pink-500" /> ProxyTools
            </h1>
          </div>
          <nav className="flex items-center gap-4">
          </nav>
          
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to ProxyTools</h2>
          <p className="text-muted-foreground mb-6">
            A collection of tools to enhance your productivity.
          </p>
          <Link href="/discord-lookup">
          <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Button variant="default" className="text-lg px-6 py-4" onClick={() => window.location.href = '/cfx-resolver'}>
            CFX Search
          </Button>
          <Button variant="default" className="text-lg px-6 py-4" onClick={() => window.location.href = '/discord-lookup'}>
            Discord User Lookup
          </Button>
          <Button variant="default" className="text-lg px-6 py-4"  onClick={() => window.location.href = '/webhook-sender'}>
            Webhook Sender
          </Button>
          <Button variant="default" className="text-lg px-6 py-4" onClick={() => window.location.href = '/webhook-deleter'}>
            Webhook Deleter
          </Button>
        </div>

          </Link>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} ProxyTools. All rights reserved.
      </footer>
    </div>
  )
}
