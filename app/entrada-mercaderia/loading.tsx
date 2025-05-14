import { TopBar } from "@/components/top-bar"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-80 bg-gray-200 rounded animate-pulse mt-2"></div>
            </div>

            <div className="flex gap-3">
              <div className="h-10 w-80 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="h-12 w-80 bg-gray-200 rounded animate-pulse"></div>

          <div className="border rounded-lg p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>

            <div className="mt-8">
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
