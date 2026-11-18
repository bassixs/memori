export type PlatformId = 'vk' | 'telegram' | 'max' | 'ok'

/**
 * pending   — данные о размещении ещё не предоставлены (по умолчанию)
 * planned   — размещение запланировано
 * published — ролики опубликованы (ссылки — в films.ts → publications)
 */
export type PlatformStatus = 'pending' | 'planned' | 'published'

export interface Platform {
  id: PlatformId
  name: string
  mark: string
  status: PlatformStatus
  /** Ссылка на сообщество / канал проекта на площадке, если есть */
  url: string | null
}

export const platforms: Platform[] = [
  { id: 'vk', name: 'ВКонтакте', mark: 'VK', status: 'published', url: 'https://vk.ru/club204895491' },
  { id: 'telegram', name: 'Telegram', mark: 'TG', status: 'published', url: 'https://t.me/klg_alarm' },
  { id: 'max', name: 'MAX', mark: 'MX', status: 'published', url: 'https://max.ru/klg_alarm' },
  { id: 'ok', name: 'Одноклассники', mark: 'OK', status: 'published', url: 'https://ok.ru/klgalarm' },
]

export const statusLabel: Record<PlatformStatus, string> = {
  pending: 'Ссылки на публикации будут добавлены',
  planned: 'Размещение запланировано',
  published: 'Опубликовано',
}
