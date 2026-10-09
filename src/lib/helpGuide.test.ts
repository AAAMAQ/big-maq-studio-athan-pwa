import { describe, expect, it } from 'vitest'
import { HELP_SECTION_ALIASES, HELP_TOPICS, SALAH_HELP_EXAMPLES } from './helpGuide'
import { parseSalahSearch } from './salahSearch'
import { isScreen } from './navigationIntent'
import markdown from '../../docs/Need Help.md?raw'
import archive from '../../docs/Old Need Help.md?raw'

describe('current help guide contracts', () => {
  it('has unique topics, real destination actions and valid legacy links', () => {
    const ids = new Set(HELP_TOPICS.map(topic => topic.id))
    expect(ids.size).toBe(HELP_TOPICS.length)
    expect(HELP_TOPICS.length).toBe(19)
    for (const topic of HELP_TOPICS) {
      expect(topic.title).toBeTruthy()
      expect(topic.summary).toBeTruthy()
      if (topic.screen) expect(isScreen(topic.screen)).toBe(true)
    }
    for (const id of Object.values(HELP_SECTION_ALIASES)) expect(ids.has(id)).toBe(true)
  })
  it.each(SALAH_HELP_EXAMPLES)('documents parseable current query %s', query => {
    expect(() => parseSalahSearch(query)).not.toThrow()
  })
  it('retains the missing practical details and human touches without promising nonexistent features', () => {
    const guide = JSON.stringify(HELP_TOPICS)
    for (const phrase of ['three-dot menu', 'square with an upward arrow', 'noon shadow', 'High-latitude',
      'unreadable cells', 'All Ayahs', 'Clear Bookmarks', 'Muhammad Asad', 'Pickthall', 'Saheeh International',
      'Yusuf Ali', 'OpenStreetMap', 'TimeAPI', 'AlAdhan', 'Adhan', 'Jumu’ah Mubarak', 'F12',
      'JazakAllahu khairan', 'InshaAllah', 'make dua for everyone', 'shoe size', 'birthday']) {
      expect(guide).toContain(phrase)
    }
    const calculation = HELP_TOPICS.find(topic => topic.id === 'calculation')!
    expect(calculation.parts?.find(part => part.table)?.table?.rows).toHaveLength(12)
    expect(guide).toContain('does not by itself mean you selected Hanafi Asr')
    expect(guide).toContain('not an official')
    for (const topic of HELP_TOPICS) for (const part of [topic, ...topic.parts ?? []]) {
      for (const link of part.links ?? []) expect(new URL(link.url).protocol).toBe('https:')
    }
  })
  it('mirrors all current guide content in Markdown', () => {
    for (const topic of HELP_TOPICS) {
      expect(markdown).toContain(topic.summary)
      for (const part of [topic, ...topic.parts ?? []]) {
        for (const text of [part.title, ...part.paragraphs ?? [], ...part.steps ?? [], ...part.notes ?? [],
          ...part.table?.headers ?? [], ...part.table?.rows.flat() ?? [], ...part.links?.flatMap(link => [link.label, link.url]) ?? [],
          ...part.prompt ? [part.prompt] : []]) expect(markdown).toContain(text)
      }
      for (const [query, meaning] of topic.examples ?? []) {
        expect(markdown).toContain(query)
        expect(markdown).toContain(meaning)
      }
    }
  })
  it('explains shared Qibla maths and distinct platform sensors without guaranteeing accuracy', () => {
    const qibla = HELP_TOPICS.find(topic => topic.id === 'qibla')!
    const guide = JSON.stringify(qibla)
    for (const phrase of ['initial great-circle bearing', '21.4225° N, 39.8262° E',
      'webkitCompassHeading', 'AbsoluteOrientationSensor', 'quaternion', 'screen rotation',
      'Session-relative motion is rejected', 'circular smoothing', 'Neither iPhone nor Android is always more accurate',
      'does not add its own magnetic-declination correction', 'not a promise of ±5° real-world accuracy',
      'webkitCompassAccuracy', 'Physical iPhone and Android checks']) {
      expect(guide).toContain(phrase)
    }
    expect(qibla.parts?.find(part => part.title === 'Why accuracy can differ between phones')?.links).toHaveLength(3)
  })
  it('retains the archived conversion prompt in the current guide', () => {
    const original = archive.split('<!-- BEGIN ORIGINAL PASTED TEXT -->\n\n')[1]
    expect(original).toBeDefined()
    const prompt = HELP_TOPICS.find(topic => topic.id === 'manual-timetable')?.parts?.find(part => part.prompt)?.prompt
    expect(prompt).toBeTruthy()
    expect(original).toContain(prompt)
  })
})
