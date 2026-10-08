import { describe, expect, it } from 'vitest'
import { isNavigationIntent, isScreen } from './navigationIntent'

describe('safe internal navigation', () => {
  it('accepts only known screens and bounded internal destinations', () => {
    for (const intent of [{screen:'Prayer',view:'month'},{screen:'Quran',surah:114},{screen:'Quran',juz:30},{screen:'Quran',view:'continue'},{screen:'SalahGraphs',period:'week'},{screen:'NeedHelp',section:'qibla'}]) expect(isNavigationIntent(intent)).toBe(true)
    expect(isScreen('FeatureSearch')).toBe(true)
    for (const intent of [null,{screen:'Reset'},{screen:'Quran',surah:115},{screen:'Quran',juz:0},{screen:'Quran',surah:1.5},{screen:'Quran',view:['surahs']},{screen:'Quran',view:{toString:()=>{throw new Error('invalid')}}},{screen:'Qibla',permission:true},{screen:'Home',url:'https://external.test'},{screen:'Prayer',view:'delete'}]) expect(isNavigationIntent(intent)).toBe(false)
  })
})
