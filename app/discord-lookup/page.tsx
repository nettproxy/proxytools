"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BadgeAlertIcon, Send, Loader2, User, Info, ExternalLink, Server } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger, 
} from "@/components/ui/hover-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTheme } from "next-themes"

interface DiscordUserData {
  id: string
  username: string
  discriminator: string
  media: {
    avatar: {
      avatar_url: string
      avatar: string
    }
    banner: {
      id: string
      url: string
    }
  }
  clan: {
    clan_tag: string,
    guild_id: string,
    badge: string,
  }
  badges?: string[]
  public_flags?: number
  display_name?: string
  accent_color?: number | null
  bot?: boolean
  system?: boolean
  mfa_enabled?: boolean
  locale?: string
  verified?: boolean
  email?: string
  flags?: number
  premium_type?: number
  created_at?: string
}

function getDiscordAvatarUrl(user: DiscordUserData) {
  if (!user.media.avatar) {
    // Default avatar
    const defaultAvatarId = Number(user.discriminator) % 5
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarId}.png`
  }
  const format = user.media.avatar.avatar.startsWith("a_") ? "gif" : "png"
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.media.avatar.avatar}.${format}?size=256`
}

function getDiscordProfileUrl(userId: string) {
  return `http://localhost:1337/api/v1/users/${userId}`
}

function getCreatedAtFromId(id: string): string | null {
  // Discord snowflake: (id / 4194304) + 1420070400000
  try {
    const discordEpoch = 1420070400000
    const createdAt = new Date(Number(BigInt(id) / BigInt(4194304)) + discordEpoch)
    return createdAt.toLocaleString()
  } catch {
    return null
  }
}

const gotoCfx = () => {
  window.location.href = "/cfx-resolver"
}

const gotoHome = () => {
  window.location.href = "/"
}

export default function DiscordLookup() {
  const [userId, setUserId] = useState("")
  const [userData, setUserData] = useState<DiscordUserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchDiscordUser = async () => {
    if (!userId.trim() || !/^\d{17,20}$/.test(userId.trim())) {
      setError("Please enter a valid Discord User ID (snowflake).")
      return
    }
    setError(null)
    setLoading(true)
    setUserData(null)
    try {
      const response = await fetch(`http://localhost:1337/api/v1/user/${userId.trim()}`)
      if (!response.ok) {
        throw new Error(`User not found or API error (${response.status})`)
      }
      const data = await response.json()
      setUserData(data)
      toast.success("Discord user information fetched!", {
        description: `for User ID: ${userId}`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Discord user information")
      setUserData(null)
    } finally {
      setLoading(false)
      setShowConfirmDialog(false)
    }
  }

  const clearInput = () => {
    setUserId("")
    setUserData(null)
    setError(null)
    toast.success("Input cleared!")
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-pink-400 via-white via-blue-400 to-blue-500 bg-clip-text text-transparent">
              ProxyTools - Discord Lookup
            </h1>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <HoverCard>
              <HoverCardTrigger>
                <Button
                  variant="outline"
                  className="h-10 px-4 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground border"
                  onClick={clearInput}
                >
                  <BadgeAlertIcon className="h-4 w-4 mr-2" /> Clear Input
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Help</h4>
                    <p className="text-sm">
                      Use this button to clear the current Discord user data and show the input again.
                    </p>
                    <div className="flex items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        made by proxy
                      </span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
  
            {/* Moved outside HoverCardTrigger */}
            <nav className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" className="text-sm">
                  <User className="mr-2 h-4 w-4" /> Home
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>


      <div className="container max-w-2xl mx-auto py-6 px-4">
        {!userData && (
          <Alert className="mb-5">
            <Info className="h-4 w-4" />
            <AlertTitle>Discord Lookup</AlertTitle>
            <AlertDescription>
              Enter a Discord User ID (snowflake) to fetch public information about that user.
            </AlertDescription>
          </Alert>
        )}

        {!userData && (
          <Card className="mb-8 shadow-lg border-muted bg-card">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter Discord User ID (e.g., 80351110224678912)"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="h-12 text-base px-3 py-1"
                  />
                </div>
                <Button
                  variant="default"
                  className="ml-2 h-12 px-6 text-base font-medium bw-full bg-gradient-to-r from-indigo-400 to-pink-600 hover:from-indigo-500 hover:to-pink-700 text-white shadow-lg"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" /> Looking up...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2" /> Lookup
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6 shadow-md">
            <BadgeAlertIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to fetch information for Discord User ID: <strong>{userId}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={fetchDiscordUser}>Yes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {userData && (
          <Card className="shadow-xl border-muted bg-card">
            <CardHeader className="pb-4 flex flex-col items-center relative">
              {userData.media.banner.id && (
                <div className="absolute inset-0 w-full h-64 overflow-hidden rounded-t-lg">
                  <img
                    src={`https://cdn.discordapp.com/banners/${userData.id}/${userData.media.banner.id}.png?size=512`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card"></div>
                </div>
              )}
              <div className="relative z-10 flex flex-col items-center">
                <img
                  src={getDiscordAvatarUrl(userData)}
                  alt="Discord Avatar"
                  className="rounded-full w-32 h-32 border-4 border-indigo-400 shadow-lg mb-2"
                  draggable={false}
                />
                <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  {userData.username.replace("#0","")}
                  <span className="text-muted-foreground text-lg">#{userData.discriminator}</span>
                  {userData.bot && (
                    <Badge variant="outline" className="ml-2 text-xs bg-yellow-100/10 text-yellow-600 border-yellow-700/30 px-2 py-0.5">
                      Bot
                    </Badge>
                  )}
                </CardTitle>
                <div className="font-mono text-lg">
                  {userData.display_name}
                </div>
                {userData.clan.clan_tag && (
                  <div className="font-mono text-lg">
                    <Badge>
                      {userData.clan.clan_tag}
                    </Badge>
                  </div>
                )}
                {userData.badges && userData.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {userData.badges.map((badge, index) => (
                      <Badge 
                        key={index}
                        variant="outline"
                        className={`text-xs px-2 py-0.5 bg-[${userData.accent_color ? '#' + userData.accent_color.toString(16).padStart(6, '0') : 'indigo'}-100/10] text-[${userData.accent_color ? '#' + userData.accent_color.toString(16).padStart(6, '0') : 'indigo'}-600] border-[${userData.accent_color ? '#' + userData.accent_color.toString(16).padStart(6, '0') : 'indigo'}-700/30]`}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
                <CardDescription className="text-base text-center mt-2">
                  <a
                    href={getDiscordProfileUrl(userData.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" /> View Discord Profile
                  </a>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">User ID</div>
                  <div className="font-mono text-lg break-all">{userData.id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Account Created</div>
                  <div className="font-mono text-lg">
                    {userData.created_at
                      ? new Date(userData.created_at).toLocaleString()
                      : getCreatedAtFromId(userData.id) || "Unknown"}
                  </div>
                </div>
                {userData.locale && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Locale</div>
                    <div className="font-mono text-lg">{userData.locale}</div>
                  </div>
                )}
                {typeof userData.public_flags === "number" && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Public Flags</div>
                    <div className="font-mono text-lg">{userData.public_flags}</div>
                  </div>
                )}
                {userData.accent_color && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Accent Color</div>
                    <div className="font-mono text-lg">
                      #{userData.accent_color.toString(16).padStart(6, "0")}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground border-t p-4 flex justify-between">
              <div>Last updated: <strong>{new Date().toLocaleTimeString()}</strong></div>
              <div>
                <a
                  href={getDiscordProfileUrl(userData.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" /> Discord Profile
                </a>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
