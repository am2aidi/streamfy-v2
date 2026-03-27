import { NextResponse } from 'next/server'
import { getTranslation, type Language, type TranslationKey } from '@/lib/translations'

type PlanId = 'movie' | 'day' | 'week' | 'twoWeeks' | 'month'
type PlanIcon = 'Star' | 'Zap' | 'CreditCard'

const planDefs: Array<{
  id: PlanId
  priceRwf: number
  icon: PlanIcon
  popular: boolean
  labelKey: TranslationKey
  descKey: TranslationKey
}> = [
  { id: 'movie', priceRwf: 100, icon: 'Star', popular: false, labelKey: 'planMovieLabel', descKey: 'planMovieDesc' },
  { id: 'day', priceRwf: 200, icon: 'Zap', popular: true, labelKey: 'planDayLabel', descKey: 'planDayDesc' },
  { id: 'week', priceRwf: 400, icon: 'CreditCard', popular: false, labelKey: 'planWeekLabel', descKey: 'planWeekDesc' },
  { id: 'twoWeeks', priceRwf: 700, icon: 'CreditCard', popular: false, labelKey: 'planTwoWeeksLabel', descKey: 'planTwoWeeksDesc' },
  { id: 'month', priceRwf: 1000, icon: 'CreditCard', popular: false, labelKey: 'planMonthLabel', descKey: 'planMonthDesc' },
]

function getLang(req: Request): Language {
  const url = new URL(req.url)
  const lang = url.searchParams.get('lang')
  if (lang === 'fr' || lang === 'rw' || lang === 'en') return lang
  return 'en'
}

export async function GET(req: Request) {
  const lang = getLang(req)

  return NextResponse.json({
    language: lang,
    plans: planDefs.map((p) => ({
      id: p.id,
      priceRwf: p.priceRwf,
      icon: p.icon,
      popular: p.popular,
      label: getTranslation(lang, p.labelKey),
      desc: getTranslation(lang, p.descKey),
    })),
  })
}

