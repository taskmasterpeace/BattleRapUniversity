export default function CityDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero skeleton */}
      <div className="aspect-square sm:aspect-video max-h-[400px] w-full bg-zinc-900 animate-pulse" />

      {/* Stats bar skeleton */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-4 w-16 mx-auto bg-zinc-800 rounded animate-pulse mb-2" />
                <div className="h-8 w-12 mx-auto bg-zinc-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="h-24 bg-zinc-900 rounded-lg animate-pulse" />
        <div className="h-64 bg-zinc-900 rounded-lg animate-pulse" />
        <div className="h-48 bg-zinc-900 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
