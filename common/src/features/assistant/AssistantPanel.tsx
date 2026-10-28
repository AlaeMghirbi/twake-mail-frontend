import { Typography, useColorScheme } from '@linagora/twake-mui'
import type { ReactElement } from 'react'

import { SidePanel } from '@/ds/SidePanel/SidePanel'
import { useComposer } from '@common/features/composer/ComposerProvider'
import { useNotify } from '@common/features/notifications/NotificationsProvider'
import {
  usePlatformSdk,
  usePlatformStatus
} from '@common/features/platform/PlatformProvider'
import { useI18n } from '@common/i18n/useI18n'

import type { AssistantConfig, CapabilityCall } from './assistant'
import { createdDraftId } from './assistantTools'
import { toCapability } from './capabilities'
import { useAssistantPanel } from './AssistantProvider'
import { useAssistantIntent } from './useAssistantIntent'
import { useAssistantTools } from './useAssistantTools'
import { useRunAssistantTool } from './useRunAssistantTool'

export function AssistantPanel(): ReactElement {
  const { t } = useI18n()
  const { close } = useAssistantPanel()
  const sdk = usePlatformSdk()
  const isPlatformReady = usePlatformStatus() === 'ready'
  const tools = useAssistantTools()
  const { colorScheme = 'light' } = useColorScheme()
  const config: AssistantConfig | null = tools.isPending
    ? null
    : {
        capabilities: (tools.data ?? []).map(tool => toCapability(tool, t)),
        theme: { type: colorScheme }
      }
  const runTool = useRunAssistantTool()
  const { openComposer } = useComposer()
  const { notify } = useNotify()

  const handleCall = (call: CapabilityCall): void => {
    const notifyFailure = (): void => {
      notify({ message: t('assistant.toolFailed'), severity: 'error' })
    }
    runTool(call)
      .then(outcome => {
        if (!outcome.ok) {
          notifyFailure()
          return
        }
        const draftId =
          call.capability === 'create_draft'
            ? createdDraftId(outcome.content)
            : null
        if (draftId !== null) openComposer({ draftId })
      })
      .catch(notifyFailure)
  }
  const { state, frameRef } = useAssistantIntent(
    isPlatformReady ? sdk : null,
    config,
    { onCall: handleCall, onCancel: close }
  )

  const hasFailed = state.status === 'failed' || state.status === 'closed'
  return (
    <SidePanel
      label={t('assistant.panel')}
      src={state.status === 'open' ? state.service.href : null}
      frameTitle={t('assistant.frameTitle')}
      isReady={state.status === 'open' && state.isReady}
      loadingLabel={t('assistant.loading')}
      onClose={close}
      closeLabel={t('common.close')}
      message={
        hasFailed ? <Typography>{t('assistant.error')}</Typography> : undefined
      }
      frameRef={frameRef}
      allow="clipboard-write"
      data-testid="assistant-panel"
      frameTestId="assistant-frame"
    />
  )
}
