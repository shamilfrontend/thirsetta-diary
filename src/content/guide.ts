export type GuideIcon = 'syringe' | 'sliders' | 'scale' | 'person' | 'flask' | 'calendar' | 'alert'

export type GuideFact = {
  icon: GuideIcon
  label: string
  caption: string
}

export type GuideBlock = {
  title: string
  items: string[]
  tone?: 'alert'
}

export type GuideStep = {
  icon: GuideIcon
  title: string
  lead: string
  facts: GuideFact[]
  blocks: GuideBlock[]
  note: string
  tone?: 'alert'
  layout?: 'intro'
}

export const guideSteps: GuideStep[] = [
  {
    icon: 'syringe',
    title: 'Дневник, не врач',
    lead: 'Приложение записывает уколы, дозу и вес. Оно не подбирает дозу и не заменяет очный приём.',
    facts: [
      { icon: 'syringe', label: 'Уколы', caption: 'Дата и время каждой отметки' },
      { icon: 'sliders', label: 'Доза', caption: 'Текущая ступень курса' },
      { icon: 'scale', label: 'Вес', caption: 'Как меняется со временем' },
    ],
    blocks: [],
    note: '',
    layout: 'intro',
  },
  {
    icon: 'person',
    title: 'Сначала эндокринолог',
    lead: 'До первого укола нужен врач, который знает вашу историю.',
    facts: [],
    blocks: [
      {
        title: 'О чём сказать на приёме',
        items: [
          'Щитовидная железа, в том числе медуллярный рак и синдром МЭН-2 в семье',
          'Панкреатит',
          'Желчный пузырь',
          'Беременность и кормление',
          'Другие препараты от диабета',
        ],
      },
    ],
    note: 'Дозу и то, можно ли начинать, решает только он.',
  },
  {
    icon: 'flask',
    title: 'Какие анализы обсудить',
    lead: 'Это то, что стоит принести на приём, а не обязательный набор.',
    facts: [],
    blocks: [
      {
        title: 'Обычно до старта',
        items: [
          'Глюкоза и гликированный гемоглобин',
          'Липиды',
          'ТТГ',
          'Печень: АЛТ, АСТ',
          'Почки: креатинин, СКФ',
          'Общий анализ крови',
        ],
      },
      {
        title: 'По ситуации',
        items: ['Тест на беременность', 'Амилаза и липаза', 'Кальцитонин'],
      },
    ],
    note: '',
  },
  {
    icon: 'calendar',
    title: 'Как устроен курс',
    lead: 'Укол делают подкожно, раз в неделю, в один и тот же день.',
    facts: [],
    blocks: [
      {
        title: 'Что важно',
        items: [
          'Ступени 2,5–15 мг уже есть в приложении',
          'Повышать их можно только по схеме врача',
          'В дневнике отмечают сам укол, дозу и вес',
        ],
      },
    ],
    note: '',
  },
  {
    icon: 'alert',
    title: 'На что смотреть',
    lead: 'Часто бывают тошнота, запор или послабление, снижение аппетита.',
    facts: [],
    blocks: [
      {
        title: 'К врачу сразу',
        tone: 'alert',
        items: [
          'Сильная постоянная боль в животе',
          'Признаки обезвоживания',
          'Сыпь или отёк',
          'Резкая слабость, если параллельно принимаются другие сахароснижающие',
        ],
      },
    ],
    note: '',
    tone: 'alert',
  },
]
