import {
  customLimitSetting,
  getLimitSettingByDifficulty,
  limitSetting
} from "src/utils/limitSetting"
import { key } from "src/utils/storage"

import "@plasmohq/messaging/background"

import { codeCount } from "src/utils/count/codeCount"
import { responseCount } from "src/utils/count/responseCount"
import { layoutSetting } from "src/utils/layoutSetting"

import { startHub } from "@plasmohq/messaging/pub-sub"

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await responseCount.createStorage()
    await codeCount.createStorage()
    await layoutSetting.createStorage()
    await limitSetting.createStorage()
    await customLimitSetting.createStorage()
    setResetAlarm()
  }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === key.resetLimit()) {
    await resetLimitSetting()
    await responseCount.createDailyStorage()
    await codeCount.createDailyStorage()
    chrome.alarms.clear(key.resetLimit())
    setResetAlarm()
  }
})

const setResetAlarm = () => {
  const now = new Date()
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  )
  const when = nextMidnight.getTime()
  chrome.alarms.create(key.resetLimit(), { when })
}

const resetLimitSetting = async () => {
  const previousSetting = await limitSetting.get()
  const defaultSetting = await getLimitSettingByDifficulty(
    previousSetting.difficulty
  )
  if (defaultSetting === undefined) return
  await limitSetting.save(defaultSetting)
}

startHub()
