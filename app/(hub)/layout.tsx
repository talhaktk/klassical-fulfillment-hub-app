import Topbar from '@/components/layout/Topbar'
import Sidebar from '@/components/layout/Sidebar'
import AppProvider from '@/components/AppProvider'

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#F4F6FA]">
            {children}
          </main>
        </div>
      </div>
    </AppProvider>
  )
}
