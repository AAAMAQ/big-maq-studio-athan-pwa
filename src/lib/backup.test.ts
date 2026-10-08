import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBackup, importBackup, parseBackupJson, resetAthanAppData } from './backup'
import { APP_LAYOUT_EVENT, APP_LAYOUT_KEY, loadAppLayout, SETTINGS_SECTIONS_KEY } from './appLayout'
import { PERFORMANCE_KEY, loadPerformancePreferences } from './performancePreferences'
import { SALAH_SAVED_SEARCHES_STORAGE_KEY, SALAH_RECENT_SEARCHES_STORAGE_KEY, loadSavedSalahSearches } from './salahSavedSearches'

describe('Backup and Restore Salah privacy data', () => {
  beforeEach(() => localStorage.clear())

  it('includes tracker notes and all Settings calendar reminder preferences in the local backup', () => {
    localStorage.setItem('salahLogV1', '{"2026-09-25":{"Fajr":true,"Dhuhr":false,"Notes":"Private daily note"}}')
    localStorage.setItem('athan.salah.reminder.v1', '{"enabled":true,"time":"20:30"}')
    localStorage.setItem('athan.calendar.fixedIsha.enabled.v1', 'false')
    localStorage.setItem('athan.calendar.secondReminder.v1', '{"enabled":true,"minutesBefore":15}')
    localStorage.setItem('athan.engine.secondReminder.v1', '{"enabled":true,"minutesBefore":25}')
    localStorage.setItem('athan.preference.savedCityTimeView.v1', 'utc')
    localStorage.setItem('athan.iqama.jumuahReminder.v1', '{"include":true,"time":"09:30"}')

    const backup = createBackup()
    expect(backup.localStorage.salahLogV1).toContain('Private daily note')
    expect(backup.localStorage['athan.salah.reminder.v1']).toBe('{"enabled":true,"time":"20:30"}')
    expect(backup.localStorage['athan.calendar.fixedIsha.enabled.v1']).toBe('false')
    expect(backup.localStorage['athan.calendar.secondReminder.v1']).toBe('{"enabled":true,"minutesBefore":15}')
    expect(backup.localStorage['athan.engine.secondReminder.v1']).toBe('{"enabled":true,"minutesBefore":25}')
    expect(backup.localStorage['athan.preference.savedCityTimeView.v1']).toBe('utc')
    expect(backup.localStorage['athan.iqama.jumuahReminder.v1']).toBe('{"include":true,"time":"09:30"}')

    localStorage.clear()
    expect(importBackup(backup)).toBe(7)
    expect(localStorage.getItem('salahLogV1')).toContain('Private daily note')
    expect(localStorage.getItem('athan.salah.reminder.v1')).toBe('{"enabled":true,"time":"20:30"}')
    expect(localStorage.getItem('athan.calendar.fixedIsha.enabled.v1')).toBe('false')
    expect(localStorage.getItem('athan.calendar.secondReminder.v1')).toBe('{"enabled":true,"minutesBefore":15}')
    expect(localStorage.getItem('athan.engine.secondReminder.v1')).toBe('{"enabled":true,"minutesBefore":25}')
    expect(localStorage.getItem('athan.preference.savedCityTimeView.v1')).toBe('utc')
    expect(localStorage.getItem('athan.iqama.jumuahReminder.v1')).toBe('{"include":true,"time":"09:30"}')
  })
})

describe('v4 personal configuration backups', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips custom layout, independent performance, collapsed sections and scoped searches', () => {
    localStorage.setItem(APP_LAYOUT_KEY, JSON.stringify({schemaVersion:1,enabled:true,navigation:['Quran','Iqama'],home:[],more:[],homeSections:{salahBrief:true,salahBriefView:'bars'}}))
    localStorage.setItem(PERFORMANCE_KEY, JSON.stringify({schemaVersion:1,enabled:true,priorities:['SalahTracker']}))
    localStorage.setItem(SETTINGS_SECTIONS_KEY, JSON.stringify({preferences:false,calendar:false}))
    localStorage.setItem(SALAH_SAVED_SEARCHES_STORAGE_KEY, JSON.stringify({schemaVersion:1,searches:[{id:'private',name:'Notes',query:'(notes)&26y',scope:{kind:'absolute',from:'2026-01-01',to:'2026-10-05',includeBlankDates:false}}]}))
    localStorage.setItem(SALAH_RECENT_SEARCHES_STORAGE_KEY, JSON.stringify({schemaVersion:1,queries:['star3']}))
    localStorage.setItem('athan.savedCities.v1','[{"id":"city-profile"}]')
    localStorage.setItem('athan.quran.progress.v1','{"lastReadSurah":2}')
    localStorage.setItem('athan.quran.translation.v1','en.asad')
    localStorage.setItem('athan.quran.readAyahs.v1','{"2":[1,2]}')
    const backup = createBackup()
    localStorage.clear()
    const changed = vi.fn()
    window.addEventListener(APP_LAYOUT_EVENT,changed)
    expect(importBackup(backup)).toBe(9)
    expect(loadAppLayout()).toMatchObject({enabled:true,navigation:['Quran','Iqama'],home:[],more:[],homeSections:{salahBrief:true,salahBriefView:'bars'}})
    expect(loadPerformancePreferences()).toMatchObject({enabled:true,priorities:['SalahTracker']})
    expect(localStorage.getItem('athan.quran.translation.v1')).toBe('en.asad')
    expect(localStorage.getItem('athan.quran.readAyahs.v1')).toBe('{"2":[1,2]}')
    expect(loadSavedSalahSearches().searches[0].scope).toMatchObject({kind:'absolute',to:'2026-10-05'})
    expect(changed).toHaveBeenCalledOnce()
    window.removeEventListener(APP_LAYOUT_EVENT,changed)
  })

  it('keeps absent legacy preferences and skips malformed/future config while filtering unknown roots', () => {
    localStorage.setItem(PERFORMANCE_KEY, '{"schemaVersion":1,"enabled":true,"priorities":["Quran"]}')
    localStorage.setItem(APP_LAYOUT_KEY, '{"schemaVersion":1,"enabled":true,"navigation":["Iqama"],"home":[],"more":[]}')
    const backup = createBackup()
    backup.localStorage = {[APP_LAYOUT_KEY]:'{"schemaVersion":9,"enabled":false}',[SETTINGS_SECTIONS_KEY]:'broken','method':'Karachi',unrelated:'never write'}
    expect(importBackup(backup)).toBe(1)
    expect(loadAppLayout().navigation).toEqual(['Iqama'])
    expect(loadPerformancePreferences().enabled).toBe(true)
    expect(localStorage.getItem('unrelated')).toBeNull()
    backup.localStorage = {[APP_LAYOUT_KEY]:JSON.stringify({schemaVersion:1,enabled:true,navigation:['Home','Quran','Quran','unknown','Iqama','Qibla','More','Settings'],home:[],more:[]})}
    importBackup(backup)
    expect(loadAppLayout().navigation).toEqual(['Quran','Iqama','Qibla','More'])
  })

  it('does not infer downloaded Quran responses from restored metadata', () => {
    const backup = createBackup()
    backup.localStorage = {'athan.quran.offline.meta.v1':'{"available":true,"complete":true,"downloadedSurahs":114,"totalSurahs":114}'}
    importBackup(backup)
    expect(JSON.parse(localStorage.getItem('athan.quran.offline.meta.v1')!)).toMatchObject({available:false,complete:false,downloadedSurahs:0})
  })

  it('rolls back earlier writes on a storage failure and rejects invalid backup formats', () => {
    localStorage.setItem(APP_LAYOUT_KEY,'previous')
    const backup = createBackup()
    backup.localStorage = {[APP_LAYOUT_KEY]:'{"schemaVersion":1,"enabled":true}','method':'Karachi'}
    const original = Storage.prototype.setItem
    const spy = vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this: Storage,key,value) {
      if(key==='method') throw new Error('Quota')
      original.call(this,key,value)
    })
    expect(() => importBackup(backup)).toThrow('Device storage')
    expect(localStorage.getItem(APP_LAYOUT_KEY)).toBe('previous')
    spy.mockRestore()
    expect(() => parseBackupJson('{"app":"Athan PWA","version":2,"exportedAt":"now","localStorage":{}}')).toThrow()
    expect(() => parseBackupJson('{"app":"Athan PWA","version":1,"exportedAt":"now","localStorage":[]}')).toThrow()
  })

  it('resets new keys only inside the explicit full app reset allowlist', () => {
    for (const key of [APP_LAYOUT_KEY,PERFORMANCE_KEY,SETTINGS_SECTIONS_KEY,SALAH_SAVED_SEARCHES_STORAGE_KEY,SALAH_RECENT_SEARCHES_STORAGE_KEY]) localStorage.setItem(key,'test')
    localStorage.setItem('other-app-data','keep')
    expect(resetAthanAppData()).toBe(5)
    expect(localStorage.getItem('other-app-data')).toBe('keep')
  })
})
