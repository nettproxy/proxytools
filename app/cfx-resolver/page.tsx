"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BadgeAlertIcon, Send } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Users,
  Globe,
  User,
  Server,
  Moon,
  Sun,
  ExternalLink,
  Loader2,
  Info,
  Code,
  Settings,
  Terminal,
  Cpu,
  Zap,
  Tag,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useTheme } from "next-themes"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ServerData {
  Data: {
    hostname: string
    clients: number
    sv_maxclients: number
    resources: string[]
    server: string
    connectEndPoints?: string[]
    vars: {
      tags: string
      locale: string
      sv_projectName: string
      gamename: string
      [key: string]: any
    }
    players: any[]
    ownerName?: string
    ownerProfile?: string
    iconVersion?: number
    icon?: string
    enhancedHostName?: string
    [key: string]: any
  }
}

export default function Home() {
  const [cfxId, setCfxId] = useState("")
  const [serverData, setServerData] = useState<ServerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const [showAllPlayers, setShowAllPlayers] = useState(false)
  const [showAllResources, setShowAllResources] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  let fxServerShortenedName;
  
  if(serverData?.Data.server.includes("win") || serverData?.Data.server.includes("windows")) {
    fxServerShortenedName = "Windows Server"
  } else if(serverData?.Data.server.includes("linux")) {
    fxServerShortenedName = "Linux Server"
  }

  useEffect(() => {
    setMounted(true)
  }, [])


  const fetchServerInfo = async () => {
    toast.success("Fetching server information!", {
      description: "for CFX ID: " + cfxId
    })
    if (!cfxId.trim()) { 
      setError("Please enter a valid CFX ID")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${cfxId}`)

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setServerData(data)

      toast.success("Server information fetched successfully!", {
        description: "for CFX ID: " + cfxId,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch server information")
      setServerData(null)
    } finally {
      setLoading(false)
      setShowConfirmDialog(false)
    }
  }

  let gameType;

  if(serverData?.Data.vars.gamename == "rdr3" || serverData?.Data.vars.gamename == "rdr2") {
    gameType = "RedM"
  } else if(serverData?.Data.vars.gamename == "gta5") {
    gameType = "FiveM"
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getPlayerColumns = () => {
    if (!serverData?.Data.players || serverData.Data.players.length === 0) {
      return ["name"]
    }

    const sampleSize = Math.min(5, serverData.Data.players.length)
    const allKeys = new Set<string>()

    for (let i = 0; i < sampleSize; i++) {
      Object.keys(serverData.Data.players[i]).forEach((key) => allKeys.add(key))
    }

    const priorityFields = ["id", "name", "ping"]
    const excludeFields = ["identifiers", "endpoint", "identifer"]

    const columns = priorityFields.filter((field) => allKeys.has(field))

    allKeys.forEach((key) => {
      if (
        !columns.includes(key) &&
        !excludeFields.includes(key) &&
        !excludeFields.some((exclude) => key.includes(exclude)) &&
        typeof serverData.Data.players[0][key] !== "object"
      ) {
        columns.push(key)
      }
    })

    return columns
  }

  // Get server variables
  const getServerVariables = () => {
    if (!serverData?.Data.vars) {
      return {}
    }

    const excludeVars = ["tags", "locale"]
    const variables: Record<string, any> = {}

    Object.entries(serverData.Data.vars).forEach(([key, value]) => {
      if (!excludeVars.includes(key)) {
        variables[key] = value
      }
    })

    return variables
  }

  let projectDescription;

  projectDescription = serverData?.Data.vars.sv_projectDesc.replace(/\^./g, "")

  const playerColumns = serverData ? getPlayerColumns() : []
  const displayedPlayers = showAllPlayers ? serverData?.Data.players : serverData?.Data.players?.slice(0, 10)
  const serverVariables = serverData ? getServerVariables() : {}

  const getServerIP = () => {
    if (!serverData?.Data.connectEndPoints || serverData.Data.connectEndPoints.length === 0) {
      return null
    }
    return serverData.Data.connectEndPoints[0]
  }

  const serverIP = getServerIP()

  const joinServer = () => {
    if (serverIP) {
      window.location.href = `fivem://connect/${serverIP}`
    }
  }

  if (!mounted) {
    return null
  }


  const localeMap = {
    "en-US": "English",
    "de-DE": "German", 
    "es-ES": "Spanish",
    "fr-FR": "French",
    "it-IT": "Italian",
    "ja-JP": "Japanese", 
    "ko-KR": "Korean",
    "nl-NL": "Dutch",
    "pl-PL": "Polish",
    "pt-PT": "Portuguese",
    "ru-RU": "Russian",
    "sv-SE": "Swedish",
    "tr-TR": "Turkish",
    "zh-CN": "Chinese",
    "zh-TW": "Chinese (Traditional)",
    "ar-SA": "Arabic",
    "hi-IN": "Hindi",
    "bn-BD": "Bengali",
    "cs-CZ": "Czech",
    "th-TH": "Thai",
    "vi-VN": "Vietnamese",
    "ms-MY": "Malay",
    "id-ID": "Indonesian",    
  }

  const gotoHome = () => {
    window.location.href = "/"
  }
  
  let locale = localeMap[serverData?.Data.vars.locale as keyof typeof localeMap] || serverData?.Data.vars.locale;
  return (
    <div className="flex flex-col min-h-screen bg-background dark">
      <header className="border-b">
        <div className="container max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-pink-400 via-white via-blue-400 to-blue-500 bg-clip-text text-transparent">
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
            <Button variant="ghost" className="text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors border"
            onClick={() => gotoHome()}>
                Home
            </Button>
            </nav>
            <HoverCard>
              <HoverCardTrigger>
                <Button 
                  variant="outline" 
                  className="h-10 px-4 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground border" 
                  onClick={() => {
                    setServerData(null)
                    setCfxId("")
                    setError(null)
                    toast.success("Data removed successfully!", {
                      description: "for CFX ID: " + cfxId,
                    })
                  }}
                >
                  <BadgeAlertIcon className="h-4 w-4 mr-2" /> Clear Input
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Help</h4>
                    <p className="text-sm">
                      Use this button to clear the current server data and show the input again.
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
          </div>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto py-6 px-4">
        {!serverData && (
          <Alert className="mb-5">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can also use the CFX ID of any FiveM or RedM server to get the information of that server.
            </AlertDescription>
          </Alert>
        )}
      
        {!serverData && (
          <Card className="mb-8 shadow-lg border-muted bg-card">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter CFX ID (e.g., abcd123)"
                    value={cfxId}
                    onChange={(e) => setCfxId(e.target.value)}
                    className="h-12 text-base px-3 py-1"
                  />
                </div>
              <Button variant="default" className="ml-2 h-12 px-6 text-base font-medium bw-full bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white text-white shadow-lg" onClick={() => setShowConfirmDialog(true)} disabled={loading}>
                {loading ? "Resolving..." : <><Send /> Get Info</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    
        {error && (
          <Alert variant="destructive" className="mb-6 shadow-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to fetch information for CFX ID: <strong>{cfxId}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No</AlertDialogCancel>
              <AlertDialogAction onClick={() => fetchServerInfo()}>Yes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* <Dialog open={loading} onOpenChange={setLoading}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
              <DialogTitle>Resolving Server</DialogTitle>
              <DialogDescription>Fetching information for CFX ID: {cfxId}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </DialogContent>
        </Dialog> */}

        {serverData && (
          <Card className="shadow-xl border-muted bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {serverData.Data.hostname.replace(/\^./g, "") || serverData.Data.enhancedHostName?.replace(/\^./g, "") || "Unknown Server"}
              </CardTitle>
              <CardDescription className="text-base">
                CFX ID: <span className="font-mono">{cfxId}</span>
              </CardDescription>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                {/* <Badge variant="outline" className="text-xs">
                  {serverData.Data.server || "Unknown Version"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {serverData.Data.players.length + "/" + serverData.Data.sv_maxclients}
                </Badge> */}
                {/* {serverData.Data.vars?.locale && (
                  <Badge variant="outline" className="text-xs">
                    {localeMap[serverData?.Data.vars.locale as keyof typeof localeMap] || serverData?.Data.vars.locale}
                  </Badge>
                )} */}
                {/* <Badge variant="outline" className="text-xs">
                  {serverData.Data.gametype || "Unknown Gametype"}
                </Badge> */}
                <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 dark:text-purple-300 border-purple-500/30 px-3 py-1">
                  {gameType || "Unknown"}
                </Badge>
                <Badge variant="outline" className="text-xs bg-green-100/10 text-purple-500 dark:text-green-300 border-green-700/30 px-3 py-1">
                  {fxServerShortenedName || "Unknown"}
                </Badge>
                {serverData.Data.vars.locale && (
                  <Badge variant="outline" className="text-xs bg-blue-100/10 text-blue-500 dark:text-blue-300 border-blue-700/30 px-3 py-1">
                    {localeMap[serverData?.Data.vars.locale as keyof typeof localeMap] + " " + "(" + serverData?.Data.vars.locale + ")" || serverData?.Data.vars.locale + " " + serverData?.Data.vars.locale}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid grid-cols-4 mb-4">
                  <TabsTrigger value="info" className="flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    <span>Info</span>
                  </TabsTrigger>
                  <TabsTrigger value="players" className="flex items-center gap-1 truncate">
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="truncate">Players ({serverData.Data.players.length}/{serverData.Data.sv_maxclients})</span>
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="flex items-center gap-1 truncate">
                    <Code className="h-4 w-4 shrink-0" />
                    <span className="truncate">Resources ({serverData.Data.resources.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="variables" className="flex items-center gap-1 truncate">
                    <Settings className="h-4 w-4 shrink-0" />
                    <span className="truncate">Variables</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="p-6 focus-visible:outline-none focus-visible:ring-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-pink-500/10 via-pink-400/10 via-white/10 via-blue-400/10 to-blue-500/10 border border-pink-500/20 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-lg flex items-center gap-2`}>
                          <Users className="h-5 w-5 text-pink-500" />
                          Players
                        </CardTitle>
                      </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {serverData.Data.clients} / {serverData.Data.sv_maxclients}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {Math.round((serverData.Data.clients / serverData.Data.sv_maxclients) * 100)}% capacity ({Math.round(100 - (serverData.Data.clients / serverData.Data.sv_maxclients) * 100)}% remaining)
                          </p>
                          <div className="w-full bg-muted h-2 rounded-full mt-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-pink-500 via-pink-400 via-white via-blue-400 to-blue-500 h-full rounded-full"
                              style={{ width: `${(serverData.Data.clients / serverData.Data.sv_maxclients) * 100}%` }}
                            ></div>
                          </div>
                        </CardContent>
                      </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-400/10 via-blue-300/10 to-indigo-500/10 border border-purple-500/20 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-lg flex items-center gap-2`}>
                          <Cpu className="h-5 w-5 text-purple-500" />
                          Platform
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{fxServerShortenedName || "Unknown"}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {serverData.Data.server || "Unknown Version"}
                        </p>
                        <div className="w-full bg-muted h-2 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-300 h-full rounded-full"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 via-emerald-400/10 via-teal-300/10 to-emerald-500/10 border border-green-500/20 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-lg flex items-center gap-2`}>
                          <Zap className="h-5 w-5 text-green-500" />
                          Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{serverData.Data.resources.length}</div>
                        <p className="text-sm text-muted-foreground mt-1">Active server resources</p>
                        <div className="w-full bg-muted h-2 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 via-emerald-400 to-teal-300 h-full rounded-full"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {serverData.Data.vars.sv_projectName && (
                    <Card className="mt-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-lg flex items-center gap-2`}>
                          <Globe className="h-5 w-5 text-pink-500" />
                          Project Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">{serverData.Data.vars.sv_projectName.replace(/\^./g,"")}</div>
                        {projectDescription && (
                          <p className="text-sm text-muted-foreground mt-1">{projectDescription}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Connection Endpoints */}
                  {serverData.Data.connectEndPoints && serverData.Data.connectEndPoints.length > 0 && (
                    <Card className="mt-6 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 shadow-lg hover:shadow-yellow-500/10 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-lg flex items-center gap-2`}>
                          <Server className="h-5 w-5 text-yellow-500" />
                          Connection Endpoints
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {serverData.Data.connectEndPoints.map((endpoint, index) => (
                          <div
                            key={index}
                            className="bg-background p-3 rounded-md text-sm border border-border font-mono flex justify-between items-center"
                          >
                            {endpoint}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                              onClick={() => {
                                navigator.clipboard.writeText(endpoint)
                                toast.success("Copied to clipboard")
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Owner Information */}
                  {serverData.Data.ownerName && (
                    <Card className="mt-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-lg flex items-center gap-2`}>
                          <User className="h-5 w-5 text-blue-500" />
                          Owner Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="text-xl font-bold">{serverData.Data.ownerName}</div>
                            <p className="text-sm text-muted-foreground mt-1">Server Owner</p>
                          </div>

                          {serverData.Data.ownerProfile && (
                            <a
                              href={serverData.Data.ownerProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
                            >
                              <span>View Profile</span>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tags */}
                  {serverData.Data.vars?.tags && (
                    <Card className="mt-6 bg-[#f4a4cc]/10 shadow-sm border border-[#f4a4cc]/20 hover:shadow-[#f4a4cc]/20 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className={`text-lg flex items-center gap-2`}>
                          <Tag className="h-5 w-5 text-[#f4a4cc]" />
                          Tags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {serverData.Data.vars.tags.split(",").map((tag, index) => (
                            <HoverCard key={index}>
                              <HoverCardTrigger>
                                <Badge
                                  className="bg-[#f4a4cc]/10 text-[#f4a4cc] dark:text-[#f4a4cc] border-[#f4a4cc]/30 px-3 py-1 cursor-pointer"
                                >
                                  {tag.trim().toLowerCase().replace(" ", "-")}
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent>
                                <div className="flex flex-col space-y-2">
                                  <h4 className="text-sm font-semibold">Tag Information</h4>
                                  <p className="text-sm">
                                    Server tag: {tag.trim()}
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="players">
                  {serverData.Data.players && serverData.Data.players.length > 0 ? (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="text-base font-medium mb-4">Players ({serverData.Data.players.length})</h3>

                      <div className="rounded-md border shadow-sm overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              {playerColumns.map((column) => (
                                <TableHead key={column} className="capitalize font-medium text-foreground">
                                  {column}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {displayedPlayers?.map((player, index) => (
                              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                                {playerColumns.map((column) => (
                                  <TableCell key={`${index}-${column}`} className="py-3">
                                    {typeof player[column] === "object"
                                      ? JSON.stringify(player[column]).substring(0, 30)
                                      : String(player[column] || "-")}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {serverData.Data.players.length > 10 && (
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => setShowAllPlayers(!showAllPlayers)}
                        >
                          {showAllPlayers ? "Show Less" : `Show All ${serverData.Data.players.length} Players`}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                      No players currently online
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="resources">
                  {serverData.Data.resources && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-medium">Resources ({serverData.Data.resources.length})</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {serverData.Data.resources.slice(0, 20).map((resource, index) => (
                          <div key={index} className="bg-background p-3 rounded-md text-sm border border-border">
                            {resource}
                          </div>
                        ))}
                      </div>

                      {serverData.Data.resources.length > 20 && (
                        <Collapsible className="mt-4" open={showAllResources}>
                          {!showAllResources && (
                            <CollapsibleTrigger>
                              <Button variant="outline" className="w-full flex items-center justify-center gap-1 mt-2" onClick={() => setShowAllResources(true)}>
                                <span>Show {serverData.Data.resources.length - 20} more resources</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </CollapsibleTrigger>
                          )}
                          <CollapsibleContent className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {serverData.Data.resources.slice(20).map((resource, index) => (
                                <div
                                  key={index + 20}
                                  className="bg-background p-3 rounded-md text-sm border border-border"
                                >
                                  {resource}
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                          {showAllResources && (
                            <CollapsibleTrigger>
                                  <Button variant="outline" className="w-full flex items-center justify-center gap-1 mt-2" onClick={() => setShowAllResources(false)}>
                                    <span>Show less</span>
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                  </CollapsibleTrigger>
                                )}
                        </Collapsible>
                        
                      )}
                    </div>
                  )}

                </TabsContent>

                <TabsContent value="variables">
                  {Object.keys(serverVariables).length > 0 ? (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="text-base font-medium mb-4">Server Variables</h3>

                      <div className="rounded-md border shadow-sm overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-1/3 font-medium text-foreground">Variable</TableHead>
                              <TableHead className="font-medium text-foreground">Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(serverVariables).map(([key, value], index) => (
                              <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="py-3 font-mono text-sm">{key.replace("banner_connecting","Connecting Banner").replace("banner_detail", "Detail Banner").replace("gamename", "Game Name").replace("sv_licenseKey", "License Key").replace("sv_licenseKey", "License Key").replace("sv_licenseKey", "License Key").replace("sv_licenseKey", "License Key").replace("sv_licenseKey", "License Key").replace("sv_licenseKey", "License Key").replace("sv_licenseKey", "License Key").replace("sv_enforceGameBuild", "Game Build").replace("gametype", "Game Type").replace("onesync_enabled", "OneSync").replace("sv_disableClientReplays","Disable Client Replays").replace("sv_enhancedHostSupport","Enhanced Host Support").replace("sv_lan", "Lan").replace("sv_licenseKeyToken", "License Key Token").replace("sv_maxClients", "Max Slots").replace("sv_projectDesc", "Project Description").replace("sv_poolSizesIncrease", "Pool Sizes Increase").replace("sv_projectName", "Project Name").replace("sv_pureLevel", "Pure Level").replace("sv_replaceExeToSwitchBuilds","Replace Exe To Switch Builds").replace("sv_scriptHookAllowed", "Script Hook Allowed").replace("txAdmin-version", "txAdmin Version").replace("premium", "Premium").replace("can_review", "Can Review").replace("activitypubFeed", "Activity Pub Feed")}</TableCell>
                                <TableCell className="py-3">
                                  <strong>{typeof value === "object" ? JSON.stringify(value) : String(value || "-")}</strong>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                      No server variables available
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground border-t p-4 flex justify-between">
              <div>Last updated: <strong>{new Date().toLocaleTimeString()}</strong></div>
              {serverIP && <div>Server IP: <strong className="font-mono">{serverIP}</strong></div>}
            </CardFooter>
          </Card>
        )}
      </div>

      {serverData && serverIP && (
        <div className="fixed bottom-6 right-6">
          <Button onClick={joinServer} className="rounded-full h-14 w-14 shadow-lg" size="icon">
            <ExternalLink className="h-6 w-6" />
            <span className="sr-only">Join Server</span>
          </Button>
        </div>
      )}
    </div>
  )
}
