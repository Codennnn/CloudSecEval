'use client'

import { OramaCloud, useSearch } from '@oramacloud/react-client'

function SearchComponent() {
  const { results } = useSearch({
    term: '介绍',
    limit: 5,
  })

  return (
    <ul>
      {results?.hits.map((hit) => (
        <li key={hit.id}>
          {hit.id}
        </li>
      ))}
    </ul>
  )
}

export function DocSearch() {
  return (
    <OramaCloud
      apiKey={process.env.NEXT_PUBLIC_ORAMA_API_KEY!}
      endpoint={process.env.NEXT_PUBLIC_ORAMA_ENDPOINT!}
    >
      <SearchComponent />
    </OramaCloud>
  )
}
