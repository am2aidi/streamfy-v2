'use client'

import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Play, Heart, Users, Zap, Music, Tv2, Share2, Mail, MessageCircle, Music2, Youtube } from 'lucide-react'
import { useAppSettings } from '@/components/AppSettingsProvider'
import { getTranslation, type Language } from '@/lib/translations'

export default function AboutPage() {
  const { settings } = useAppSettings()
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key)

  const copy: Record<Language, {
    subtitle: string
    missionTitle: string
    missionBody: string
    offerTitle: string
    offers: Array<{ title: string; desc: string }>
    whyTitle: string
    features: Array<{ title: string; desc: string }>
    stats: Array<{ number: string; label: string }>
    teamTitle: string
    teamBody1: string
    teamBody2: string
    touchTitle: string
    touchBody: string
  }> = {
    en: {
      subtitle: 'Your Ultimate Entertainment Streaming Platform',
      missionTitle: 'Our Mission',
      missionBody:
        'Streamfy is dedicated to bringing the world of entertainment directly to your fingertips. We believe everyone deserves access to premium content — music, sports, and movies — all in one seamless, user-friendly platform. Our mission is to revolutionize how people discover and enjoy entertainment content.',
      offerTitle: 'What We Offer',
      offers: [
        { title: 'Music Streaming', desc: 'Access millions of songs, curated playlists, and discover new artists' },
        { title: 'Live Sports', desc: 'Watch live matches, highlights, and exclusive sports content' },
        { title: 'Movies & Shows', desc: 'Stream blockbusters, series, and exclusive original content' },
      ],
      whyTitle: 'Why Choose Streamfy?',
      features: [
        { title: 'HD Quality', desc: 'Enjoy crystal-clear video and audio' },
        { title: 'Multi-device', desc: 'Watch on any device, anytime, anywhere' },
        { title: 'Personalized', desc: 'Smart recommendations tailored for you' },
        { title: 'No Ads', desc: 'Uninterrupted entertainment experience' },
      ],
      stats: [
        { number: '10M+', label: 'Active Users' },
        { number: '50K+', label: 'Songs' },
        { number: '1000+', label: 'Live Events' },
        { number: '5000+', label: 'Movies' },
      ],
      teamTitle: 'Our Team',
      teamBody1:
        'Founded in 2023, Streamfy was created by a passionate team of entertainment and technology enthusiasts dedicated to transforming the streaming industry.',
      teamBody2:
        'Our team continues to grow and innovate, working tirelessly to add new features, expand our content library, and deliver the best experience possible.',
      touchTitle: 'Get In Touch',
      touchBody: "Have questions or feedback? We'd love to hear from you!",
    },
    fr: {
      subtitle: 'Votre plateforme de streaming tout-en-un',
      missionTitle: 'Notre mission',
      missionBody:
        "Streamfy a pour mission d'apporter le divertissement au bout de vos doigts. Films, sport en direct et musique tendance — tout dans une seule plateforme simple et moderne.",
      offerTitle: 'Ce que nous proposons',
      offers: [
        { title: 'Streaming musical', desc: 'Des chansons, des playlists et la decouverte de nouveaux artistes' },
        { title: 'Sport en direct', desc: 'Matchs en direct, moments forts et contenus exclusifs' },
        { title: 'Films & series', desc: 'Blockbusters, series et contenus originaux' },
      ],
      whyTitle: 'Pourquoi Streamfy ?',
      features: [
        { title: 'Qualite HD', desc: 'Une image et un son limpides' },
        { title: 'Multi-appareils', desc: 'Regardez partout, a tout moment' },
        { title: 'Personnalise', desc: 'Des recommandations adaptees' },
        { title: 'Sans pub', desc: 'Une experience sans interruption' },
      ],
      stats: [
        { number: '10M+', label: 'Utilisateurs actifs' },
        { number: '50K+', label: 'Chansons' },
        { number: '1000+', label: 'Evenements live' },
        { number: '5000+', label: 'Films' },
      ],
      teamTitle: 'Notre equipe',
      teamBody1:
        "Fonde en 2023, Streamfy est porte par une equipe passionnee de technologie et de divertissement, avec l'objectif de moderniser le streaming.",
      teamBody2:
        "Nous continuons d'innover pour ajouter des fonctionnalites, enrichir le catalogue et ameliorer l'experience utilisateur.",
      touchTitle: 'Contactez-nous',
      touchBody: "Une question ou un commentaire ? Nous serions ravis d'echanger avec vous !",
    },
    rw: {
      subtitle: 'Urubuga rwawe rwo kureba no kumva ibikurangaza',
      missionTitle: 'Intego yacu',
      missionBody:
        'Streamfy igamije kwegereza abantu filime, siporo iri live n’umuziki—byose ku rubuga rumwe rworoshye kandi rugaragara neza.',
      offerTitle: 'Ibyo dutanga',
      offers: [
        { title: 'Umuziki', desc: 'Indirimbo nyinshi, playlist zateguwe, n’abahanzi bashya' },
        { title: 'Siporo iri live', desc: 'Reba imikino live, highlights n’ibindi byihariye' },
        { title: 'Filime & series', desc: 'Reba filime, series n’ibindi bikunzwe' },
      ],
      whyTitle: 'Impamvu wahitamo Streamfy',
      features: [
        { title: 'Ubwiza bwa HD', desc: 'Video n’amajwi bisobanutse' },
        { title: 'Ku bikoresho byose', desc: 'Rebera aho uri hose, igihe icyo ari cyo cyose' },
        { title: 'Byakugenewe', desc: 'Inama z’ibyo wakunda' },
        { title: 'Nta matangazo', desc: 'Kureba no kumva nta kubangamirwa' },
      ],
      stats: [
        { number: '10M+', label: 'Abakoresha' },
        { number: '50K+', label: 'Indirimbo' },
        { number: '1000+', label: 'Live events' },
        { number: '5000+', label: 'Filime' },
      ],
      teamTitle: 'Ikipe yacu',
      teamBody1:
        'Yashinzwe mu 2023, Streamfy yubatse n’ikipe ikunda ikoranabuhanga n’imyidagaduro, ifite intego yo kuvugurura uburyo abantu bareba streaming.',
      teamBody2:
        'Dukomeza kunoza serivisi, kongera ibikubiyemo, no gutanga ubunararibonye bwiza ku bakoresha.',
      touchTitle: 'Twandikire',
      touchBody: 'Ufite ikibazo cyangwa igitekerezo? Twishimira kukumva!',
    },
  }

  const c = copy[settings.language]

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="ml-[92px] w-[calc(100vw-92px)] min-h-[100dvh] overflow-x-hidden pb-8">
        <Header />

        <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-[1500px] flex-col gap-10 px-6 pb-8">
          {/* Hero Section */}
          <div className="text-center py-8">
            <h1 className="text-white text-4xl font-bold text-balance">{t('aboutStreamfyTitle')}</h1>
            <p className="text-gray-400 text-lg mt-3 text-pretty">{c.subtitle}</p>
          </div>

          {/* Mission Section */}
          <section>
            <h2 className="text-[#f4a30a] text-xl font-bold mb-3">{c.missionTitle}</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{c.missionBody}</p>
          </section>

          {/* What We Offer */}
          <section>
            <h2 className="text-white text-xl font-bold mb-4">{c.offerTitle}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <OfferingCard icon={Music} title={c.offers[0].title} description={c.offers[0].desc} />
              <OfferingCard icon={Share2} title={c.offers[1].title} description={c.offers[1].desc} />
              <OfferingCard icon={Tv2} title={c.offers[2].title} description={c.offers[2].desc} />
            </div>
          </section>

          {/* Features Section */}
          <section>
            <h2 className="text-white text-xl font-bold mb-4">{c.whyTitle}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {c.features.map((feature) => (
                <FeatureItem key={feature.title} title={feature.title} description={feature.desc} />
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.stats.map((stat) => (
              <StatCard key={stat.label} number={stat.number} label={stat.label} />
            ))}
          </div>

          {/* Team Section */}
          <section>
            <h2 className="text-white text-xl font-bold mb-3">{c.teamTitle}</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{c.teamBody1}</p>
            <p className="text-gray-300 text-sm leading-relaxed mt-3">{c.teamBody2}</p>
          </section>

          {/* Contact Section */}
          <section className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <h2 className="text-white text-xl font-bold mb-2">{c.touchTitle}</h2>
            <p className="text-gray-400 text-sm mb-5">{c.touchBody}</p>
            <div className="flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 bg-[#f4a30a] text-black px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                <Mail size={14} /> {t('contactUs')}
              </button>
              <span className="text-gray-500 text-sm">{t('followUs')}</span>
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
