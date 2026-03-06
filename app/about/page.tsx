'use client'

import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Play, Heart, Users, Zap, Music, Tv2, Share2, Mail, MessageCircle, Music2, Youtube } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-8">
        <Header />

        <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1500px] flex-col gap-10 px-6 pb-8">
          {/* Hero Section */}
          <div className="text-center py-8">
            <h1 className="text-white text-4xl font-bold text-balance">About Streamfy</h1>
            <p className="text-gray-400 text-lg mt-3 text-pretty">Your Ultimate Entertainment Streaming Platform</p>
          </div>

          {/* Mission Section */}
          <section>
            <h2 className="text-[#f4a30a] text-xl font-bold mb-3">Our Mission</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Streamfy is dedicated to bringing the world of entertainment directly to your fingertips.
              We believe everyone deserves access to premium content -- music, sports, and movies --
              all in one seamless, user-friendly platform. Our mission is to revolutionize how people
              discover and enjoy entertainment content.
            </p>
          </section>

          {/* What We Offer */}
          <section>
            <h2 className="text-white text-xl font-bold mb-4">What We Offer</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <OfferingCard icon={Music} title="Music Streaming" description="Access millions of songs, curated playlists, and discover new artists" />
              <OfferingCard icon={Share2} title="Live Sports" description="Watch live matches, highlights, and exclusive sports content" />
              <OfferingCard icon={Tv2} title="Movies & Shows" description="Stream blockbusters, series, and exclusive original content" />
            </div>
          </section>

          {/* Features Section */}
          <section>
            <h2 className="text-white text-xl font-bold mb-4">Why Choose Streamfy?</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureItem title="HD Quality" description="Enjoy crystal-clear video and audio" />
              <FeatureItem title="Multi-device" description="Watch on any device, anytime, anywhere" />
              <FeatureItem title="Personalized" description="AI-powered recommendations just for you" />
              <FeatureItem title="No Ads" description="Uninterrupted entertainment experience" />
            </div>
          </section>

          {/* Stats Section */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard number="10M+" label="Active Users" />
            <StatCard number="50K+" label="Songs" />
            <StatCard number="1000+" label="Live Events" />
            <StatCard number="5000+" label="Movies" />
          </div>

          {/* Team Section */}
          <section>
            <h2 className="text-white text-xl font-bold mb-3">Our Team</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Founded in 2023, Streamfy was created by a passionate team of entertainment and technology enthusiasts
              dedicated to transforming the streaming industry. With experts in software development, content curation,
              and user experience design, we are committed to delivering the best streaming experience possible.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-3">
              Our team continues to grow and innovate, working tirelessly to add new features, expand our content library,
              and ensure that Streamfy remains at the forefront of the streaming revolution.
            </p>
          </section>

          {/* Contact Section */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <h2 className="text-white text-xl font-bold mb-2">Get In Touch</h2>
            <p className="text-gray-400 text-sm mb-5">
              {"Have questions or feedback? We'd love to hear from you!"}
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 bg-[#f4a30a] text-black px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                <Mail size={14} /> Contact Us
              </button>
              <span className="text-gray-500 text-sm">Follow Us</span>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <Music2 size={14} />
                </button>
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <MessageCircle size={14} />
                </button>
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <Youtube size={14} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function OfferingCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number }>
  title: string
  description: string
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:bg-white/10 transition-colors">
      <div className="w-12 h-12 rounded-full bg-[#f4a30a]/10 flex items-center justify-center mx-auto mb-3">
        <Icon size={20} />
      </div>
      <h3 className="text-white font-medium text-sm">{title}</h3>
      <p className="text-gray-400 text-xs mt-1 leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="w-2 h-2 rounded-full bg-[#f4a30a] mt-1.5 flex-shrink-0" />
      <div>
        <h3 className="text-white text-sm font-medium">{title}</h3>
        <p className="text-gray-400 text-xs mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
      <p className="text-[#f4a30a] text-2xl font-bold">{number}</p>
      <p className="text-gray-400 text-xs mt-1">{label}</p>
    </div>
  )
}
