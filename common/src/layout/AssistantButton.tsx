import { Icon } from '@linagora/twake-icons'
import { IconButton, Tooltip } from '@linagora/twake-mui'
import type { ReactElement } from 'react'

import { Sparkle } from '@/ds/FlutterIcons/FlutterIcons'
import { hasAiCapability } from '@common/features/ai/aiNeedsAction'
import { useAssistantPanel } from '@common/features/assistant/AssistantProvider'
import { usePlatformStatus } from '@common/features/platform/PlatformProvider'
import { useI18n } from '@common/i18n/useI18n'
import { useJmapSession } from '@common/jmap/JmapSessionProvider'

export function AssistantButton(): ReactElement | null {
  const { t } = useI18n()
  const { isOpen, toggle, openerRef } = useAssistantPanel()
  const isPlatformReady = usePlatformStatus() === 'ready'
  const { session, accountId } = useJmapSession()
  if (!isPlatformReady || !hasAiCapability(session, accountId)) return null
  const label = t('assistant.open')
  return (
    <Tooltip title={label}>
      <IconButton
        ref={openerRef}
        aria-label={label}
        aria-pressed={isOpen}
        onClick={toggle}
        data-testid="top-bar-assistant-button"
      >
        <Icon icon={Sparkle} />
      </IconButton>
    </Tooltip>
  )
}
