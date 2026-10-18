/**
 * 문자열을 검색어 기준으로 쪼갠다. 검색어와 일치하는 조각에 match: true 를 붙인다.
 * 화면에서는 {#each} 로 돌면서 match인 조각만 <mark>로 감싼다.
 * ({@html}로 HTML 문자열을 만들면 XSS 위험이 있으므로 이 방식을 쓴다 — study1)
 *
 *   splitByQuery('Svelte 게시판', 'sve') → [{ text: 'Sve', match: true }, { text: 'lte 게시판', match: false }]
 */
export function splitByQuery(text, query) {
  const q = query.trim()
  if (!q) return [{ text, match: false }]

  const lowerText = text.toLowerCase()
  const lowerQuery = q.toLowerCase()
  const parts = []
  let cursor = 0

  while (cursor < text.length) {
    const found = lowerText.indexOf(lowerQuery, cursor)
    if (found === -1) {
      parts.push({ text: text.slice(cursor), match: false })
      break
    }
    if (found > cursor) parts.push({ text: text.slice(cursor, found), match: false })
    parts.push({ text: text.slice(found, found + q.length), match: true })
    cursor = found + q.length
  }
  return parts
}

/** ISO 날짜 문자열 → '2026. 10. 19.' */
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ko-KR')
}
