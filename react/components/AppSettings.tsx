import type { FC } from 'react'
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { useIntl } from 'react-intl'
import type { NumberInputValue } from '@vtex/admin-ui'
import { RadioGroup } from 'vtex.styleguide'
import {
  Page,
  PageHeader,
  PageHeaderTop,
  PageHeaderTitle,
  PageContent,
  Box,
  Button,
  NumberInput,
  Skeleton,
  useToast,
} from '@vtex/admin-ui'

import { adminMessages } from '../utils/messages'
import APP_SETTINGS from '../graphql/getAppSettings.graphql'
import SAVE_APP_SETTINGS from '../graphql/saveAppSettings.graphql'

const AppSettings: FC = () => {
  const { formatMessage } = useIntl()
  const showToast = useToast()

  const [settingsState, setSettingsState] = useState({
    cartLifeSpan: 30,
  })

  const [state, setState] = useState({
    value: 'marketplace',
  })

  const [settingsLoading, setSettingsLoading] = useState(false)

  const { data, loading } = useQuery(APP_SETTINGS, {
    ssr: false,
    onCompleted: (insideData) => {
      if (insideData?.getAppSettings?.adminSetup) {
        setSettingsState(insideData.getAppSettings.adminSetup)
      }
    },
  })

  const [saveSettings] = useMutation(SAVE_APP_SETTINGS)

  useEffect(() => {
    if (!data?.getAppSettings?.adminSetup) return

    setSettingsState(data.getAppSettings.adminSetup)
  }, [data])

  const handleSaveSettings = () => {
    setSettingsLoading(true)

    saveSettings({
      variables: {
        input: settingsState,
      },
    })
      .then(() => {
        showToast({
          message: formatMessage(adminMessages.saveSettingsSuccess),
          duration: 5000,
        })
        setSettingsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        showToast({
          message: formatMessage(adminMessages.saveSettingsFailure),
          duration: 5000,
          tone: 'critical',
        })
        setSettingsLoading(false)
      })
  }

  return (
    <Page>
      <PageHeader>
        <PageHeaderTop>
          <PageHeaderTitle>
            {formatMessage(adminMessages.settingsPageTitle)}
          </PageHeaderTitle>
        </PageHeaderTop>
      </PageHeader>
      {loading && <Skeleton shape="rect" />}
      {data?.getAppSettings?.adminSetup && (
        <PageContent
          csx={{
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '720px',
            width: '100%',
          }}
        >
          <Box>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
              Expiration Period for Quotes and Saved Carts
            </h3>
          </Box>
          <Box as="section" csx={{ marginBottom: 32 }}>
            <NumberInput
              value={settingsState.cartLifeSpan}
              label={formatMessage(adminMessages.cartLifeSpanLabel)}
              min={1}
              onBlur={() => {
                if (settingsState.cartLifeSpan < 1) {
                  setSettingsState({
                    ...settingsState,
                    cartLifeSpan: 1,
                  })
                }
              }}
              onChange={(value: NumberInputValue) => {
                setSettingsState({
                  ...settingsState,
                  cartLifeSpan: Number(value),
                })
              }}
            />
          </Box>
          <Box as="section" csx={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
              Quote Management for Marketplace
            </h3>
            <p style={{ fontSize: '0.875rem' }} className="c-muted-1 mt1">
              Configure how quotes are managed in the marketplace.
            </p>
            <p style={{ fontSize: '0.875rem' }} className="c-muted-1 mt6 mb4">
              Who is responsible for managing quotes?
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <RadioGroup
                hideBorder
                name="paymentMethods"
                options={[
                  {
                    value: 'marketplace',
                    label: (
                      <div>
                        <span style={{ fontSize: '0.875rem' }}>
                          Marketplace
                        </span>
                        <p
                          style={{ fontSize: '0.75rem' }}
                          className="c-muted-1"
                        >
                          Only the main marketplace manages quotes.
                        </p>
                      </div>
                    ),
                  },
                  {
                    value: 'sellers',
                    label: (
                      <div>
                        <span style={{ fontSize: '0.875rem' }}>Sellers</span>
                        <p
                          style={{ fontSize: '0.75rem' }}
                          className="c-muted-1"
                        >
                          Sellers manage quotes for their own products and can
                          choose not to account quotes
                        </p>
                      </div>
                    ),
                  },
                ]}
                value={state.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setState({ value: e.currentTarget.value })
                }
              />
            </div>
          </Box>
          <Box csx={{ marginTop: 16 }}>
            <Button
              disabled={settingsState.cartLifeSpan < 1}
              variant="primary"
              onClick={() => handleSaveSettings()}
              loading={settingsLoading}
            >
              {formatMessage(adminMessages.saveSettingsButtonText)}
            </Button>
          </Box>
        </PageContent>
      )}
    </Page>
  )
}

export default AppSettings
