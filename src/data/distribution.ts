export type PlatformId = 'vk' | 'telegram' | 'max' | 'ok'

/**
 * pending   — данные о размещении ещё не предоставлены (по умолчанию)
 * planned   — размещение запланировано
 * published — ролики опубликованы (добавьте ссылки в films.ts → publications)
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
  { id: 'vk', name: 'ВКонтакте', mark: 'VK', status: 'pending', url: null },
  { id: 'telegram', name: 'Telegram', mark: 'TG', status: 'pending', url: null },
  { id: 'max', name: 'MAX', mark: 'MX', status: 'pending', url: null },
  { id: 'ok', name: 'Одноклассники', mark: 'OK', status: 'pending', url: null },
]

export const statusLabel: Record<PlatformStatus, string> = {
  pending: 'Данные о размещении ожидаются',
  planned: 'Размещение запланировано',
  published: 'Опубликовано',
}
