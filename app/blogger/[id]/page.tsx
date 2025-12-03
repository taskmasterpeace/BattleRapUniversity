"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, TrendingUp, Eye, MessageSquare, Award, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock blogger data
const mockBloggers: Record<
  string,
  {
    id: string
    name: string
    avatar: string
    outlet: string
    bio: string
    credibility: number
    followers: number
    articlesWritten: number
    specialties: string[]
    stance: "supportive" | "critical" | "neutral"
    recentArticles: Array<{
      slug: string
      title: string
      date: string
      sentiment: "positive" | "negative" | "neutral"
      views: number
    }>
    battlerRelationships: Array<{
      name: string
      sentiment: "positive" | "negative" | "neutral"
      articleCount: number
    }>
  }
> = {
  "algorithm-institute": {
    id: "algorithm-institute",
    name: "The Algorithm Institute",
    avatar: "/blogger-avatar-algorithm-data-analyst.jpg",
    outlet: "Independent Analytics",
    bio: "Data-driven battle rap analysis. We break down every bar, every punch, every performance metric. Numbers don't lie.",
    credibility: 87,
    followers: 45200,
    articlesWritten: 342,
    specialties: ["Statistical Analysis", "Performance Metrics", "Trend Predictions"],
    stance: "neutral",
    recentArticles: [
      {
        slug: "tech-wizard-dominates",
        title: "Tech Wizard's Statistical Dominance Continues",
        date: "2 days ago",
        sentiment: "positive",
        views: 12400,
      },
      {
        slug: "rookie-analysis",
        title: "Rookie Class Performance Analysis Q4",
        date: "5 days ago",
        sentiment: "neutral",
        views: 8900,
      },
      {
        slug: "choke-rate-study",
        title: "Choke Rate Study: What The Data Reveals",
        date: "1 week ago",
        sentiment: "neutral",
        views: 15600,
      },
    ],
    battlerRelationships: [
      { name: "Tech Wizard", sentiment: "positive", articleCount: 24 },
      { name: "Young Pattern", sentiment: "neutral", articleCount: 18 },
      { name: "Verbal Venom", sentiment: "negative", articleCount: 12 },
    ],
  },
  "bar-examiner": {
    id: "bar-examiner",
    name: "The Bar Examiner",
    avatar: "/blogger-avatar-hip-hop-journalist-microphone.jpg",
    outlet: "Battle Rap Weekly",
    bio: "25 years in the culture. Seen every era, every style, every legend rise and fall. My takes are earned, not given.",
    credibility: 92,
    followers: 78500,
    articlesWritten: 1247,
    specialties: ["Historical Context", "Lyricism Breakdown", "Legend Comparisons"],
    stance: "critical",
    recentArticles: [
      {
        slug: "young-pattern-responds",
        title: "Young Pattern's Response Falls Flat",
        date: "1 day ago",
        sentiment: "negative",
        views: 23100,
      },
      {
        slug: "golden-era-comparison",
        title: "How Today's Battlers Stack Up To The Golden Era",
        date: "4 days ago",
        sentiment: "neutral",
        views: 31200,
      },
      {
        slug: "overrated-list",
        title: "The 5 Most Overrated Battlers Right Now",
        date: "1 week ago",
        sentiment: "negative",
        views: 45800,
      },
    ],
    battlerRelationships: [
      { name: "Tech Wizard", sentiment: "neutral", articleCount: 31 },
      { name: "Young Pattern", sentiment: "negative", articleCount: 28 },
      { name: "Verbal Venom", sentiment: "positive", articleCount: 19 },
    ],
  },
}

export default function BloggerProfilePage() {
  const params = useParams()
  const bloggerId = params.id as string
  const [activeTab, setActiveTab] = useState("articles")

  const blogger = mockBloggers[bloggerId] || mockBloggers["algorithm-institute"]

  const stanceColors = {
    supportive: "text-green-400",
    critical: "text-red-400",
    neutral: "text-zinc-400",
  }

  const sentimentColors = {
    positive: "bg-green-500/20 text-green-400 border-green-500/30",
    negative: "bg-red-500/20 text-red-400 border-red-500/30",
    neutral: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/media">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO MEDIA
            </Button>
          </Link>
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Blogger Profile</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Blogger Hero */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-zinc-700">
                  <img
                    src={blogger.avatar || "/placeholder.svg"}
                    alt={blogger.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-zinc-100">{blogger.name}</h1>
                  <p className="text-sm text-zinc-500">{blogger.outlet}</p>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed">{blogger.bio}</p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2">
                  {blogger.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="outline"
                      className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-xl font-bold">{blogger.credibility}</span>
                </div>
                <span className="text-xs text-zinc-500 uppercase">Credibility</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xl font-bold">{(blogger.followers / 1000).toFixed(1)}K</span>
                </div>
                <span className="text-xs text-zinc-500 uppercase">Followers</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xl font-bold">{blogger.articlesWritten}</span>
                </div>
                <span className="text-xs text-zinc-500 uppercase">Articles</span>
              </div>
              <div className="text-center">
                <div className={`flex items-center justify-center gap-1 mb-1 ${stanceColors[blogger.stance]}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xl font-bold capitalize">{blogger.stance}</span>
                </div>
                <span className="text-xs text-zinc-500 uppercase">General Stance</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900 border border-zinc-800 w-full justify-start">
            <TabsTrigger value="articles" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Recent Articles
            </TabsTrigger>
            <TabsTrigger
              value="relationships"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Battler Coverage
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="mt-4 space-y-3">
            {blogger.recentArticles.map((article) => (
              <Link key={article.slug} href={`/media/${article.slug}`}>
                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-zinc-100 hover:text-orange-400 transition-colors">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                          <span>{article.date}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Badge className={`${sentimentColors[article.sentiment]} text-xs`}>{article.sentiment}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            <Button
              variant="outline"
              className="w-full border-zinc-700 text-zinc-400 hover:text-zinc-100 bg-transparent"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View All Articles
            </Button>
          </TabsContent>

          {/* Relationships Tab */}
          <TabsContent value="relationships" className="mt-4 space-y-3">
            <p className="text-sm text-zinc-500 mb-4">
              How this blogger covers different battlers based on article sentiment history.
            </p>

            {blogger.battlerRelationships.map((relationship) => (
              <Card key={relationship.name} className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-sm font-bold text-zinc-400">
                          {relationship.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-zinc-100">{relationship.name}</h4>
                        <span className="text-xs text-zinc-500">{relationship.articleCount} articles</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={`${sentimentColors[relationship.sentiment]} text-xs`}>
                        {relationship.sentiment === "positive"
                          ? "Favorable"
                          : relationship.sentiment === "negative"
                            ? "Critical"
                            : "Balanced"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Credibility Note */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-zinc-300">About Blogger Credibility</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Credibility scores reflect accuracy of predictions, consistency of takes, and community trust.
                  High-credibility bloggers have more influence on your public perception.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
