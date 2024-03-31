import * as Dialog from '@radix-ui/react-dialog'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  FileDown,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { CreateTagForm } from './components/create-tag-form'
import { Header } from './components/header'
import { Pagination } from './components/pagination'
import { Tabs } from './components/tabs'
import { Button } from './components/ui/button'
import { Control, Input } from './components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table'

export interface Tag {
  title: string
  slug: string
  amountOfVideos: number
  id: string
}

export interface TagResponse {
  first: number
  prev: number | null
  next: number
  last: number
  pages: number
  items: number
  data: Tag[]
}

export const App = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tagFilter, setTagFilter] = useState('')

  const page = Number(searchParams.get('page') ?? 1)
  const urlTagFilter = searchParams.get('tag') ?? ''
  const INTERVAL_10S = 1000 * 10

  const {
    data: tagsResponse,
    isLoading,
    isFetching,
  } = useQuery<TagResponse>({
    queryKey: ['get-tags', page, urlTagFilter],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3333/tags?_page=${page}&_per_page=10&title=${urlTagFilter}`,
      )
      const data = await response.json()
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return data
    },
    placeholderData: keepPreviousData,
    staleTime: INTERVAL_10S,
  })

  const handleTagFilter = () => {
    setSearchParams((params) => {
      params.set('page', '1')
      params.set('tag', tagFilter)
      return params
    })
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="py-10 space-y-8">
      <div>
        <Header />
        <Tabs />
      </div>
      <main className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Tags</h1>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="primary">
                <Plus className="size-3" />
                Create new
              </Button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/70" />
              <Dialog.Content className="fixed space-y-10 p-10 right-0 top-0 bottom-0 h-screen min-w-[320px] z-10 bg-zinc-950 border-l border-zinc-900">
                <div className="space-y-3">
                  <Dialog.Title className="text-xl font-bold">
                    Create tag
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-zinc-500">
                    Tags can be used to group videos about similar concepts.
                  </Dialog.Description>
                </div>

                <CreateTagForm />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          {isFetching && (
            <Loader2 className="size-4 animate-spin text-zinc-500" />
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input variant="filter">
              <Search className="size-3" />
              <Control
                placeholder="Search tags..."
                onChange={(e) => setTagFilter(e.target.value)}
                value={tagFilter}
              />
            </Input>
            <Button onClick={handleTagFilter}>
              <Filter className="size-3" />
              Filtrar por tag
            </Button>
          </div>
          <Button>
            <FileDown className="size-3" /> Export
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Amount of videos</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!!tagsResponse &&
              tagsResponse.data.map((tag) => {
                return (
                  <TableRow key={tag.id}>
                    <TableCell></TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{tag.title}</span>
                        <span className="text-xs text-zinc-500">{tag.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {tag.amountOfVideos} vídeo(s)
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
        {!!tagsResponse && (
          <Pagination
            page={page}
            pages={tagsResponse.pages}
            items={tagsResponse.items}
          />
        )}
      </main>
    </div>
  )
}
