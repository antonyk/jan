import React, { Fragment, useState } from 'react'

import { RemoteEngine, RemoteEngines } from '@janhq/core'

import { useAtomValue, useSetAtom } from 'jotai'
import { twMerge } from 'tailwind-merge'

import useModelHub, { ModelHubCategory } from '@/hooks/useModelHub'

import { HfModelEntry } from '@/utils/huggingface'

import BuiltInModelGroup from './components/BuiltInModelGroup'
import DetailModelGroup from './components/DetailModelGroup'
import Filter from './components/Filter'
import HuggingFaceModelGroup from './components/HuggingFaceModelGroup'
import LoadingIndicator from './components/LoadingIndicator'
import ModelSearchBar from './components/ModelSearchBar'
import RemoteModelGroup from './components/RemoteModelGroup'
import SidebarFilter from './components/SidebarFilter'
import Slider from './components/Slider'

import {
  reduceTransparentAtom,
  showSidbarFilterAtom,
} from '@/helpers/atoms/Setting.atom'

export const ModelFilters = ['All', 'On-device', 'Cloud'] as const
export type ModelFilter = (typeof ModelFilters)[number]

const HubScreen2: React.FC = () => {
  const [filter, setFilter] = useState<ModelFilter>('All')
  const setShowSidebarFilter = useSetAtom(showSidbarFilterAtom)

  const showSidebarFilter = useAtomValue(showSidbarFilterAtom)
  const reduceTransparent = useAtomValue(reduceTransparentAtom)
  const [detailCategory, setDetailCategory] = useState<
    ModelHubCategory | undefined
  >(undefined)
  const { data, isLoading } = useModelHub()

  if (isLoading) return <LoadingIndicator />
  if (!data) return <div>Failed to fetch models</div>

  const engineModelMap = new Map<typeof RemoteEngines, HfModelEntry[]>()
  Object.entries(data.modelCategories).forEach(([key, value]) => {
    if (key !== 'HuggingFace' && key !== 'BuiltInModels') {
      engineModelMap.set(key as unknown as typeof RemoteEngines, value)
    }
  })

  if (detailCategory) {
    return (
      <DetailModelGroup
        category={detailCategory}
        onBackClicked={() => setDetailCategory(undefined)}
      />
    )
  }

  const shouldShowRemoteModel = filter === 'All' || filter === 'Cloud'
  const shouldShowLocalModel = filter === 'All' || filter === 'On-device'

  return (
    <div
      className={twMerge(
        'relative flex h-full w-full overflow-hidden pr-1.5',
        !reduceTransparent && showSidebarFilter && 'border-l'
      )}
    >
      {showSidebarFilter && <SidebarFilter />}
      <div
        className={twMerge(
          'h-full flex-1 flex-shrink-0 gap-12 overflow-x-hidden rounded-lg border border-[hsla(var(--app-border))] bg-[hsla(var(--app-bg))] text-[hsla(var(--text-primary))]'
        )}
      >
        <ModelSearchBar />
        <Slider />
        <div className="mx-4 px-12">
          <Filter
            currentFilter={filter}
            callback={() => setShowSidebarFilter(!showSidebarFilter)}
            onFilterClicked={(newFilter) => setFilter(newFilter)}
          />

          {shouldShowLocalModel && (
            <Fragment>
              <BuiltInModelGroup
                onSeeAllClick={() => setDetailCategory('BuiltInModels')}
              />
              <HuggingFaceModelGroup
                onSeeAllClick={() => setDetailCategory('HuggingFace')}
              />
            </Fragment>
          )}

          {shouldShowRemoteModel &&
            Array.from(engineModelMap.entries()).map(([engine, models]) => (
              <RemoteModelGroup
                key={engine as unknown as string}
                data={models}
                engine={engine as unknown as RemoteEngine}
                onSeeAllClick={() =>
                  setDetailCategory(engine as unknown as ModelHubCategory)
                }
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export default HubScreen2