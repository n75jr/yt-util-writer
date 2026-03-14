import { StrictMode, useDeferredValue, useEffect, useId, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'

type Unit = 'C' | 'F'

type MapLayer = 'temperature' | 'precipitation' | 'wind' | 'clouds'
type ProfileActivity = 'commuter' | 'runner' | 'traveler' | 'photographer'
type NotificationType = 'storm' | 'air' | 'uv' | 'commute' | 'hydration' | 'travel'

type NotificationItem = {
  id: string
  cityId: string
  type: NotificationType
  title: string
  detail: string
  severity: 'Moderate' | 'Elevated' | 'Severe'
  window: string
}

type UserProfile = {
  name: string
  homeCityId: string
  activity: ProfileActivity
  heatSensitivity: number
  coldSensitivity: number
}

type EditedWeather = Partial<Pick<CityWeather, 'temperatureC' | 'humidity' | 'windKph' | 'airQuality' | 'precipitation' | 'uvIndex'>>
type DashboardPreset = 'overview' | 'travel' | 'fitness' | 'photo'
type SavedView = {
  id: string
  name: string
  cityId: string
  preset: DashboardPreset
  mapLayer: MapLayer
  unit: Unit
}

type AppSettings = {
  motion: boolean
  denseCards: boolean
  advisoryMode: boolean
}

type TripPurpose = 'city-break' | 'business' | 'outdoor' | 'nightlife'

type NotificationPreferences = Record<NotificationType, boolean>

type TripTask = {
  id: string
  text: string
  done: boolean
}

type WeatherCondition =
  | 'Sunny'
  | 'Clear'
  | 'Partly Cloudy'
  | 'Cloudy'
  | 'Rain'
  | 'Storm'
  | 'Snow'
  | 'Windy'

type CityWeather = {
  id: string
  city: string
  country: string
  timezoneOffset: number
  condition: WeatherCondition
  summary: string
  temperatureC: number
  feelsLikeC: number
  highC: number
  lowC: number
  humidity: number
  windKph: number
  uvIndex: number
  visibilityKm: number
  pressureHpa: number
  airQuality: number
  precipitation: number
  sunrise: string
  sunset: string
  moonPhase: string
  seaLevelM: number
  alerts: Array<{
    title: string
    severity: 'Moderate' | 'Elevated' | 'Severe'
    window: string
    description: string
  }>
  hourly: Array<{
    time: string
    tempC: number
    rainChance: number
    windKph: number
    condition: WeatherCondition
  }>
  weekly: Array<{
    day: string
    condition: WeatherCondition
    highC: number
    lowC: number
    rainChance: number
  }>
}

const weatherData: CityWeather[] = [
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    timezoneOffset: 9,
    condition: 'Partly Cloudy',
    summary: 'Warm evening with bright breaks, breezy bay air, and stable visibility across the metro.',
    temperatureC: 24,
    feelsLikeC: 26,
    highC: 28,
    lowC: 19,
    humidity: 63,
    windKph: 18,
    uvIndex: 6,
    visibilityKm: 14,
    pressureHpa: 1014,
    airQuality: 42,
    precipitation: 18,
    sunrise: '05:47',
    sunset: '17:31',
    moonPhase: 'Waxing Crescent',
    seaLevelM: 12,
    alerts: [
      {
        title: 'Coastal breeze advisory',
        severity: 'Moderate',
        window: '18:00 - 23:00',
        description: 'Localized gusts near the waterfront may affect evening cycling and ferry routes.',
      },
    ],
    hourly: [
      { time: 'Now', tempC: 24, rainChance: 14, windKph: 18, condition: 'Partly Cloudy' },
      { time: '19:00', tempC: 23, rainChance: 12, windKph: 17, condition: 'Cloudy' },
      { time: '20:00', tempC: 22, rainChance: 10, windKph: 15, condition: 'Clear' },
      { time: '21:00', tempC: 21, rainChance: 8, windKph: 13, condition: 'Clear' },
      { time: '22:00', tempC: 20, rainChance: 9, windKph: 12, condition: 'Clear' },
      { time: '23:00', tempC: 20, rainChance: 12, windKph: 11, condition: 'Partly Cloudy' },
    ],
    weekly: [
      { day: 'Tue', condition: 'Partly Cloudy', highC: 28, lowC: 19, rainChance: 18 },
      { day: 'Wed', condition: 'Sunny', highC: 29, lowC: 20, rainChance: 8 },
      { day: 'Thu', condition: 'Rain', highC: 24, lowC: 18, rainChance: 72 },
      { day: 'Fri', condition: 'Cloudy', highC: 25, lowC: 19, rainChance: 31 },
      { day: 'Sat', condition: 'Sunny', highC: 30, lowC: 21, rainChance: 5 },
      { day: 'Sun', condition: 'Windy', highC: 27, lowC: 20, rainChance: 16 },
      { day: 'Mon', condition: 'Partly Cloudy', highC: 26, lowC: 18, rainChance: 22 },
    ],
  },
  {
    id: 'reykjavik',
    city: 'Reykjavik',
    country: 'Iceland',
    timezoneOffset: 0,
    condition: 'Snow',
    summary: 'Cold marine air, sharp visibility between flurries, and a dense cloud shelf moving from the west.',
    temperatureC: -2,
    feelsLikeC: -7,
    highC: 1,
    lowC: -5,
    humidity: 78,
    windKph: 29,
    uvIndex: 1,
    visibilityKm: 8,
    pressureHpa: 998,
    airQuality: 18,
    precipitation: 84,
    sunrise: '08:41',
    sunset: '18:53',
    moonPhase: 'First Quarter',
    seaLevelM: 61,
    alerts: [
      {
        title: 'Snow and crosswind warning',
        severity: 'Elevated',
        window: 'All day',
        description: 'Fast-changing road visibility and exposed bridge crosswinds are expected through late evening.',
      },
    ],
    hourly: [
      { time: 'Now', tempC: -2, rainChance: 84, windKph: 29, condition: 'Snow' },
      { time: '19:00', tempC: -3, rainChance: 81, windKph: 31, condition: 'Snow' },
      { time: '20:00', tempC: -3, rainChance: 70, windKph: 27, condition: 'Cloudy' },
      { time: '21:00', tempC: -4, rainChance: 58, windKph: 24, condition: 'Cloudy' },
      { time: '22:00', tempC: -4, rainChance: 47, windKph: 22, condition: 'Windy' },
      { time: '23:00', tempC: -5, rainChance: 40, windKph: 19, condition: 'Clear' },
    ],
    weekly: [
      { day: 'Tue', condition: 'Snow', highC: 1, lowC: -5, rainChance: 84 },
      { day: 'Wed', condition: 'Cloudy', highC: 0, lowC: -4, rainChance: 42 },
      { day: 'Thu', condition: 'Windy', highC: 2, lowC: -3, rainChance: 26 },
      { day: 'Fri', condition: 'Snow', highC: -1, lowC: -6, rainChance: 76 },
      { day: 'Sat', condition: 'Cloudy', highC: 1, lowC: -4, rainChance: 30 },
      { day: 'Sun', condition: 'Clear', highC: 3, lowC: -2, rainChance: 10 },
      { day: 'Mon', condition: 'Rain', highC: 4, lowC: 0, rainChance: 63 },
    ],
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    timezoneOffset: 4,
    condition: 'Sunny',
    summary: 'Dry desert heat with a light haze layer, high UV exposure, and mild shoreline humidity.',
    temperatureC: 34,
    feelsLikeC: 37,
    highC: 38,
    lowC: 27,
    humidity: 41,
    windKph: 16,
    uvIndex: 9,
    visibilityKm: 11,
    pressureHpa: 1008,
    airQuality: 91,
    precipitation: 1,
    sunrise: '06:22',
    sunset: '18:17',
    moonPhase: 'Waxing Gibbous',
    seaLevelM: 5,
    alerts: [
      {
        title: 'Heat exposure notice',
        severity: 'Severe',
        window: '11:00 - 16:00',
        description: 'Direct-sun exposure is hazardous during peak afternoon hours. Hydration and shade are advised.',
      },
    ],
    hourly: [
      { time: 'Now', tempC: 34, rainChance: 1, windKph: 16, condition: 'Sunny' },
      { time: '19:00', tempC: 33, rainChance: 1, windKph: 14, condition: 'Clear' },
      { time: '20:00', tempC: 32, rainChance: 1, windKph: 13, condition: 'Clear' },
      { time: '21:00', tempC: 31, rainChance: 2, windKph: 11, condition: 'Clear' },
      { time: '22:00', tempC: 30, rainChance: 2, windKph: 9, condition: 'Clear' },
      { time: '23:00', tempC: 29, rainChance: 3, windKph: 9, condition: 'Partly Cloudy' },
    ],
    weekly: [
      { day: 'Tue', condition: 'Sunny', highC: 38, lowC: 27, rainChance: 1 },
      { day: 'Wed', condition: 'Sunny', highC: 39, lowC: 28, rainChance: 0 },
      { day: 'Thu', condition: 'Sunny', highC: 37, lowC: 26, rainChance: 0 },
      { day: 'Fri', condition: 'Windy', highC: 35, lowC: 25, rainChance: 4 },
      { day: 'Sat', condition: 'Partly Cloudy', highC: 34, lowC: 24, rainChance: 8 },
      { day: 'Sun', condition: 'Sunny', highC: 36, lowC: 25, rainChance: 1 },
      { day: 'Mon', condition: 'Sunny', highC: 37, lowC: 26, rainChance: 0 },
    ],
  },
  {
    id: 'new-york',
    city: 'New York',
    country: 'United States',
    timezoneOffset: -4,
    condition: 'Storm',
    summary: 'A volatile front is crossing the region with embedded thunder cells and heavy bursts after sunset.',
    temperatureC: 18,
    feelsLikeC: 18,
    highC: 21,
    lowC: 14,
    humidity: 86,
    windKph: 34,
    uvIndex: 3,
    visibilityKm: 7,
    pressureHpa: 1002,
    airQuality: 58,
    precipitation: 91,
    sunrise: '06:14',
    sunset: '17:58',
    moonPhase: 'Full Moon',
    seaLevelM: 10,
    alerts: [
      {
        title: 'Severe thunderstorm watch',
        severity: 'Severe',
        window: '17:00 - 01:00',
        description: 'Strong cells may bring lightning, short-term flooding, and rapid gusts across the city corridor.',
      },
      {
        title: 'Transit delay risk',
        severity: 'Moderate',
        window: 'Rush hour',
        description: 'Surface transit and airport operations may see periodic slowdowns during storm peaks.',
      },
    ],
    hourly: [
      { time: 'Now', tempC: 18, rainChance: 91, windKph: 34, condition: 'Storm' },
      { time: '19:00', tempC: 18, rainChance: 88, windKph: 32, condition: 'Storm' },
      { time: '20:00', tempC: 17, rainChance: 75, windKph: 28, condition: 'Rain' },
      { time: '21:00', tempC: 16, rainChance: 62, windKph: 23, condition: 'Rain' },
      { time: '22:00', tempC: 16, rainChance: 43, windKph: 19, condition: 'Cloudy' },
      { time: '23:00', tempC: 15, rainChance: 28, windKph: 16, condition: 'Cloudy' },
    ],
    weekly: [
      { day: 'Tue', condition: 'Storm', highC: 21, lowC: 14, rainChance: 91 },
      { day: 'Wed', condition: 'Rain', highC: 18, lowC: 12, rainChance: 67 },
      { day: 'Thu', condition: 'Cloudy', highC: 20, lowC: 11, rainChance: 24 },
      { day: 'Fri', condition: 'Sunny', highC: 22, lowC: 13, rainChance: 7 },
      { day: 'Sat', condition: 'Partly Cloudy', highC: 23, lowC: 15, rainChance: 16 },
      { day: 'Sun', condition: 'Windy', highC: 19, lowC: 12, rainChance: 19 },
      { day: 'Mon', condition: 'Sunny', highC: 21, lowC: 14, rainChance: 9 },
    ],
  },
]

const styles = `
:root {
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  color: #ecf7ff;
  background:
    radial-gradient(circle at top left, rgba(82, 157, 255, 0.35), transparent 32%),
    radial-gradient(circle at top right, rgba(68, 227, 196, 0.22), transparent 28%),
    linear-gradient(135deg, #04131f 0%, #0b2434 52%, #0c1725 100%);
  color-scheme: dark;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input {
  font: inherit;
}

button {
  border: 0;
}

#root {
  min-height: 100vh;
}

.page-shell {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  padding: 24px;
}

.page-shell::before,
.page-shell::after {
  content: "";
  position: absolute;
  inset: auto;
  border-radius: 999px;
  filter: blur(70px);
  opacity: 0.45;
  pointer-events: none;
}

.page-shell::before {
  top: -90px;
  right: -40px;
  width: 280px;
  height: 280px;
  background: rgba(86, 214, 255, 0.28);
}

.page-shell::after {
  bottom: 10%;
  left: -80px;
  width: 300px;
  height: 300px;
  background: rgba(39, 115, 214, 0.22);
}

.dashboard {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 20px;
  max-width: 1480px;
  margin: 0 auto;
}

.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.branding {
  display: grid;
  gap: 6px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 8px 12px;
  border: 1px solid rgba(163, 226, 255, 0.14);
  border-radius: 999px;
  background: rgba(7, 28, 42, 0.68);
  color: #9adfff;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.title {
  margin: 0;
  font-size: clamp(2.4rem, 4vw, 4.75rem);
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.subtitle {
  margin: 0;
  max-width: 64ch;
  color: rgba(225, 242, 250, 0.72);
  font-size: 1rem;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.search {
  position: relative;
  min-width: min(100%, 320px);
  flex: 1 1 280px;
}

.search input {
  width: 100%;
  padding: 16px 18px 16px 48px;
  border: 1px solid rgba(160, 220, 247, 0.16);
  border-radius: 18px;
  background: rgba(6, 24, 38, 0.72);
  color: #f4fbff;
  outline: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.search input::placeholder {
  color: rgba(196, 225, 241, 0.46);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 18px;
  transform: translateY(-50%);
  color: rgba(196, 225, 241, 0.58);
}

.unit-toggle,
.city-tabs {
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  border: 1px solid rgba(160, 220, 247, 0.14);
  border-radius: 18px;
  background: rgba(6, 24, 38, 0.72);
}

.unit-toggle button,
.city-tabs button,
.ghost-button,
.action-button {
  cursor: pointer;
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    opacity 180ms ease;
}

.unit-toggle button,
.city-tabs button {
  padding: 10px 14px;
  border-radius: 12px;
  background: transparent;
  color: rgba(222, 241, 252, 0.78);
}

.unit-toggle button.active,
.city-tabs button.active {
  background: linear-gradient(135deg, rgba(95, 201, 255, 0.25), rgba(53, 122, 255, 0.28));
  color: #ffffff;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.95fr);
  gap: 20px;
}

.stack {
  display: grid;
  gap: 20px;
}

.hero-card,
.glass-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(173, 227, 255, 0.12);
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03)),
    rgba(5, 19, 30, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 24px 60px rgba(3, 10, 18, 0.36);
  backdrop-filter: blur(24px);
}

.hero-card {
  min-height: 520px;
  padding: 28px;
}

.hero-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 16% 18%, rgba(255, 233, 153, 0.28), transparent 18%),
    radial-gradient(circle at 82% 26%, rgba(97, 188, 255, 0.24), transparent 24%);
  opacity: 0.9;
  pointer-events: none;
}

.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.9fr);
  gap: 18px;
  height: 100%;
}

.hero-main {
  display: grid;
  align-content: space-between;
  gap: 18px;
}

.location-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  color: rgba(222, 241, 252, 0.74);
}

.location-chip,
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.85rem;
}

.hero-temp {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 18px;
}

.hero-temp strong {
  font-size: clamp(5rem, 12vw, 8rem);
  line-height: 0.86;
  letter-spacing: -0.08em;
}

.hero-temp span {
  display: block;
  margin-bottom: 14px;
  color: rgba(222, 241, 252, 0.7);
  font-size: 1.05rem;
}

.hero-summary {
  max-width: 56ch;
  margin: 0;
  color: rgba(232, 245, 252, 0.82);
  font-size: 1.05rem;
}

.hero-footer {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.mini-stat {
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mini-stat-label {
  display: block;
  margin-bottom: 10px;
  color: rgba(206, 231, 245, 0.66);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.mini-stat-value {
  font-size: 1.55rem;
  font-weight: 700;
}

.hero-side {
  display: grid;
  gap: 16px;
  align-content: start;
}

.sun-arc {
  display: grid;
  gap: 12px;
  padding: 20px;
  border-radius: 28px;
  background: rgba(7, 26, 41, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title h2,
.section-title h3,
.section-title p {
  margin: 0;
}

.section-title h2,
.section-title h3 {
  font-size: 1.05rem;
}

.section-title p {
  color: rgba(203, 230, 244, 0.62);
  font-size: 0.88rem;
}

.sun-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.sun-box {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
}

.sun-box span {
  display: block;
  color: rgba(203, 230, 244, 0.64);
  font-size: 0.84rem;
}

.sun-box strong {
  font-size: 1.35rem;
}

.glance-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.glass-card {
  padding: 22px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.metric-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

.metric-card h3,
.metric-card p,
.metric-card strong {
  margin: 0;
}

.metric-card h3 {
  font-size: 0.96rem;
}

.metric-subtle {
  color: rgba(203, 230, 244, 0.62);
  font-size: 0.84rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
}

.progress-track {
  overflow: hidden;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #78e7ff, #6a87ff, #ffa15f);
}

.hourly-row,
.weekly-list,
.city-results,
.alerts {
  display: grid;
  gap: 12px;
}

.hourly-row {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.hourly-card,
.weekly-card,
.result-card,
.alert-card {
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.hourly-card {
  display: grid;
  gap: 10px;
  text-align: center;
}

.hourly-card strong,
.weekly-card strong,
.result-card strong,
.alert-card strong {
  font-size: 1rem;
}

.hourly-meta,
.weekly-meta,
.result-meta,
.alert-meta {
  color: rgba(203, 230, 244, 0.64);
  font-size: 0.86rem;
}

.weekly-card {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 12px;
}

.city-results {
  max-height: 394px;
  overflow: auto;
  padding-right: 4px;
}

.result-card {
  display: grid;
  gap: 10px;
}

.result-card button {
  justify-self: start;
}

.ghost-button,
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 14px;
}

.ghost-button {
  background: rgba(255, 255, 255, 0.05);
  color: #eff8ff;
}

.action-button {
  background: linear-gradient(135deg, #75e6ff, #6896ff);
  color: #04131f;
  font-weight: 700;
}

.alert-card {
  display: grid;
  gap: 10px;
}

.alert-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.alert-pill {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.alert-pill.severe {
  background: rgba(255, 104, 117, 0.18);
  color: #ffacb4;
}

.alert-pill.elevated {
  background: rgba(255, 180, 84, 0.18);
  color: #ffd59b;
}

.alert-pill.moderate {
  background: rgba(106, 150, 255, 0.18);
  color: #b7ceff;
}

.weather-icon {
  width: 38px;
  height: 38px;
}

.weather-icon.large {
  width: 88px;
  height: 88px;
}

.empty-state {
  padding: 22px;
  border-radius: 22px;
  border: 1px dashed rgba(203, 230, 244, 0.18);
  color: rgba(203, 230, 244, 0.7);
}

.radar {
  width: 100%;
  height: 220px;
  border-radius: 24px;
  background:
    radial-gradient(circle at center, rgba(118, 233, 255, 0.2), transparent 32%),
    radial-gradient(circle at center, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: auto, 28px 28px;
}

.radar svg {
  width: 100%;
  height: 100%;
}

.footer-note {
  color: rgba(203, 230, 244, 0.58);
  font-size: 0.88rem;
}

.unit-small {
  font-size: 0.92rem;
  color: rgba(203, 230, 244, 0.64);
}

.timeline-card,
.map-card,
.planner-card,
.compare-card,
.deep-grid,
.news-list,
.aqi-grid,
.astro-grid,
.planner-grid,
.score-grid {
  display: grid;
  gap: 16px;
}

.timeline-slider {
  width: 100%;
  accent-color: #7ae5ff;
}

.timeline-points {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 10px;
}

.timeline-point {
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.timeline-point.active {
  background: linear-gradient(135deg, rgba(117, 230, 255, 0.16), rgba(104, 150, 255, 0.16));
  border-color: rgba(122, 229, 255, 0.22);
}

.map-stage {
  position: relative;
  overflow: hidden;
  min-height: 360px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.map-surface {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.06), transparent 18%),
    radial-gradient(circle at 74% 64%, rgba(255, 255, 255, 0.04), transparent 20%),
    linear-gradient(180deg, rgba(5, 17, 28, 0.28), rgba(5, 17, 28, 0.68));
}

.map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.5));
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  display: grid;
  gap: 6px;
  min-width: 112px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(6, 24, 38, 0.82);
  border: 1px solid rgba(121, 224, 255, 0.18);
  box-shadow: 0 16px 34px rgba(2, 10, 18, 0.3);
}

.map-marker.active {
  background: rgba(10, 35, 52, 0.94);
  border-color: rgba(122, 229, 255, 0.4);
}

.map-marker::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -16px;
  width: 2px;
  height: 16px;
  transform: translateX(-50%);
  background: rgba(122, 229, 255, 0.4);
}

.map-layer-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

.map-layer-tabs button,
.soft-chip,
.compare-toggle button {
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(237, 247, 255, 0.82);
  cursor: pointer;
}

.map-layer-tabs button.active,
.compare-toggle button.active {
  background: linear-gradient(135deg, rgba(117, 230, 255, 0.2), rgba(104, 150, 255, 0.2));
}

.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.legend-pill {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.85rem;
}

.score-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.score-card,
.planner-slot,
.astro-card,
.aqi-item,
.news-card,
.compare-row {
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.score-card strong,
.planner-slot strong,
.astro-card strong,
.aqi-item strong,
.news-card strong,
.compare-row strong {
  display: block;
  margin-bottom: 8px;
}

.planner-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.deep-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.astro-grid,
.aqi-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.astro-card .metric-value,
.aqi-item .metric-value,
.score-card .metric-value {
  font-size: 1.65rem;
}

.news-list {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.compare-toggle {
  display: inline-flex;
  gap: 8px;
  padding: 6px;
  border: 1px solid rgba(160, 220, 247, 0.14);
  border-radius: 18px;
  background: rgba(6, 24, 38, 0.72);
}

.compare-list {
  display: grid;
  gap: 12px;
}

.compare-row {
  display: grid;
  grid-template-columns: 1.2fr repeat(5, minmax(0, 0.8fr));
  align-items: center;
  gap: 10px;
}

.compare-header {
  color: rgba(203, 230, 244, 0.58);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.accent-line {
  height: 1px;
  background: linear-gradient(90deg, rgba(122, 229, 255, 0), rgba(122, 229, 255, 0.34), rgba(122, 229, 255, 0));
}

.advisor-note {
  padding: 18px;
  border-radius: 22px;
  background: rgba(122, 229, 255, 0.07);
  border: 1px solid rgba(122, 229, 255, 0.12);
  color: rgba(235, 247, 255, 0.86);
}

.kpi-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.kpi-inline span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
}

.top-actions,
.favorite-row,
.modal-actions,
.profile-grid,
.editor-grid,
.history-grid,
.route-grid,
.wardrobe-grid,
.activity-grid,
.notification-list,
.command-list {
  display: grid;
  gap: 12px;
}

.top-actions {
  grid-auto-flow: column;
  justify-content: start;
}

.soft-button {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: #eff8ff;
  cursor: pointer;
}

.favorite-row {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.favorite-chip,
.command-item,
.notification-card,
.profile-card,
.editor-card,
.history-card,
.route-card,
.wardrobe-card,
.activity-card {
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.favorite-chip.active {
  background: linear-gradient(135deg, rgba(117, 230, 255, 0.18), rgba(104, 150, 255, 0.16));
}

.profile-grid,
.editor-grid,
.history-grid,
.route-grid,
.wardrobe-grid,
.activity-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.notification-list,
.command-list {
  max-height: 420px;
  overflow: auto;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(2, 9, 17, 0.72);
  backdrop-filter: blur(16px);
}

.modal-panel {
  width: min(920px, 100%);
  max-height: min(88vh, 920px);
  overflow: auto;
  padding: 22px;
  border-radius: 28px;
  border: 1px solid rgba(173, 227, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03)),
    rgba(5, 19, 30, 0.95);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.4);
}

.modal-actions {
  grid-auto-flow: column;
  justify-content: end;
}

.field {
  display: grid;
  gap: 8px;
}

.field label {
  color: rgba(203, 230, 244, 0.72);
  font-size: 0.88rem;
}

.field input,
.field select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(160, 220, 247, 0.14);
  background: rgba(6, 24, 38, 0.72);
  color: #f4fbff;
}

.toggle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.small-note {
  color: rgba(203, 230, 244, 0.6);
  font-size: 0.82rem;
}

.preset-row,
.journal-list,
.planner-steps,
.filter-row,
.health-grid,
.checklist-grid,
.savedviews-list,
.settings-grid,
.strategy-grid,
.scenario-grid,
.favorite-analytics,
.digest-grid,
.kit-grid,
.micro-grid,
.prefs-grid,
.command-help-grid,
.ledger-grid,
.transit-grid,
.habit-grid,
.photo-grid,
.risk-grid,
.ops-grid,
.dossier-grid,
.task-list {
  display: grid;
  gap: 12px;
}

.preset-row {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.preset-card,
.journal-card,
.planner-step,
.filter-chip {
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.preset-card.active,
.filter-chip.active {
  background: linear-gradient(135deg, rgba(117, 230, 255, 0.18), rgba(104, 150, 255, 0.14));
}

.journal-list,
.planner-steps {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.health-grid,
.checklist-grid,
.settings-grid,
.strategy-grid,
.scenario-grid,
.favorite-analytics,
.digest-grid,
.kit-grid,
.micro-grid,
.prefs-grid,
.command-help-grid,
.ledger-grid,
.transit-grid,
.habit-grid,
.photo-grid,
.risk-grid,
.ops-grid,
.dossier-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.health-card,
.checklist-card,
.savedview-card,
.settings-card,
.strategy-card,
.scenario-card,
.favorite-analytics-card,
.digest-card,
.kit-card,
.micro-card,
.prefs-card,
.command-help-card,
.ledger-card,
.transit-card,
.habit-card,
.photo-card,
.risk-card,
.ops-card,
.dossier-card,
.task-card {
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.task-card.done {
  opacity: 0.72;
  background: rgba(120, 240, 191, 0.06);
}

.task-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.status-pill {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(122, 229, 255, 0.12);
  color: #d7f7ff;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.tiny-stat {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(234, 246, 255, 0.82);
  font-size: 0.84rem;
}

.toggle-check {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toggle-indicator {
  width: 46px;
  height: 26px;
  padding: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.toggle-indicator span {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #dff9ff;
  transition: transform 180ms ease;
}

.toggle-indicator.active span {
  transform: translateX(20px);
}

.dense .glass-card,
.dense .hero-card {
  padding: 18px;
}

.dense .metric-card,
.dense .score-card,
.dense .planner-slot,
.dense .activity-card,
.dense .history-card,
.dense .notification-card,
.dense .journal-card {
  padding: 12px;
}

.field textarea {
  min-height: 110px;
  resize: vertical;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(160, 220, 247, 0.14);
  background: rgba(6, 24, 38, 0.72);
  color: #f4fbff;
  font: inherit;
}

.front-wave {
  position: absolute;
  inset: auto auto 12% -8%;
  width: 62%;
  height: 22px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(122, 229, 255, 0), rgba(122, 229, 255, 0.4), rgba(122, 229, 255, 0));
  filter: blur(4px);
  opacity: 0.72;
  animation: front-slide 7s linear infinite;
}

.front-wave.delay {
  bottom: 36%;
  width: 48%;
  animation-duration: 10s;
  opacity: 0.46;
}

@keyframes front-slide {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(120%);
  }
}

@media (max-width: 1180px) {
  .layout,
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .hourly-row,
  .timeline-points,
  .score-grid,
  .planner-grid,
  .news-list,
  .compare-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .deep-grid,
  .astro-grid,
  .aqi-grid,
  .favorite-row,
  .preset-row,
  .journal-list,
  .planner-steps,
  .health-grid,
  .checklist-grid,
  .settings-grid,
  .strategy-grid,
  .scenario-grid,
  .favorite-analytics,
  .digest-grid,
  .kit-grid,
  .micro-grid,
  .prefs-grid,
  .command-help-grid,
  .ledger-grid,
  .transit-grid,
  .habit-grid,
  .photo-grid,
  .risk-grid,
  .ops-grid,
  .dossier-grid,
  .profile-grid,
  .editor-grid,
  .history-grid,
  .route-grid,
  .wardrobe-grid,
  .activity-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 780px) {
  .page-shell {
    padding: 14px;
  }

  .hero-card,
  .glass-card {
    border-radius: 24px;
  }

  .hero-card {
    padding: 18px;
    min-height: auto;
  }

  .hero-footer,
  .card-grid,
  .sun-grid,
  .glance-grid,
  .score-grid,
  .planner-grid,
  .news-list,
  .favorite-row,
  .preset-row,
  .journal-list,
  .planner-steps,
  .health-grid,
  .checklist-grid,
  .settings-grid,
  .strategy-grid,
  .scenario-grid,
  .favorite-analytics,
  .digest-grid,
  .kit-grid,
  .micro-grid,
  .prefs-grid,
  .command-help-grid,
  .ledger-grid,
  .transit-grid,
  .habit-grid,
  .photo-grid,
  .risk-grid,
  .ops-grid,
  .dossier-grid,
  .profile-grid,
  .editor-grid,
  .history-grid,
  .route-grid,
  .wardrobe-grid,
  .activity-grid {
    grid-template-columns: 1fr 1fr;
  }

  .hourly-row,
  .weekly-card,
  .compare-row,
  .timeline-points {
    grid-template-columns: 1fr 1fr;
  }

  .weekly-card {
    align-items: start;
  }

  .topbar,
  .control-row {
    align-items: stretch;
  }
}

@media (max-width: 560px) {
  .hero-footer,
  .card-grid,
  .sun-grid,
  .glance-grid,
  .hourly-row,
  .weekly-card,
  .score-grid,
  .planner-grid,
  .news-list,
  .compare-row,
  .timeline-points,
  .deep-grid,
  .astro-grid,
  .aqi-grid,
  .favorite-row,
  .preset-row,
  .journal-list,
  .planner-steps,
  .health-grid,
  .checklist-grid,
  .settings-grid,
  .strategy-grid,
  .scenario-grid,
  .favorite-analytics,
  .digest-grid,
  .kit-grid,
  .micro-grid,
  .prefs-grid,
  .command-help-grid,
  .ledger-grid,
  .transit-grid,
  .habit-grid,
  .photo-grid,
  .risk-grid,
  .ops-grid,
  .dossier-grid,
  .profile-grid,
  .editor-grid,
  .history-grid,
  .route-grid,
  .wardrobe-grid,
  .activity-grid {
    grid-template-columns: 1fr;
  }

  .city-tabs,
  .unit-toggle {
    width: 100%;
    justify-content: space-between;
  }
}
`

const unitLabels: Record<Unit, string> = { C: 'Metric', F: 'Imperial' }
const mapLayers: MapLayer[] = ['temperature', 'precipitation', 'wind', 'clouds']
const travelMoments = ['Morning', 'Midday', 'Evening', 'Night'] as const

const weatherNews = [
  {
    title: 'Jet stream bends south over the Atlantic corridor',
    tag: 'Synoptic',
    summary: 'Expect stronger wind transfer between Iceland and the northeastern United States through the next cycle.',
  },
  {
    title: 'Dust haze pushes surface heat stress higher',
    tag: 'Air quality',
    summary: 'Dry cities with elevated UV and stagnant air now score lower for midday outdoor comfort.',
  },
  {
    title: 'Urban evening cooling remains limited in dense cores',
    tag: 'Urban climate',
    summary: 'Tokyo and New York retain heat later into the night, affecting sleep and recovery recommendations.',
  },
] as const

const defaultProfile: UserProfile = {
  name: 'Avery',
  homeCityId: 'tokyo',
  activity: 'traveler',
  heatSensitivity: 58,
  coldSensitivity: 44,
}

const notificationCatalog: NotificationItem[] = [
  {
    id: 'tokyo-hydration',
    cityId: 'tokyo',
    type: 'hydration',
    title: 'Humidity rebound after sunset',
    detail: 'Water and light outerwear are recommended for longer evening walks.',
    severity: 'Moderate',
    window: '18:00 - 22:00',
  },
  {
    id: 'reykjavik-travel',
    cityId: 'reykjavik',
    type: 'travel',
    title: 'Crosswind conditions on exposed roads',
    detail: 'Allow longer transfer windows for airport or coastal routes.',
    severity: 'Elevated',
    window: 'All day',
  },
  {
    id: 'dubai-uv',
    cityId: 'dubai',
    type: 'uv',
    title: 'Extreme UV block',
    detail: 'Direct sun becomes high-risk around midday. Shade strategy is advised.',
    severity: 'Severe',
    window: '11:00 - 16:00',
  },
  {
    id: 'newyork-commute',
    cityId: 'new-york',
    type: 'commute',
    title: 'Rush-hour thunder disruption risk',
    detail: 'Transit confidence drops during peak cells and heavy rain bursts.',
    severity: 'Severe',
    window: '17:00 - 20:00',
  },
] as const

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value))
}

function average(numbers: number[]) {
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length
}

function toFahrenheit(value: number) {
  return Math.round((value * 9) / 5 + 32)
}

function formatTemp(valueC: number, unit: Unit) {
  const value = unit === 'C' ? Math.round(valueC) : toFahrenheit(valueC)
  return `${value}°${unit}`
}

function formatWind(valueKph: number, unit: Unit) {
  if (unit === 'C') return `${Math.round(valueKph)} km/h`
  return `${Math.round(valueKph / 1.609)} mph`
}

function formatVisibility(valueKm: number, unit: Unit) {
  if (unit === 'C') return `${valueKm.toFixed(0)} km`
  return `${(valueKm * 0.621371).toFixed(0)} mi`
}

function formatDistanceMeters(valueMeters: number, unit: Unit) {
  if (unit === 'C') return `${valueMeters.toFixed(0)} m`
  return `${(valueMeters * 3.28084).toFixed(0)} ft`
}

function formatPressureTrend(value: number) {
  if (value >= 1018) return 'Rising'
  if (value <= 1004) return 'Falling'
  return 'Stable'
}

function formatLocalTime(offset: number, tick: number) {
  const now = new Date(Date.now() + tick * 1000)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(utc + offset * 3600000))
}

function getAirQualityLabel(value: number) {
  if (value <= 30) return 'Excellent'
  if (value <= 60) return 'Good'
  if (value <= 90) return 'Fair'
  if (value <= 120) return 'Poor'
  return 'Very Poor'
}

function getWeatherNarrative(city: CityWeather) {
  if (city.condition === 'Storm') return 'Operational caution advised for travel, running, and exposed commutes.'
  if (city.condition === 'Snow') return 'Layering, reduced-speed travel, and warm recovery windows are recommended.'
  if (city.condition === 'Sunny' && city.uvIndex >= 8) return 'Heat and UV mitigation matter more than rain protection.'
  if (city.condition === 'Rain') return 'Short outdoor windows exist, but surface conditions stay slippery.'
  return 'Conditions are workable with moderate planning and route awareness.'
}

function getComfortScore(city: CityWeather) {
  return clampPercent(
    100 -
      Math.abs(city.temperatureC - 22) * 3 -
      city.humidity * 0.22 -
      city.windKph * 0.45 -
      city.precipitation * 0.3,
  )
}

function getHydrationScore(city: CityWeather) {
  return clampPercent(100 - city.temperatureC * 1.7 - city.uvIndex * 5 - city.humidity * 0.12 + city.windKph * 0.1)
}

function getRunScore(city: CityWeather) {
  return clampPercent(100 - Math.abs(city.temperatureC - 14) * 3 - city.precipitation * 0.45 - city.windKph * 0.7)
}

function getCommuteScore(city: CityWeather) {
  return clampPercent(100 - city.precipitation * 0.5 - city.windKph * 0.65 - (100 - city.visibilityKm * 8))
}

function getPhotoScore(city: CityWeather) {
  return clampPercent(100 - city.precipitation * 0.35 - city.airQuality * 0.4 + city.visibilityKm * 3)
}

function getSeaScore(city: CityWeather) {
  return clampPercent(100 - Math.abs(city.temperatureC - 28) * 3 - city.windKph * 0.8 - city.precipitation * 0.6)
}

function getMoodColor(score: number) {
  if (score >= 75) return '#78f0bf'
  if (score >= 50) return '#8dc7ff'
  if (score >= 30) return '#ffc775'
  return '#ff8b97'
}

function getAirBreakdown(city: CityWeather) {
  const pm25 = Math.max(4, Math.round(city.airQuality * 0.48))
  const pm10 = Math.max(8, Math.round(city.airQuality * 0.82))
  const no2 = Math.max(6, Math.round(city.airQuality * 0.36))
  const o3 = Math.max(10, Math.round(city.airQuality * 0.41 + city.uvIndex * 2))
  const co = Math.max(1, Number((city.airQuality * 0.018).toFixed(1)))
  return [
    { label: 'PM2.5', value: `${pm25} ug/m3`, severity: clampPercent(pm25 * 2.2) },
    { label: 'PM10', value: `${pm10} ug/m3`, severity: clampPercent(pm10 * 1.5) },
    { label: 'NO2', value: `${no2} ppb`, severity: clampPercent(no2 * 2.6) },
    { label: 'O3', value: `${o3} ppb`, severity: clampPercent(o3 * 1.6) },
    { label: 'CO', value: `${co} ppm`, severity: clampPercent(co * 20) },
  ]
}

function getAstronomyFacts(city: CityWeather) {
  const [riseHour, riseMinute] = city.sunrise.split(':').map(Number)
  const [setHour, setMinute] = city.sunset.split(':').map(Number)
  const daylightMinutes = setHour * 60 + setMinute - (riseHour * 60 + riseMinute)
  const goldenHourMinutes = Math.max(38, Math.round(42 + city.visibilityKm - city.windKph * 0.35))
  const moonIllumination = clampPercent(
    city.moonPhase.includes('Full') ? 100 : city.moonPhase.includes('Quarter') ? 52 : city.moonPhase.includes('Gibbous') ? 74 : 28,
  )
  return {
    daylight: `${Math.floor(daylightMinutes / 60)}h ${daylightMinutes % 60}m`,
    goldenHour: `${goldenHourMinutes} min`,
    blueHour: `${Math.max(18, Math.round(goldenHourMinutes * 0.45))} min`,
    moonIllumination: `${moonIllumination}%`,
  }
}

function buildTimeline(city: CityWeather) {
  const weeklyPrefix = city.weekly.slice(0, 2).map((entry, index) => ({
    label: `${entry.day} ${index === 0 ? 'AM' : 'PM'}`,
    tempC: index === 0 ? city.lowC + 1 : city.highC - 1,
    rainChance: entry.rainChance,
    windKph: city.windKph + index * 2,
    condition: entry.condition,
  }))

  return [...city.hourly, ...weeklyPrefix].slice(0, 8).map((entry) => ({
    label: 'time' in entry ? entry.time : entry.label,
    tempC: entry.tempC,
    rainChance: entry.rainChance,
    windKph: entry.windKph,
    condition: entry.condition,
  }))
}

function getClimateComparison(city: CityWeather) {
  const monthlyBaseline = {
    temperature: city.id === 'dubai' ? 31 : city.id === 'reykjavik' ? -1 : city.id === 'tokyo' ? 21 : 16,
    rain: city.id === 'dubai' ? 4 : city.id === 'reykjavik' ? 62 : city.id === 'tokyo' ? 28 : 47,
    wind: city.id === 'dubai' ? 14 : city.id === 'reykjavik' ? 24 : city.id === 'tokyo' ? 15 : 21,
  }

  return {
    tempDelta: city.temperatureC - monthlyBaseline.temperature,
    rainDelta: city.precipitation - monthlyBaseline.rain,
    windDelta: city.windKph - monthlyBaseline.wind,
  }
}

function getMomentRecommendation(city: CityWeather, moment: (typeof travelMoments)[number]) {
  const baseTemp = city.temperatureC + (moment === 'Midday' ? 3 : moment === 'Night' ? -4 : moment === 'Evening' ? -1 : 0)
  const rainWeight = city.precipitation + (moment === 'Evening' ? 8 : 0)
  const comfort = clampPercent(100 - Math.abs(baseTemp - 22) * 3 - rainWeight * 0.4 - city.windKph * 0.35)
  const note =
    comfort >= 72
      ? 'Best window for long walks and outdoor dining.'
      : comfort >= 48
        ? 'Works for errands and short outdoor plans.'
        : 'Indoor fallback or careful timing recommended.'
  return { comfort, note, tempC: baseTemp }
}

function getLayerTone(layer: MapLayer) {
  switch (layer) {
    case 'temperature':
      return 'linear-gradient(135deg, rgba(255,172,89,0.22), rgba(255,92,92,0.1))'
    case 'precipitation':
      return 'linear-gradient(135deg, rgba(92,186,255,0.22), rgba(94,118,255,0.12))'
    case 'wind':
      return 'linear-gradient(135deg, rgba(111,255,215,0.18), rgba(98,179,255,0.1))'
    case 'clouds':
      return 'linear-gradient(135deg, rgba(222,236,245,0.16), rgba(128,157,173,0.08))'
  }
}

function mergeCityWeather(base: CityWeather, edited?: EditedWeather): CityWeather {
  return edited ? { ...base, ...edited } : base
}

function getNotifications(city: CityWeather, profile: UserProfile) {
  return notificationCatalog.filter((item) => item.cityId === city.id).concat(
    city.uvIndex >= 8
      ? [
          {
            id: `${city.id}-uv-dynamic`,
            cityId: city.id,
            type: 'uv' as const,
            title: 'Protective UV routine recommended',
            detail: `${profile.name}, your current profile settings indicate elevated midday discomfort.`,
            severity: 'Elevated' as const,
            window: 'Midday',
          },
        ]
      : [],
    city.airQuality >= 70
      ? [
          {
            id: `${city.id}-air-dynamic`,
            cityId: city.id,
            type: 'air' as const,
            title: 'Air strain advisory',
            detail: 'Reduce sustained outdoor intensity and prefer protected transport transitions.',
            severity: 'Elevated' as const,
            window: 'Current cycle',
          },
        ]
      : [],
  )
}

function getProfileBias(city: CityWeather, profile: UserProfile) {
  const heatPenalty = city.temperatureC > 26 ? ((city.temperatureC - 26) * profile.heatSensitivity) / 20 : 0
  const coldPenalty = city.temperatureC < 4 ? ((4 - city.temperatureC) * profile.coldSensitivity) / 16 : 0
  return clampPercent(100 - heatPenalty - coldPenalty)
}

function getActivityRecommendations(city: CityWeather, profile: UserProfile) {
  const items = [
    {
      label: 'Running',
      score: Math.round(getRunScore(city) * (profile.activity === 'runner' ? 1.08 : 1)),
      note: city.precipitation > 55 ? 'Intervals indoors or on sheltered loops.' : 'Outdoor pacing window remains usable.',
    },
    {
      label: 'Walking',
      score: Math.round(getComfortScore(city) * 0.96),
      note: city.windKph > 24 ? 'Prefer short segments with wind cover.' : 'Best general-purpose outdoor option.',
    },
    {
      label: 'Photography',
      score: Math.round(getPhotoScore(city) * (profile.activity === 'photographer' ? 1.1 : 1)),
      note: city.visibilityKm >= 10 ? 'Good scene depth and skyline definition.' : 'Lower contrast and softer distance detail.',
    },
    {
      label: 'Beach',
      score: Math.round(getSeaScore(city)),
      note: city.id === 'dubai' ? 'Watch heat load even when conditions look calm.' : 'Only viable in warmer, lower-wind windows.',
    },
    {
      label: 'Commute',
      score: Math.round(getCommuteScore(city) * (profile.activity === 'commuter' ? 1.08 : 1)),
      note: city.condition === 'Storm' ? 'Transit reliability is the main constraint.' : 'General city movement is manageable.',
    },
    {
      label: 'Travel transfer',
      score: Math.round((getCommuteScore(city) + getComfortScore(city)) / 2),
      note: city.alerts.length > 0 ? 'Build buffer time around active alerts.' : 'Transfer confidence stays relatively stable.',
    },
  ]

  return items.map((item) => ({ ...item, score: clampPercent(item.score) }))
}

function getWardrobe(city: CityWeather, profile: UserProfile) {
  const coldAdjusted = city.temperatureC - profile.coldSensitivity / 25
  const heatAdjusted = city.temperatureC + profile.heatSensitivity / 25

  return [
    {
      slot: 'Outer layer',
      value: coldAdjusted <= 8 ? 'Insulated shell' : coldAdjusted <= 17 ? 'Light jacket' : 'No shell needed',
    },
    {
      slot: 'Base',
      value: heatAdjusted >= 30 ? 'Breathable tee' : coldAdjusted <= 6 ? 'Thermal layer' : 'Regular layer',
    },
    {
      slot: 'Footwear',
      value: city.precipitation >= 50 ? 'Water-resistant shoes' : city.condition === 'Snow' ? 'Grip boots' : 'Standard sneakers',
    },
    {
      slot: 'Accessories',
      value:
        city.uvIndex >= 7
          ? 'Sunglasses + SPF'
          : city.windKph >= 26
            ? 'Wind cover + hood'
            : city.condition === 'Snow'
              ? 'Gloves + beanie'
              : 'Light essentials',
    },
  ]
}

function getRouteRisk(city: CityWeather) {
  return [
    {
      route: 'Home -> Work',
      score: Math.round(getCommuteScore(city)),
      note: city.precipitation > 60 ? 'Departure buffer recommended.' : 'Standard departure window is acceptable.',
    },
    {
      route: 'Hotel -> Downtown',
      score: Math.round((getComfortScore(city) + getCommuteScore(city)) / 2),
      note: city.windKph > 25 ? 'Street-level comfort drops in open corridors.' : 'Tourist transfer looks workable.',
    },
    {
      route: 'Airport -> Center',
      score: Math.round(getCommuteScore(city) - city.alerts.length * 6),
      note: city.alerts.length > 0 ? 'Keep margin for traffic/weather variability.' : 'Arrival routing is relatively stable.',
    },
  ]
}

function getHistoryStates(city: CityWeather) {
  return [
    { label: 'Yesterday', deltaTemp: -2, deltaRain: 10, deltaWind: -4 },
    { label: '3 days ago', deltaTemp: 1, deltaRain: -14, deltaWind: 3 },
    { label: 'Last week', deltaTemp: -4, deltaRain: 18, deltaWind: 6 },
    { label: 'Monthly norm', deltaTemp: -getClimateComparison(city).tempDelta, deltaRain: -getClimateComparison(city).rainDelta, deltaWind: -getClimateComparison(city).windDelta },
  ]
}

function getThemeSurface(condition: WeatherCondition) {
  switch (condition) {
    case 'Sunny':
    case 'Clear':
      return {
        background:
          'radial-gradient(circle at top left, rgba(255, 201, 102, 0.34), transparent 32%), radial-gradient(circle at top right, rgba(255, 127, 80, 0.2), transparent 26%), linear-gradient(135deg, #241304 0%, #3b2410 48%, #22140d 100%)',
      }
    case 'Storm':
      return {
        background:
          'radial-gradient(circle at top left, rgba(126, 116, 255, 0.28), transparent 32%), radial-gradient(circle at top right, rgba(90, 174, 255, 0.18), transparent 28%), linear-gradient(135deg, #07101f 0%, #17213d 52%, #0b1524 100%)',
      }
    case 'Snow':
      return {
        background:
          'radial-gradient(circle at top left, rgba(205, 236, 255, 0.28), transparent 32%), radial-gradient(circle at top right, rgba(121, 170, 255, 0.16), transparent 28%), linear-gradient(135deg, #0c1621 0%, #183247 52%, #10202c 100%)',
      }
    case 'Rain':
      return {
        background:
          'radial-gradient(circle at top left, rgba(82, 157, 255, 0.3), transparent 32%), radial-gradient(circle at top right, rgba(68, 227, 196, 0.16), transparent 28%), linear-gradient(135deg, #06131f 0%, #12314a 52%, #0c1725 100%)',
      }
    default:
      return {
        background:
          'radial-gradient(circle at top left, rgba(82, 157, 255, 0.35), transparent 32%), radial-gradient(circle at top right, rgba(68, 227, 196, 0.22), transparent 28%), linear-gradient(135deg, #04131f 0%, #0b2434 52%, #0c1725 100%)',
      }
  }
}

function getPresetNarrative(preset: DashboardPreset) {
  switch (preset) {
    case 'travel':
      return 'Transit, route reliability, alerts and transfer windows are prioritized.'
    case 'fitness':
      return 'Running, hydration, thermal load and exposure metrics are prioritized.'
    case 'photo':
      return 'Visibility, golden hour, cloud texture and skyline conditions are prioritized.'
    default:
      return 'Balanced product overview with mixed climate, forecast and planning blocks.'
  }
}

function getHealthSignals(city: CityWeather, profile: UserProfile) {
  const sleep = clampPercent(100 - Math.abs(city.temperatureC - 18) * 3 - city.humidity * 0.18 - city.windKph * 0.35)
  const respiratory = clampPercent(100 - city.airQuality * 0.72 - city.precipitation * 0.12)
  const migraine = clampPercent(100 - Math.abs(city.pressureHpa - 1012) * 3 - city.windKph * 0.4)
  const skin = clampPercent(100 - Math.abs(city.humidity - 50) * 1.3 - Math.max(0, city.uvIndex - 5) * 7)
  const thermal = clampPercent(
    100 -
      Math.max(0, city.temperatureC - 24) * (profile.heatSensitivity / 12) -
      Math.max(0, 8 - city.temperatureC) * (profile.coldSensitivity / 12),
  )

  return [
    { label: 'Sleep comfort', score: Math.round(sleep), note: 'Night recovery and bedroom ventilation friendliness.' },
    { label: 'Respiratory load', score: Math.round(respiratory), note: 'Air quality and moisture pressure on breathing comfort.' },
    { label: 'Migraine risk', score: Math.round(migraine), note: 'Pressure and wind stability against sensitivity spikes.' },
    { label: 'Skin balance', score: Math.round(skin), note: 'Humidity and UV stress for exposed skin.' },
    { label: 'Thermal tolerance', score: Math.round(thermal), note: 'How well the current city fits your profile thresholds.' },
  ]
}

function getTripChecklist(city: CityWeather) {
  return [
    {
      label: 'Hydration',
      status: city.temperatureC >= 28 || city.uvIndex >= 7 ? 'Required' : 'Optional',
      note: city.temperatureC >= 28 ? 'Carry water before extended outdoor movement.' : 'Short sessions stay manageable.',
    },
    {
      label: 'Outer shell',
      status: city.precipitation >= 40 || city.condition === 'Snow' ? 'Required' : 'Optional',
      note: city.precipitation >= 40 ? 'Rain protection improves trip reliability.' : 'A shell is not critical right now.',
    },
    {
      label: 'Transit buffer',
      status: city.alerts.length > 0 || city.condition === 'Storm' ? 'Required' : 'Optional',
      note: city.alerts.length > 0 ? 'Build extra time into transfers.' : 'Movement windows are comparatively stable.',
    },
    {
      label: 'Sun protection',
      status: city.uvIndex >= 6 ? 'Required' : 'Optional',
      note: city.uvIndex >= 6 ? 'SPF and eyewear should be part of the default kit.' : 'UV is not the dominant constraint.',
    },
  ]
}

function getWeeklyStrategy(city: CityWeather) {
  return city.weekly.map((entry) => {
    const comfort = clampPercent(100 - Math.abs(entry.highC - 22) * 3 - entry.rainChance * 0.45)
    const label =
      comfort >= 72
        ? 'Prime day'
        : comfort >= 48
          ? 'Manageable'
          : 'Protected plan'
    const note =
      entry.rainChance >= 60
        ? 'Keep indoor backups and flexible routes.'
        : entry.highC >= 30
          ? 'Heat planning matters through midday.'
          : 'Good candidate for extended outdoor blocks.'

    return { ...entry, comfort: Math.round(comfort), label, note }
  })
}

function getScenarioInsights(city: CityWeather, purpose: TripPurpose, profile: UserProfile) {
  const purposeBias =
    purpose === 'business'
      ? getCommuteScore(city)
      : purpose === 'outdoor'
        ? getRunScore(city)
        : purpose === 'nightlife'
          ? getPhotoScore(city)
          : getComfortScore(city)

  const resilience = clampPercent(
    (purposeBias + getProfileBias(city, profile) + getHydrationScore(city)) / 3,
  )

  const bestWindow =
    purpose === 'business'
      ? '09:00 - 12:00'
      : purpose === 'outdoor'
        ? '06:00 - 10:00'
        : purpose === 'nightlife'
          ? '18:00 - 23:00'
          : '15:00 - 20:00'

  const fallback =
    city.condition === 'Storm'
      ? 'Indoor transfer hubs'
      : city.condition === 'Snow'
        ? 'Short warm-stop route'
        : city.precipitation >= 50
          ? 'Covered blocks and transit anchors'
          : 'Open-air route remains viable'

  return {
    resilience: Math.round(resilience),
    bestWindow,
    fallback,
    briefing:
      purpose === 'business'
        ? 'Reliability and transfer confidence dominate the planning model.'
        : purpose === 'outdoor'
          ? 'Exposure, hydration, and traction conditions dominate the planning model.'
          : purpose === 'nightlife'
            ? 'Evening comfort, skyline quality, and late-route stability dominate the planning model.'
            : 'Balanced walking comfort and city exploration dominate the planning model.',
  }
}

function getFavoriteAnalytics(cities: CityWeather[], favorites: string[], unit: Unit) {
  return cities
    .filter((city) => favorites.includes(city.id))
    .map((city) => ({
      id: city.id,
      name: city.city,
      temp: formatTemp(city.temperatureC, unit),
      comfort: Math.round(getComfortScore(city)),
      mobility: Math.round(getCommuteScore(city)),
      aqi: city.airQuality,
      note:
        city.airQuality >= 80
          ? 'Air quality is the limiting factor.'
          : city.precipitation >= 55
            ? 'Rain management is the limiting factor.'
            : 'This favorite is currently broadly workable.',
    }))
}

function getNotificationDigest(notifications: NotificationItem[]) {
  const severe = notifications.filter((item) => item.severity === 'Severe').length
  const elevated = notifications.filter((item) => item.severity === 'Elevated').length
  const moderate = notifications.filter((item) => item.severity === 'Moderate').length

  return [
    { label: 'Severe', value: severe, note: 'Immediate planning friction.' },
    { label: 'Elevated', value: elevated, note: 'Noticeable operational impact.' },
    { label: 'Moderate', value: moderate, note: 'Useful but lower-priority context.' },
  ]
}

function getEmergencyKit(city: CityWeather) {
  return [
    {
      label: 'Weather protection',
      value:
        city.condition === 'Snow'
          ? 'Gloves, hat, traction-ready shoes'
          : city.condition === 'Storm'
            ? 'Umbrella, shell, waterproof storage'
            : city.precipitation >= 45
              ? 'Compact umbrella and shell'
              : 'Minimal protective load',
    },
    {
      label: 'Air and heat',
      value:
        city.airQuality >= 75
          ? 'Mask-friendly carry and hydration reserve'
          : city.uvIndex >= 7
            ? 'SPF, eyewear, water'
            : 'Standard hydration and comfort kit',
    },
    {
      label: 'Mobility backup',
      value:
        city.windKph >= 26 || city.alerts.length > 0
          ? 'Transit alt-route and extra transfer time'
          : 'Primary route is sufficient',
    },
  ]
}

function getMicroClimateBands(city: CityWeather) {
  return [
    {
      zone: 'Waterfront',
      temp: city.temperatureC - 1,
      wind: city.windKph + 6,
      note: 'Sharper wind and quicker chill after sunset.',
    },
    {
      zone: 'Downtown core',
      temp: city.temperatureC + 2,
      wind: Math.max(0, city.windKph - 3),
      note: 'Urban heat retention and reduced airflow.',
    },
    {
      zone: 'Parks and open areas',
      temp: city.temperatureC,
      wind: city.windKph + 2,
      note: 'Feels closer to the true ambient pattern.',
    },
    {
      zone: 'Transit corridors',
      temp: city.temperatureC + 1,
      wind: city.windKph + 1,
      note: 'Crowding and shelter create uneven comfort pockets.',
    },
  ]
}

function getMonthlyLedger(city: CityWeather) {
  const baselines = [
    ['Jan', city.lowC - 5, city.precipitation + 8],
    ['Feb', city.lowC - 4, city.precipitation + 6],
    ['Mar', city.lowC - 2, city.precipitation + 4],
    ['Apr', city.temperatureC - 3, city.precipitation + 2],
    ['May', city.temperatureC - 1, city.precipitation],
    ['Jun', city.temperatureC, city.precipitation - 3],
    ['Jul', city.highC - 1, city.precipitation - 6],
    ['Aug', city.highC, city.precipitation - 4],
    ['Sep', city.temperatureC - 1, city.precipitation + 1],
    ['Oct', city.temperatureC - 3, city.precipitation + 5],
    ['Nov', city.lowC - 1, city.precipitation + 7],
    ['Dec', city.lowC - 3, city.precipitation + 9],
  ] as const

  return baselines.map(([month, tempC, rain]) => ({
    month,
    tempC,
    rain: clampPercent(rain),
    label:
      rain >= 65 ? 'Wet leaning' : tempC >= 28 ? 'Hot leaning' : tempC <= 2 ? 'Cold leaning' : 'Balanced',
  }))
}

function getTransitModes(city: CityWeather) {
  return [
    {
      mode: 'Walking',
      score: Math.round(getComfortScore(city)),
      note: city.precipitation >= 50 ? 'Use shorter open-air segments.' : 'Best for fine-grained city exploration.',
    },
    {
      mode: 'Bike / scooter',
      score: clampPercent(Math.round(getComfortScore(city) - city.windKph * 0.6 - city.precipitation * 0.25)),
      note: city.windKph >= 24 ? 'Crosswinds reduce confidence.' : 'Fast and efficient in stable windows.',
    },
    {
      mode: 'Metro / rail',
      score: clampPercent(Math.round(getCommuteScore(city) + 8)),
      note: city.alerts.length > 0 ? 'Still the strongest fallback during instability.' : 'High baseline reliability.',
    },
    {
      mode: 'Taxi / rideshare',
      score: clampPercent(Math.round(getCommuteScore(city) - 4)),
      note: city.condition === 'Storm' ? 'Demand spikes reduce predictability.' : 'Good sheltered option.',
    },
  ]
}

function getHabitWindows(city: CityWeather, profile: UserProfile) {
  return [
    {
      habit: 'Morning run',
      score: clampPercent(Math.round((getRunScore(city) + getProfileBias(city, profile)) / 2)),
      note: 'Best when thermal load and precipitation are both low.',
    },
    {
      habit: 'Deep work commute',
      score: clampPercent(Math.round((getCommuteScore(city) + getProfileBias(city, profile)) / 2)),
      note: 'Optimized for predictable transfers and low friction.',
    },
    {
      habit: 'Golden-hour walk',
      score: clampPercent(Math.round((getPhotoScore(city) + getComfortScore(city)) / 2)),
      note: 'Combines visual atmosphere and route comfort.',
    },
    {
      habit: 'Night recovery',
      score: clampPercent(Math.round((getHealthSignals(city, profile)[0].score + getHealthSignals(city, profile)[3].score) / 2)),
      note: 'Night ventilation, comfort, and skin balance weighted together.',
    },
  ]
}

function getPhotoPlan(city: CityWeather) {
  return [
    {
      frame: 'Skyline',
      score: clampPercent(Math.round(getPhotoScore(city))),
      note: city.visibilityKm >= 10 ? 'Long-distance definition should hold up.' : 'Haze softens edge separation.',
    },
    {
      frame: 'Street detail',
      score: clampPercent(Math.round(getComfortScore(city) + 5)),
      note: city.precipitation >= 40 ? 'Reflections improve mood but reduce gear safety.' : 'Street work stays straightforward.',
    },
    {
      frame: 'Waterfront',
      score: clampPercent(Math.round(getPhotoScore(city) - city.windKph * 0.4)),
      note: city.windKph >= 25 ? 'Tripod and audio stability become harder.' : 'Good for open compositions.',
    },
    {
      frame: 'Night lights',
      score: clampPercent(Math.round((getPhotoScore(city) + getCommuteScore(city)) / 2)),
      note: city.condition === 'Rain' ? 'Wet surfaces can improve contrast and highlights.' : 'Mobility and visibility are the main levers.',
    },
  ]
}

function getRiskMatrix(city: CityWeather) {
  return [
    {
      label: 'Heat',
      score: clampPercent(Math.round(Math.max(0, city.temperatureC - 24) * 8 + city.uvIndex * 3)),
      note: 'Driven by temperature surplus and UV load.',
    },
    {
      label: 'Slip / wet surface',
      score: clampPercent(Math.round(city.precipitation * 0.8)),
      note: 'Driven by rain probability and route exposure.',
    },
    {
      label: 'Air strain',
      score: clampPercent(Math.round(city.airQuality * 0.8)),
      note: 'Driven by AQI and duration of exposure.',
    },
    {
      label: 'Wind disruption',
      score: clampPercent(Math.round(city.windKph * 1.6)),
      note: 'Driven by gust pressure and route openness.',
    },
  ]
}

function getPackingMatrix(city: CityWeather, purpose: TripPurpose) {
  return [
    {
      label: 'Core clothing',
      value:
        city.temperatureC <= 8
          ? 'Layered warm system'
          : city.temperatureC >= 30
            ? 'Light breathable setup'
            : 'Balanced mixed-weather setup',
    },
    {
      label: 'Tech carry',
      value:
        purpose === 'business'
          ? 'Battery, cable kit, umbrella-safe bag'
          : purpose === 'nightlife'
            ? 'Compact carry and low-bulk essentials'
            : 'Standard mobile and charging kit',
    },
    {
      label: 'Footwear logic',
      value:
        city.precipitation >= 45
          ? 'Water-resistant pair'
          : purpose === 'outdoor'
            ? 'Grip-first walking pair'
            : 'Comfort-first urban pair',
    },
    {
      label: 'Optional extras',
      value:
        city.airQuality >= 75
          ? 'Mask, eye drops, hydration tabs'
          : city.uvIndex >= 7
            ? 'Cap, SPF, sunglasses'
            : 'Minimal extras are enough',
    },
  ]
}

function getBenchmarkAgainstHome(city: CityWeather, homeCity: CityWeather) {
  return [
    {
      label: 'Temperature delta',
      value: city.temperatureC - homeCity.temperatureC,
      unit: 'C',
      note: `Compared with ${homeCity.city}.`,
    },
    {
      label: 'Rain delta',
      value: city.precipitation - homeCity.precipitation,
      unit: '%',
      note: `Compared with ${homeCity.city}.`,
    },
    {
      label: 'Wind delta',
      value: city.windKph - homeCity.windKph,
      unit: 'km/h',
      note: `Compared with ${homeCity.city}.`,
    },
    {
      label: 'AQI delta',
      value: city.airQuality - homeCity.airQuality,
      unit: '',
      note: `Compared with ${homeCity.city}.`,
    },
  ]
}

function getAdvisoryScripts(city: CityWeather, profile: UserProfile, purpose: TripPurpose) {
  return [
    {
      title: 'Departure briefing',
      body:
        city.alerts.length > 0
          ? 'Start with the alerts panel and build slack into any exposed movement block.'
          : 'The current city has no heavy operational blockers, so timing is the main lever.',
    },
    {
      title: 'Profile-specific note',
      body:
        profile.heatSensitivity > profile.coldSensitivity
          ? 'Heat response should be managed before route efficiency.'
          : 'Cold exposure should be managed before long outdoor dwell time.',
    },
    {
      title: 'Purpose script',
      body:
        purpose === 'business'
          ? 'Bias toward the most reliable transit chain rather than the shortest one.'
          : purpose === 'outdoor'
            ? 'Bias toward lower exposure windows rather than fixed itineraries.'
            : purpose === 'nightlife'
              ? 'Bias toward evening atmosphere and safe return routes.'
              : 'Bias toward flexible city exploration with multiple fallback stops.',
    },
    {
      title: 'Final summary',
      body: getWeatherNarrative(city),
    },
  ]
}

function getRecoveryPlan(city: CityWeather, profile: UserProfile) {
  return [
    {
      label: 'Hydration reset',
      score: clampPercent(Math.round(getHydrationScore(city))),
      note: city.temperatureC >= 28 ? 'Front-load fluids before the late afternoon drop.' : 'Standard rehydration pacing is enough.',
    },
    {
      label: 'Sleep setup',
      score: getHealthSignals(city, profile)[0].score,
      note: city.humidity >= 70 ? 'Ventilation matters more than insulation tonight.' : 'Keep a stable room temperature and reduce late heat exposure.',
    },
    {
      label: 'Respiratory reset',
      score: getHealthSignals(city, profile)[1].score,
      note: city.airQuality >= 75 ? 'Limit long open-air recovery walks.' : 'Light outdoor recovery remains viable.',
    },
    {
      label: 'Foot recovery',
      score: clampPercent(Math.round(100 - city.precipitation * 0.4 - city.windKph * 0.4)),
      note: city.precipitation >= 45 ? 'Dry footwear and friction prevention are a priority.' : 'Standard recovery is enough after city mileage.',
    },
  ]
}

function getOperationsCenter(city: CityWeather, profile: UserProfile, purpose: TripPurpose) {
  return [
    {
      label: 'Execution confidence',
      score: clampPercent(Math.round((getComfortScore(city) + getCommuteScore(city) + getProfileBias(city, profile)) / 3)),
      note: 'Overall confidence across movement, exposure, and personal fit.',
    },
    {
      label: 'Schedule stability',
      score: clampPercent(Math.round(100 - city.alerts.length * 14 - city.precipitation * 0.25)),
      note: 'How likely your planned order of events survives the weather intact.',
    },
    {
      label: 'Purpose fit',
      score: getScenarioInsights(city, purpose, profile).resilience,
      note: 'How well the city matches the currently selected trip intent.',
    },
    {
      label: 'Fallback depth',
      score: clampPercent(Math.round(getCommuteScore(city) + (city.alerts.length === 0 ? 14 : 0))),
      note: 'How many backup options remain viable when the first plan degrades.',
    },
  ]
}

function getCityDossier(city: CityWeather) {
  return [
    { label: 'Atmosphere', value: city.summary },
    { label: 'Pressure trend', value: formatPressureTrend(city.pressureHpa) },
    { label: 'Moon phase', value: city.moonPhase },
    { label: 'Dominant concern', value: city.airQuality >= 80 ? 'Air strain' : city.precipitation >= 60 ? 'Wet routing' : city.uvIndex >= 8 ? 'Heat / UV' : 'Balanced planning' },
    { label: 'Station elevation', value: `${city.seaLevelM} m` },
    { label: 'Visibility class', value: city.visibilityKm >= 12 ? 'Long-range clear' : city.visibilityKm >= 8 ? 'Moderate range' : 'Compressed range' },
  ]
}

function getDefaultTaskTemplates(purpose: TripPurpose) {
  if (purpose === 'business') {
    return ['Confirm primary route', 'Pack charging kit', 'Add buffer before first meeting']
  }
  if (purpose === 'outdoor') {
    return ['Check hydration load', 'Pack weather layer', 'Confirm low-exposure window']
  }
  if (purpose === 'nightlife') {
    return ['Check late return route', 'Plan weather-safe carry', 'Save backup ride option']
  }
  return ['Pin must-see zones', 'Save a fallback indoor stop', 'Prepare a flexible walking route']
}

function getDecisionMatrix(city: CityWeather, profile: UserProfile, purpose: TripPurpose) {
  return [
    {
      label: 'Go now',
      score: clampPercent(Math.round((getComfortScore(city) + getProfileBias(city, profile)) / 2)),
      note: 'Best if you want immediate action with minimal re-planning.',
    },
    {
      label: 'Delay slightly',
      score: clampPercent(Math.round((getScenarioInsights(city, purpose, profile).resilience + getTravelDelayBuffer(city)) / 2)),
      note: 'Useful when the next better window is reasonably close.',
    },
    {
      label: 'Use fallback plan',
      score: clampPercent(Math.round(100 - getCommuteScore(city) + city.alerts.length * 8)),
      note: 'Best when weather friction is already degrading the primary plan.',
    },
  ]
}

function getTravelDelayBuffer(city: CityWeather) {
  return clampPercent(Math.round(100 - city.precipitation * 0.35 - city.windKph * 0.5 - city.alerts.length * 10))
}

function getDaypartOperations(city: CityWeather) {
  return [
    { label: 'Early morning', score: clampPercent(Math.round(getComfortScore(city) + 6)), note: 'Usually the lowest-exposure window.' },
    { label: 'Late morning', score: clampPercent(Math.round(getCommuteScore(city) + 2)), note: 'Good for scheduled movement and errands.' },
    { label: 'Afternoon', score: clampPercent(Math.round(getHydrationScore(city))), note: 'Heat and UV load matter more here.' },
    { label: 'Evening', score: clampPercent(Math.round((getPhotoScore(city) + getComfortScore(city)) / 2)), note: 'Best balance of atmosphere and walkability.' },
  ]
}

function getNeighborhoodGuide(city: CityWeather) {
  return [
    {
      label: 'Business district',
      note: city.condition === 'Storm' ? 'Protected transfers matter most.' : 'Fastest place for reliable movement blocks.',
    },
    {
      label: 'Cultural core',
      note: city.precipitation >= 45 ? 'Indoor anchors make it a strong fallback zone.' : 'Good for flexible walking loops and long stays.',
    },
    {
      label: 'Waterfront',
      note: city.windKph >= 24 ? 'Use selectively because of wind exposure.' : 'Best for open visuals and sunset pacing.',
    },
    {
      label: 'Residential edges',
      note: city.airQuality >= 75 ? 'Prefer shorter stays if air quality is the limiting factor.' : 'Often calmer and better for recovery pacing.',
    },
  ]
}

function getFieldGuide(city: CityWeather, purpose: TripPurpose) {
  return [
    {
      title: 'What to do first',
      body:
        city.alerts.length > 0
          ? 'Open alerts, save one fallback route, and delay non-essential open-air segments.'
          : 'Lock the best window first, then let the rest of the plan stay flexible.',
    },
    {
      title: 'Best habit to protect',
      body:
        purpose === 'business'
          ? 'Protect schedule reliability before comfort.'
          : purpose === 'outdoor'
            ? 'Protect hydration and exposure limits before pace.'
            : purpose === 'nightlife'
              ? 'Protect safe late return options before spontaneity.'
              : 'Protect flexibility before committing to fixed route order.',
    },
    {
      title: 'Fastest risk reducer',
      body:
        city.precipitation >= 50
          ? 'Shift to covered nodes and reduce open transfers.'
          : city.airQuality >= 75
            ? 'Reduce duration outside rather than speed.'
            : city.uvIndex >= 7
              ? 'Move earlier or later and treat shade as infrastructure.'
              : 'Tighten route sequencing to avoid unnecessary backtracking.',
    },
  ]
}

function getQuickWins(city: CityWeather) {
  return [
    {
      label: 'Best immediate action',
      note:
        city.precipitation < 30 && city.windKph < 22
          ? 'Take the next outdoor block while conditions are stable.'
          : 'Re-check route before committing to the next transfer.',
    },
    {
      label: 'Most fragile factor',
      note:
        city.condition === 'Storm'
          ? 'Exposed movement reliability'
          : city.airQuality >= 80
            ? 'Long-duration outdoor comfort'
            : city.uvIndex >= 8
              ? 'Midday exposure'
              : 'Plan rigidity',
    },
    {
      label: 'Best fallback anchor',
      note:
        city.alerts.length > 0
          ? 'Transit-heavy route with indoor stops'
          : 'Flexible mixed indoor-outdoor route',
    },
  ]
}

function getSignalSummary(city: CityWeather) {
  return [
    {
      label: 'Primary green flag',
      note:
        city.visibilityKm >= 10 && city.precipitation < 30
          ? 'Visibility and surface conditions support open movement.'
          : 'No major green flag dominates this cycle.',
    },
    {
      label: 'Primary red flag',
      note:
        city.condition === 'Storm'
          ? 'Thunderstorm volatility is the primary blocker.'
          : city.airQuality >= 80
            ? 'Air quality is the primary blocker.'
            : city.uvIndex >= 8
              ? 'Heat and UV load are the primary blockers.'
              : 'No single red flag dominates.',
    },
    {
      label: 'Best time block',
      note:
        city.temperatureC >= 28
          ? 'Early or late hours.'
          : city.precipitation >= 45
            ? 'Whichever block follows the driest forecast slice.'
            : 'Late afternoon into early evening.',
    },
    {
      label: 'Best planning mindset',
      note: city.alerts.length > 0 ? 'Flexible and buffer-first.' : 'Structured but still adaptable.',
    },
  ]
}

function getConditionAccent(condition: WeatherCondition) {
  switch (condition) {
    case 'Sunny':
    case 'Clear':
      return 'rgba(255, 193, 92, 0.95)'
    case 'Partly Cloudy':
      return 'rgba(118, 233, 255, 0.95)'
    case 'Cloudy':
      return 'rgba(194, 214, 227, 0.9)'
    case 'Rain':
      return 'rgba(116, 170, 255, 0.95)'
    case 'Storm':
      return 'rgba(177, 142, 255, 0.95)'
    case 'Snow':
      return 'rgba(224, 243, 255, 0.96)'
    case 'Windy':
      return 'rgba(134, 244, 212, 0.94)'
  }
}

function WeatherGlyph({ condition, large = false }: { condition: WeatherCondition; large?: boolean }) {
  const accent = getConditionAccent(condition)
  const className = large ? 'weather-icon large' : 'weather-icon'

  if (condition === 'Sunny' || condition === 'Clear') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="11" fill={accent} />
        {[...Array(8)].map((_, index) => {
          const angle = (Math.PI / 4) * index
          const x1 = 32 + Math.cos(angle) * 18
          const y1 = 32 + Math.sin(angle) * 18
          const x2 = 32 + Math.cos(angle) * 26
          const y2 = 32 + Math.sin(angle) * 26
          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="4" strokeLinecap="round" />
        })}
      </svg>
    )
  }

  if (condition === 'Storm') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M18 40c-7 0-12-5-12-11s5-11 12-11c2 0 4 .4 5.8 1.2C26.6 13.7 32.1 10 38.5 10c9 0 16.4 7.1 16.4 16 0 8-6 14-14 14H18Z" fill="rgba(214,224,239,0.85)" />
        <path d="M31 34h8l-5 10h6L28 58l4-12h-6l5-12Z" fill={accent} />
      </svg>
    )
  }

  if (condition === 'Rain') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M17 38c-7 0-12-5-12-11s5-11 12-11c1.5 0 3 .2 4.3.7C24 10.8 29.3 8 35.3 8c8.4 0 15.2 6.6 15.2 14.8 0 8.3-6.8 15.2-15.2 15.2H17Z" fill="rgba(214,224,239,0.85)" />
        <path d="M22 44l-4 8M34 44l-4 8M46 44l-4 8" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  }

  if (condition === 'Snow') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M17 38c-7 0-12-5-12-11s5-11 12-11c1.5 0 3 .2 4.3.7C24 10.8 29.3 8 35.3 8c8.4 0 15.2 6.6 15.2 14.8 0 8.3-6.8 15.2-15.2 15.2H17Z" fill="rgba(214,224,239,0.85)" />
        <g stroke={accent} strokeWidth="3" strokeLinecap="round">
          <path d="M20 46h8M24 42v8M38 46h8M42 42v8" />
          <path d="M21 43l6 6M27 43l-6 6M39 43l6 6M45 43l-6 6" />
        </g>
      </svg>
    )
  }

  if (condition === 'Windy') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <path d="M12 25h24c4 0 7-3 7-7 0-3.3-2.7-6-6-6-2.9 0-5.3 2-5.9 4.7" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        <path d="M10 34h38c4 0 6 2.7 6 6s-3 7-7 7c-2.8 0-5.2-1.8-6-4.3" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        <path d="M15 44h15" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="8" fill="rgba(255, 205, 92, 0.9)" />
      <path d="M22 42c-7 0-12-5-12-11s5-11 12-11c1.8 0 3.6.4 5.2 1.1C29.9 16.1 35.3 13 41.5 13 50.1 13 57 19.6 57 28.1 57 35.7 51 42 43 42H22Z" fill="rgba(214,224,239,0.88)" />
    </svg>
  )
}

function App() {
  const [selectedCityId, setSelectedCityId] = useState(() => localStorage.getItem('weather-city') ?? weatherData[0].id)
  const [unit, setUnit] = useState<Unit>(() => (localStorage.getItem('weather-unit') === 'F' ? 'F' : 'C'))
  const [query, setQuery] = useState('')
  const [tick, setTick] = useState(0)
  const [timelineIndex, setTimelineIndex] = useState(0)
  const [mapLayer, setMapLayer] = useState<MapLayer>('temperature')
  const [compareMode, setCompareMode] = useState<'comfort' | 'mobility'>('comfort')
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('weather-favorites') ?? '["tokyo","dubai"]'))
  const [profile, setProfile] = useState<UserProfile>(() => JSON.parse(localStorage.getItem('weather-profile') ?? JSON.stringify(defaultProfile)))
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [showEditorPanel, setShowEditorPanel] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(0)
  const [editedWeather, setEditedWeather] = useState<Record<string, EditedWeather>>(() => JSON.parse(localStorage.getItem('weather-edits') ?? '{}'))
  const [preset, setPreset] = useState<DashboardPreset>(() => (localStorage.getItem('weather-preset') as DashboardPreset) || 'overview')
  const [notificationFilter, setNotificationFilter] = useState<NotificationType | 'all'>('all')
  const [journalDraft, setJournalDraft] = useState('')
  const [journal, setJournal] = useState<Record<string, string[]>>(() => JSON.parse(localStorage.getItem('weather-journal') ?? '{}'))
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => JSON.parse(localStorage.getItem('weather-saved-views') ?? '[]'))
  const [settings, setSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('weather-settings') ?? '{"motion":true,"denseCards":false,"advisoryMode":true}'))
  const [tripPurpose, setTripPurpose] = useState<TripPurpose>(() => (localStorage.getItem('weather-trip-purpose') as TripPurpose) || 'city-break')
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
    () =>
      JSON.parse(
        localStorage.getItem('weather-notification-prefs') ??
          '{"storm":true,"air":true,"uv":true,"commute":true,"hydration":true,"travel":true}',
      ),
  )
  const [tripTasks, setTripTasks] = useState<Record<string, TripTask[]>>(() => JSON.parse(localStorage.getItem('weather-trip-tasks') ?? '{}'))
  const [taskDraft, setTaskDraft] = useState('')
  const deferredQuery = useDeferredValue(query)
  const searchId = useId()

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('weather-city', selectedCityId)
  }, [selectedCityId])

  useEffect(() => {
    localStorage.setItem('weather-unit', unit)
  }, [unit])

  useEffect(() => {
    localStorage.setItem('weather-favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem('weather-profile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem('weather-edits', JSON.stringify(editedWeather))
  }, [editedWeather])

  useEffect(() => {
    localStorage.setItem('weather-preset', preset)
  }, [preset])

  useEffect(() => {
    localStorage.setItem('weather-journal', JSON.stringify(journal))
  }, [journal])

  useEffect(() => {
    localStorage.setItem('weather-saved-views', JSON.stringify(savedViews))
  }, [savedViews])

  useEffect(() => {
    localStorage.setItem('weather-settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem('weather-trip-purpose', tripPurpose)
  }, [tripPurpose])

  useEffect(() => {
    localStorage.setItem('weather-notification-prefs', JSON.stringify(notificationPrefs))
  }, [notificationPrefs])

  useEffect(() => {
    localStorage.setItem('weather-trip-tasks', JSON.stringify(tripTasks))
  }, [tripTasks])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowCommandPalette((value) => !value)
      }
      if (event.key === 'Escape') {
        setShowCommandPalette(false)
        setShowProfilePanel(false)
        setShowEditorPanel(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const data = useMemo(() => weatherData.map((item) => mergeCityWeather(item, editedWeather[item.id])), [editedWeather])
  const city = data.find((item) => item.id === selectedCityId) ?? data[0]
  const timeline = useMemo(() => buildTimeline(city), [city])
  const filteredCities = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase()
    if (!normalized) return data
    return data.filter((item) => `${item.city} ${item.country}`.toLowerCase().includes(normalized))
  }, [data, deferredQuery])

  const daylightProgress = useMemo(() => {
    const [riseHour, riseMinute] = city.sunrise.split(':').map(Number)
    const [setHour, setMinute] = city.sunset.split(':').map(Number)
    const current = formatLocalTime(city.timezoneOffset, tick)
    const [hour, minute] = current.split(':').map(Number)
    const rise = riseHour * 60 + riseMinute
    const sunset = setHour * 60 + setMinute
    const now = hour * 60 + minute
    if (now <= rise) return 0
    if (now >= sunset) return 100
    return ((now - rise) / (sunset - rise)) * 100
  }, [city.sunrise, city.sunset, city.timezoneOffset, tick])

  useEffect(() => {
    setTimelineIndex(0)
  }, [city.id])

  const selectedTimeline = timeline[timelineIndex] ?? timeline[0]
  const astronomy = useMemo(() => getAstronomyFacts(city), [city])
  const airBreakdown = useMemo(() => getAirBreakdown(city), [city])
  const climate = useMemo(() => getClimateComparison(city), [city])
  const scores = useMemo(
    () => ({
      comfort: Math.round(getComfortScore(city)),
      hydration: Math.round(getHydrationScore(city)),
      running: Math.round(getRunScore(city)),
      commute: Math.round(getCommuteScore(city)),
      photography: Math.round(getPhotoScore(city)),
      coast: Math.round(getSeaScore(city)),
    }),
    [city],
  )
  const plannerMoments = useMemo(() => travelMoments.map((moment) => ({ moment, ...getMomentRecommendation(city, moment) })), [city])
  const networkAverageTemperature = useMemo(() => average(data.map((item) => item.temperatureC)), [data])
  const compareCities = useMemo(
    () =>
      [...data].sort((left, right) => {
        const leftScore = compareMode === 'comfort' ? getComfortScore(left) : getCommuteScore(left)
        const rightScore = compareMode === 'comfort' ? getComfortScore(right) : getCommuteScore(right)
        return rightScore - leftScore
      }),
    [compareMode, data],
  )
  const notifications = useMemo(() => getNotifications(city, profile), [city, profile])
  const filteredNotifications = useMemo(
    () =>
      (notificationFilter === 'all' ? notifications : notifications.filter((item) => item.type === notificationFilter)).filter(
        (item) => notificationPrefs[item.type],
      ),
    [notificationFilter, notificationPrefs, notifications],
  )
  const profileBias = useMemo(() => Math.round(getProfileBias(city, profile)), [city, profile])
  const activities = useMemo(() => getActivityRecommendations(city, profile), [city, profile])
  const wardrobe = useMemo(() => getWardrobe(city, profile), [city, profile])
  const routeRisk = useMemo(() => getRouteRisk(city), [city])
  const historyStates = useMemo(() => getHistoryStates(city), [city])
  const activeHistory = historyStates[historyIndex] ?? historyStates[0]
  const cityJournal = journal[city.id] ?? []
  const healthSignals = useMemo(() => getHealthSignals(city, profile), [city, profile])
  const tripChecklist = useMemo(() => getTripChecklist(city), [city])
  const weeklyStrategy = useMemo(() => getWeeklyStrategy(city), [city])
  const scenarioInsight = useMemo(() => getScenarioInsights(city, tripPurpose, profile), [city, profile, tripPurpose])
  const favoriteAnalytics = useMemo(() => getFavoriteAnalytics(data, favorites, unit), [data, favorites, unit])
  const notificationDigest = useMemo(() => getNotificationDigest(filteredNotifications), [filteredNotifications])
  const emergencyKit = useMemo(() => getEmergencyKit(city), [city])
  const microClimate = useMemo(() => getMicroClimateBands(city), [city])
  const monthlyLedger = useMemo(() => getMonthlyLedger(city), [city])
  const transitModes = useMemo(() => getTransitModes(city), [city])
  const habitWindows = useMemo(() => getHabitWindows(city, profile), [city, profile])
  const photoPlan = useMemo(() => getPhotoPlan(city), [city])
  const riskMatrix = useMemo(() => getRiskMatrix(city), [city])
  const homeCity = data.find((item) => item.id === profile.homeCityId) ?? city
  const packingMatrix = useMemo(() => getPackingMatrix(city, tripPurpose), [city, tripPurpose])
  const homeBenchmarks = useMemo(() => getBenchmarkAgainstHome(city, homeCity), [city, homeCity])
  const advisoryScripts = useMemo(() => getAdvisoryScripts(city, profile, tripPurpose), [city, profile, tripPurpose])
  const recoveryPlan = useMemo(() => getRecoveryPlan(city, profile), [city, profile])
  const operationsCenter = useMemo(() => getOperationsCenter(city, profile, tripPurpose), [city, profile, tripPurpose])
  const cityDossier = useMemo(() => getCityDossier(city), [city])
  const decisionMatrix = useMemo(() => getDecisionMatrix(city, profile, tripPurpose), [city, profile, tripPurpose])
  const daypartOperations = useMemo(() => getDaypartOperations(city), [city])
  const neighborhoodGuide = useMemo(() => getNeighborhoodGuide(city), [city])
  const fieldGuide = useMemo(() => getFieldGuide(city, tripPurpose), [city, tripPurpose])
  const quickWins = useMemo(() => getQuickWins(city), [city])
  const signalSummary = useMemo(() => getSignalSummary(city), [city])
  const currentTasks = tripTasks[city.id] ?? []
  const travelPlanner = useMemo(
    () => [
      { label: '06:00-09:00', score: Math.round((getComfortScore(city) + profileBias) / 2), note: 'Best for early transfers and lower thermal load.' },
      { label: '09:00-12:00', score: Math.round((getCommuteScore(city) + getComfortScore(city)) / 2), note: 'Balanced window for city movement and errands.' },
      { label: '12:00-15:00', score: Math.round((getHydrationScore(city) + getComfortScore(city)) / 2), note: 'Watch direct exposure, especially in high UV or heat.' },
      { label: '15:00-18:00', score: Math.round((getPhotoScore(city) + getComfortScore(city)) / 2), note: 'Good candidate for outdoor stops and visual scenes.' },
      { label: '18:00-22:00', score: Math.round((getPhotoScore(city) + getCommuteScore(city)) / 2), note: 'Useful for dining, skyline windows and late transfers.' },
    ],
    [city, profileBias],
  )
  const mapLabel =
    mapLayer === 'temperature'
      ? 'Thermal anomalies'
      : mapLayer === 'precipitation'
        ? 'Rainfall bands'
        : mapLayer === 'wind'
          ? 'Wind vectors'
          : 'Cloud density'
  const themeSurface = getThemeSurface(city.condition)

  function toggleFavorite(cityId: string) {
    setFavorites((current) => (current.includes(cityId) ? current.filter((item) => item !== cityId) : [...current, cityId]))
  }

  function updateCityField<K extends keyof EditedWeather>(cityId: string, field: K, value: NonNullable<EditedWeather[K]>) {
    setEditedWeather((current) => ({
      ...current,
      [cityId]: {
        ...current[cityId],
        [field]: value,
      },
    }))
  }

  function addJournalEntry() {
    const trimmed = journalDraft.trim()
    if (!trimmed) return
    setJournal((current) => ({
      ...current,
      [city.id]: [trimmed, ...(current[city.id] ?? [])].slice(0, 6),
    }))
    setJournalDraft('')
  }

  function saveCurrentView() {
    const entry: SavedView = {
      id: `${city.id}-${preset}-${mapLayer}-${unit}-${Date.now()}`,
      name: `${city.city} ${preset}`,
      cityId: city.id,
      preset,
      mapLayer,
      unit,
    }
    setSavedViews((current) => [entry, ...current].slice(0, 8))
  }

  function applySavedView(view: SavedView) {
    setSelectedCityId(view.cityId)
    setPreset(view.preset)
    setMapLayer(view.mapLayer)
    setUnit(view.unit)
  }

  function toggleNotificationPref(type: NotificationType) {
    setNotificationPrefs((current) => ({
      ...current,
      [type]: !current[type],
    }))
  }

  function addTripTask() {
    const trimmed = taskDraft.trim()
    if (!trimmed) return
    setTripTasks((current) => ({
      ...current,
      [city.id]: [{ id: `${city.id}-${Date.now()}`, text: trimmed, done: false }, ...(current[city.id] ?? [])].slice(0, 10),
    }))
    setTaskDraft('')
  }

  function toggleTripTask(taskId: string) {
    setTripTasks((current) => ({
      ...current,
      [city.id]: (current[city.id] ?? []).map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)),
    }))
  }

  function seedTripTasks() {
    setTripTasks((current) => ({
      ...current,
      [city.id]: getDefaultTaskTemplates(tripPurpose).map((text, index) => ({
        id: `${city.id}-${tripPurpose}-${index}`,
        text,
        done: false,
      })),
    }))
  }

  return (
    <div className={`page-shell ${settings.denseCards ? 'dense' : ''}`} style={themeSurface}>
      <style>{styles}</style>
      <main className="dashboard">
        <section className="topbar">
          <div className="branding">
            <span className="eyebrow">
              <span>Live mock environment</span>
              <span>4 cities</span>
            </span>
            <h1 className="title">Atmos Weather Dashboard</h1>
            <p className="subtitle">
              Large single-file React project with a dense interface, mock locations, unit switching,
              persisted state, search, and rich weather cards without splitting logic across extra files.
            </p>
            <div className="top-actions">
              <button type="button" className="soft-button" onClick={() => setShowCommandPalette(true)}>
                Command palette
              </button>
              <button type="button" className="soft-button" onClick={() => setShowProfilePanel(true)}>
                Personalization
              </button>
              <button type="button" className="soft-button" onClick={() => setShowEditorPanel(true)}>
                Mock editor
              </button>
            </div>
          </div>

          <div className="control-row">
            <label className="search" htmlFor={searchId}>
              <span className="search-icon">⌕</span>
              <input
                id={searchId}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city or country"
              />
            </label>

            <div className="unit-toggle" aria-label="Temperature units">
              {(['C', 'F'] as Unit[]).map((nextUnit) => (
                <button
                  key={nextUnit}
                  type="button"
                  className={nextUnit === unit ? 'active' : ''}
                  onClick={() => setUnit(nextUnit)}
                >
                  {nextUnit}°
                  <span className="unit-small">{unitLabels[nextUnit]}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="city-tabs">
          {data.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === city.id ? 'active' : ''}
              onClick={() => setSelectedCityId(item.id)}
            >
              {item.city}
            </button>
          ))}
        </div>

        <div className="favorite-row">
          {data.map((item) => (
            <button
              key={`${item.id}-favorite`}
              type="button"
              className={`favorite-chip ${favorites.includes(item.id) ? 'active' : ''}`}
              onClick={() => toggleFavorite(item.id)}
            >
              <strong>{item.city}</strong>
              <span className="metric-subtle">{favorites.includes(item.id) ? 'Pinned to quick access' : 'Add to favorites'}</span>
            </button>
          ))}
        </div>

        <div className="preset-row">
          {(['overview', 'travel', 'fitness', 'photo'] as DashboardPreset[]).map((item) => (
            <button key={item} type="button" className={`preset-card ${preset === item ? 'active' : ''}`} onClick={() => setPreset(item)}>
              <strong>{item}</strong>
              <span className="metric-subtle">{item === preset ? getPresetNarrative(item) : 'Switch dashboard emphasis'}</span>
            </button>
          ))}
        </div>

        <div className="filter-row">
          {(['city-break', 'business', 'outdoor', 'nightlife'] as TripPurpose[]).map((item) => (
            <button key={item} type="button" className={`filter-chip ${tripPurpose === item ? 'active' : ''}`} onClick={() => setTripPurpose(item)}>
              {item}
            </button>
          ))}
        </div>

        <section className="layout">
          <div className="stack">
            <article className="hero-card">
              <div className="hero-grid">
                <div className="hero-main">
                  <div>
                    <div className="location-line">
                      <span className="location-chip">
                        <WeatherGlyph condition={city.condition} />
                        {city.city}, {city.country}
                      </span>
                      <span className="badge">Local {formatLocalTime(city.timezoneOffset, tick)}</span>
                    </div>

                    <div className="hero-temp">
                      <strong>{formatTemp(city.temperatureC, unit)}</strong>
                      <div>
                        <span>{city.condition}</span>
                        <h2 style={{ margin: 0, fontSize: '1.6rem' }}>
                          Feels like {formatTemp(city.feelsLikeC, unit)}
                        </h2>
                      </div>
                    </div>

                    <p className="hero-summary">{city.summary}</p>
                  </div>

                  <div className="hero-footer">
                    <div className="mini-stat">
                      <span className="mini-stat-label">Today range</span>
                      <div className="mini-stat-value">
                        {formatTemp(city.lowC, unit)} / {formatTemp(city.highC, unit)}
                      </div>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-label">Precipitation</span>
                      <div className="mini-stat-value">{city.precipitation}%</div>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-label">Wind</span>
                      <div className="mini-stat-value">{formatWind(city.windKph, unit)}</div>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-label">Air quality</span>
                      <div className="mini-stat-value">{getAirQualityLabel(city.airQuality)}</div>
                    </div>
                  </div>
                </div>

                <div className="hero-side">
                  <div className="sun-arc">
                    <div className="section-title">
                      <div>
                        <h2>Sun cycle</h2>
                        <p>{city.moonPhase}</p>
                      </div>
                      <WeatherGlyph condition={city.condition} large />
                    </div>
                    <div className="radar">
                      <svg viewBox="0 0 320 220" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(111,236,255,0.95)" />
                            <stop offset="100%" stopColor="rgba(105,135,255,0.15)" />
                          </linearGradient>
                        </defs>
                        <circle cx="160" cy="110" r="92" fill="none" stroke="rgba(199,232,246,0.16)" strokeWidth="1.5" />
                        <circle cx="160" cy="110" r="62" fill="none" stroke="rgba(199,232,246,0.12)" strokeWidth="1.5" />
                        <circle cx="160" cy="110" r="34" fill="none" stroke="rgba(199,232,246,0.12)" strokeWidth="1.5" />
                        <path d="M160 110L255 62A104 104 0 0 1 271 142Z" fill="url(#scanGradient)" opacity="0.75" />
                        <circle cx="208" cy="88" r="11" fill="rgba(118,233,255,0.28)" />
                        <circle cx="120" cy="128" r="18" fill="rgba(107,135,255,0.18)" />
                        <circle cx="178" cy="150" r="13" fill="rgba(255,164,95,0.2)" />
                        <path d="M160 18V202M68 110h184" stroke="rgba(199,232,246,0.12)" strokeWidth="1.5" />
                        <circle cx="160" cy="110" r="4" fill="rgba(240,251,255,0.9)" />
                      </svg>
                    </div>
                    <div className="progress-track" aria-hidden="true">
                      <div className="progress-fill" style={{ width: `${clampPercent(daylightProgress)}%` }} />
                    </div>
                    <div className="sun-grid">
                      <div className="sun-box">
                        <span>Sunrise</span>
                        <strong>{city.sunrise}</strong>
                      </div>
                      <div className="sun-box">
                        <span>Sunset</span>
                        <strong>{city.sunset}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <section className="glance-grid">
              <article className="glass-card">
                <div className="section-title">
                  <div>
                    <h3>Hourly outlook</h3>
                    <p>Next six checkpoints</p>
                  </div>
                  <span className="badge">Updated every 30s</span>
                </div>
                <div className="hourly-row">
                  {city.hourly.map((entry) => (
                    <div key={entry.time} className="hourly-card">
                      <span className="hourly-meta">{entry.time}</span>
                      <WeatherGlyph condition={entry.condition} />
                      <strong>{formatTemp(entry.tempC, unit)}</strong>
                      <span className="hourly-meta">{entry.rainChance}% rain</span>
                      <span className="hourly-meta">{formatWind(entry.windKph, unit)}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="glass-card">
                <div className="section-title">
                  <div>
                    <h3>7-day forecast</h3>
                    <p>Trend across the week</p>
                  </div>
                  <span className="badge">{city.city}</span>
                </div>
                <div className="weekly-list">
                  {city.weekly.map((entry) => (
                    <div key={entry.day} className="weekly-card">
                      <strong>{entry.day}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <WeatherGlyph condition={entry.condition} />
                        <span className="weekly-meta">{entry.condition}</span>
                      </div>
                      <span>{formatTemp(entry.lowC, unit)}</span>
                      <span>
                        {formatTemp(entry.highC, unit)} · {entry.rainChance}%
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <article className="glass-card timeline-card">
              <div className="section-title">
                <div>
                  <h3>Interactive forecast timeline</h3>
                  <p>Scrub the next weather states and inspect the active snapshot</p>
                </div>
                <span className="badge">
                  {selectedTimeline.label} · {selectedTimeline.condition}
                </span>
              </div>

              <input
                className="timeline-slider"
                type="range"
                min="0"
                max={Math.max(timeline.length - 1, 0)}
                value={timelineIndex}
                onChange={(event) => setTimelineIndex(Number(event.target.value))}
              />

              <div className="timeline-points">
                {timeline.map((entry, index) => (
                  <button
                    key={entry.label}
                    type="button"
                    className={`timeline-point ${index === timelineIndex ? 'active' : ''}`}
                    onClick={() => setTimelineIndex(index)}
                  >
                    <span className="hourly-meta">{entry.label}</span>
                    <WeatherGlyph condition={entry.condition} />
                    <strong>{formatTemp(entry.tempC, unit)}</strong>
                    <span className="hourly-meta">{entry.rainChance}% rain</span>
                  </button>
                ))}
              </div>

              <div className="deep-grid">
                <div className="score-card">
                  <strong>Snapshot guidance</strong>
                  <p className="metric-value">{formatTemp(selectedTimeline.tempC, unit)}</p>
                  <p className="metric-subtle">{selectedTimeline.condition}</p>
                  <div className="kpi-inline">
                    <span>Rain {selectedTimeline.rainChance}%</span>
                    <span>Wind {formatWind(selectedTimeline.windKph, unit)}</span>
                  </div>
                </div>
                <div className="advisor-note">
                  <strong style={{ display: 'block', marginBottom: 10 }}>Operational read</strong>
                  {getWeatherNarrative(city)} This snapshot is strongest for{' '}
                  {selectedTimeline.rainChance < 25 ? 'outdoor transitions' : 'short protected routes'} and works best if you
                  plan around {selectedTimeline.label.toLowerCase()}.
                </div>
              </div>
            </article>

            <article className="glass-card planner-card">
              <div className="section-title">
                <div>
                  <h3>Outdoor planner engine</h3>
                  <p>Comfort, hydration, commute and activity scoring generated from the mock climate model</p>
                </div>
                <span className="badge">{city.city} planning profile</span>
              </div>

              <div className="score-grid">
                {[
                  ['Comfort', scores.comfort],
                  ['Hydration', scores.hydration],
                  ['Running', scores.running],
                  ['Commute', scores.commute],
                  ['Photography', scores.photography],
                  ['Coastline', scores.coast],
                ].map(([label, value]) => (
                  <div key={label} className="score-card">
                    <strong>{label}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(Number(value)) }}>
                      {value}
                    </p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="planner-grid">
                {plannerMoments.map((entry) => (
                  <div key={entry.moment} className="planner-slot">
                    <strong>{entry.moment}</strong>
                    <p className="metric-value">{entry.comfort}</p>
                    <p className="metric-subtle">{formatTemp(entry.tempC, unit)}</p>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card map-card">
              <div className="section-title">
                <div>
                  <h3>Weather map center</h3>
                  <p>Layered pseudo-map with selectable overlays, live-style markers and cross-city context</p>
                </div>
                <span className="badge">{mapLabel}</span>
              </div>

              <div className="map-layer-tabs">
                {mapLayers.map((layer) => (
                  <button
                    key={layer}
                    type="button"
                    className={mapLayer === layer ? 'active' : ''}
                    onClick={() => setMapLayer(layer)}
                  >
                    {layer}
                  </button>
                ))}
              </div>

              <div className="map-stage" style={{ background: getLayerTone(mapLayer) }}>
                <div className="map-surface" />
                <div className="map-grid" />
                {settings.motion ? (
                  <>
                    <div className="front-wave" />
                    <div className="front-wave delay" />
                  </>
                ) : null}
                {[
                  { id: 'reykjavik', x: '22%', y: '26%' },
                  { id: 'new-york', x: '32%', y: '48%' },
                  { id: 'tokyo', x: '82%', y: '42%' },
                  { id: 'dubai', x: '64%', y: '58%' },
                ].map((marker) => {
                  const item = data.find((entry) => entry.id === marker.id)
                  if (!item) return null
                  const layerValue =
                    mapLayer === 'temperature'
                      ? formatTemp(item.temperatureC, unit)
                      : mapLayer === 'precipitation'
                        ? `${item.precipitation}%`
                        : mapLayer === 'wind'
                          ? formatWind(item.windKph, unit)
                          : `${Math.round(item.humidity * 0.9)}%`

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`map-marker ${item.id === city.id ? 'active' : ''}`}
                      style={{ left: marker.x, top: marker.y }}
                      onClick={() => setSelectedCityId(item.id)}
                    >
                      <strong>{item.city}</strong>
                      <span className="metric-subtle">
                        {item.condition} · {layerValue}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="map-legend">
                <span className="legend-pill">Active layer: {mapLayer}</span>
                <span className="legend-pill">Selected city pulse: {city.city}</span>
                <span className="legend-pill">Marker click switches dashboard context</span>
              </div>
            </article>

            <article className="glass-card compare-card">
              <div className="section-title">
                <div>
                  <h3>Multi-city compare mode</h3>
                  <p>Rank destinations by comfort or mobility using the same single-file scoring engine</p>
                </div>
                <div className="compare-toggle">
                  <button
                    type="button"
                    className={compareMode === 'comfort' ? 'active' : ''}
                    onClick={() => setCompareMode('comfort')}
                  >
                    Comfort
                  </button>
                  <button
                    type="button"
                    className={compareMode === 'mobility' ? 'active' : ''}
                    onClick={() => setCompareMode('mobility')}
                  >
                    Mobility
                  </button>
                </div>
              </div>

              <div className="compare-list">
                <div className="compare-row compare-header">
                  <span>City</span>
                  <span>Temp</span>
                  <span>Rain</span>
                  <span>Wind</span>
                  <span>AQI</span>
                  <span>Score</span>
                </div>
                {compareCities.map((item) => {
                  const score = Math.round(compareMode === 'comfort' ? getComfortScore(item) : getCommuteScore(item))
                  return (
                    <div key={item.id} className="compare-row">
                      <strong>
                        {item.city}
                        <span className="metric-subtle" style={{ display: 'block' }}>
                          {item.country}
                        </span>
                      </strong>
                      <span>{formatTemp(item.temperatureC, unit)}</span>
                      <span>{item.precipitation}%</span>
                      <span>{formatWind(item.windKph, unit)}</span>
                      <span>{item.airQuality}</span>
                      <span style={{ color: getMoodColor(score), fontWeight: 700 }}>{score}</span>
                    </div>
                  )
                })}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Climate intelligence + bulletin feed</h3>
                  <p>Historical-style comparisons and synthetic newsroom content for the concept dashboard</p>
                </div>
                <span className="badge">{city.city} anomaly report</span>
              </div>

              <div className="deep-grid">
                <div className="score-card">
                  <strong>Temperature anomaly</strong>
                  <p className="metric-value" style={{ color: getMoodColor(50 + climate.tempDelta * 10) }}>
                    {climate.tempDelta > 0 ? '+' : ''}
                    {climate.tempDelta.toFixed(1)}°C
                  </p>
                  <p className="metric-subtle">Against monthly baseline</p>
                </div>
                <div className="score-card">
                  <strong>Rain delta</strong>
                  <p className="metric-value">{climate.rainDelta > 0 ? '+' : ''}{climate.rainDelta}%</p>
                  <p className="metric-subtle">Relative to seasonal expectation</p>
                </div>
                <div className="score-card">
                  <strong>Network temp mean</strong>
                  <p className="metric-value">{formatTemp(networkAverageTemperature, unit)}</p>
                  <p className="metric-subtle">Average across all mock cities</p>
                </div>
                <div className="score-card">
                  <strong>Wind anomaly</strong>
                  <p className="metric-value">
                    {climate.windDelta > 0 ? '+' : ''}
                    {climate.windDelta} km/h
                  </p>
                  <p className="metric-subtle">Relative to local baseline</p>
                </div>
              </div>

              <div className="news-list">
                {weatherNews.map((entry) => (
                  <div key={entry.title} className="news-card">
                    <span className="badge">{entry.tag}</span>
                    <strong>{entry.title}</strong>
                    <span className="metric-subtle">{entry.summary}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Activity recommendation engine</h3>
                  <p>Scenario scoring adapts to weather conditions and user profile bias</p>
                </div>
                <span className="badge">{profile.activity}</span>
              </div>

              <div className="activity-grid">
                {activities.map((entry) => (
                  <div key={entry.label} className="activity-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${entry.score}%` }} />
                    </div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Travel day planner</h3>
                  <p>Preset-aware movement windows for urban travel, transfers and weather-sensitive stops</p>
                </div>
                <span className="badge">{preset}</span>
              </div>

              <div className="planner-steps">
                {travelPlanner.map((entry) => (
                  <div key={entry.label} className="planner-step">
                    <strong>{entry.label}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${entry.score}%` }} />
                    </div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Health mode + trip prep</h3>
                  <p>Body-impact indicators and a compact departure checklist for the active city</p>
                </div>
                <span className="badge">{settings.advisoryMode ? 'Advisory on' : 'Advisory off'}</span>
              </div>

              <div className="health-grid">
                {healthSignals.map((entry) => (
                  <div key={entry.label} className="health-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${entry.score}%` }} />
                    </div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>

              <div className="checklist-grid">
                {tripChecklist.map((entry) => (
                  <div key={entry.label} className="checklist-card">
                    <strong>{entry.label}</strong>
                    <span className="status-pill">{entry.status}</span>
                    <p className="metric-subtle" style={{ marginTop: 10 }}>{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Scenario lab</h3>
                  <p>Purpose-driven planning model for the active city, preset, and personal profile</p>
                </div>
                <span className="badge">{tripPurpose}</span>
              </div>

              <div className="scenario-grid">
                <div className="scenario-card">
                  <strong>Scenario resilience</strong>
                  <p className="metric-value" style={{ color: getMoodColor(scenarioInsight.resilience) }}>
                    {scenarioInsight.resilience}
                  </p>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${scenarioInsight.resilience}%` }} />
                  </div>
                  <p className="metric-subtle">{scenarioInsight.briefing}</p>
                </div>
                <div className="scenario-card">
                  <strong>Best window</strong>
                  <p className="metric-value">{scenarioInsight.bestWindow}</p>
                  <p className="metric-subtle">Highest-confidence movement period for the selected scenario.</p>
                </div>
                <div className="scenario-card">
                  <strong>Fallback route model</strong>
                  <p className="metric-subtle">{scenarioInsight.fallback}</p>
                </div>
                <div className="scenario-card">
                  <strong>Preset alignment</strong>
                  <p className="metric-subtle">{getPresetNarrative(preset)}</p>
                </div>
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Decision matrix</h3>
                  <p>Simple action board for whether to go now, wait, or shift into fallback mode</p>
                </div>
                <span className="badge">Action bias</span>
              </div>

              <div className="digest-grid">
                {decisionMatrix.map((entry) => (
                  <div key={entry.label} className="digest-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${entry.score}%` }} />
                    </div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Weekly strategy board</h3>
                  <p>Turn the 7-day forecast into action-oriented planning blocks instead of raw weather rows</p>
                </div>
                <span className="badge">{city.city} weekly plan</span>
              </div>

              <div className="strategy-grid">
                {weeklyStrategy.map((entry) => (
                  <div key={`${entry.day}-${entry.label}`} className="strategy-card">
                    <strong>
                      {entry.day} · {entry.label}
                    </strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.comfort) }}>
                      {entry.comfort}
                    </p>
                    <div className="tiny-stat">{entry.condition}</div>
                    <div className="tiny-stat">
                      {formatTemp(entry.lowC, unit)} / {formatTemp(entry.highC, unit)}
                    </div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Monthly climate ledger</h3>
                  <p>Mock seasonal baseline view so the city can be read beyond the current moment</p>
                </div>
                <span className="badge">12-month ledger</span>
              </div>

              <div className="ledger-grid">
                {monthlyLedger.map((entry) => (
                  <div key={entry.month} className="ledger-card">
                    <strong>{entry.month}</strong>
                    <div className="tiny-stat">{formatTemp(entry.tempC, unit)}</div>
                    <div className="tiny-stat">{entry.rain}% rain</div>
                    <p className="metric-subtle">{entry.label}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Favorites watch analytics</h3>
                  <p>Track pinned cities as a compact comparison deck for fast decision making</p>
                </div>
                <span className="badge">{favoriteAnalytics.length} favorites</span>
              </div>

              <div className="favorite-analytics">
                {favoriteAnalytics.length > 0 ? (
                  favoriteAnalytics.map((entry) => (
                    <div key={entry.id} className="favorite-analytics-card">
                      <strong>{entry.name}</strong>
                      <div className="tiny-stat">{entry.temp}</div>
                      <div className="tiny-stat">Comfort {entry.comfort}</div>
                      <div className="tiny-stat">Mobility {entry.mobility}</div>
                      <div className="tiny-stat">AQI {entry.aqi}</div>
                      <p className="metric-subtle">{entry.note}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">Pin cities above to build a fast favorite-analytics deck.</div>
                )}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Transit mode lab</h3>
                  <p>Mode-by-mode movement comparison instead of a single generic commute score</p>
                </div>
                <span className="badge">{city.city} mobility</span>
              </div>

              <div className="transit-grid">
                {transitModes.map((entry) => (
                  <div key={entry.mode} className="transit-card">
                    <strong>{entry.mode}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${entry.score}%` }} />
                    </div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Habit windows</h3>
                  <p>Routine planning blocks built from weather, health, and profile signals</p>
                </div>
                <span className="badge">{profile.name}</span>
              </div>

              <div className="habit-grid">
                {habitWindows.map((entry) => (
                  <div key={entry.habit} className="habit-card">
                    <strong>{entry.habit}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Photo planner</h3>
                  <p>Scene-specific planning for creators and visual-first city exploration</p>
                </div>
                <span className="badge">{city.city} frames</span>
              </div>

              <div className="photo-grid">
                {photoPlan.map((entry) => (
                  <div key={entry.frame} className="photo-card">
                    <strong>{entry.frame}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${entry.score}%` }} />
                    </div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Risk matrix</h3>
                  <p>Condensed operational risk read for heat, surfaces, air, and wind instability</p>
                </div>
                <span className="badge">Risk board</span>
              </div>

              <div className="risk-grid">
                {riskMatrix.map((entry) => (
                  <div key={entry.label} className="risk-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(100 - entry.score) }}>
                      {entry.score}
                    </p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${entry.score}%` }} />
                    </div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Packing matrix</h3>
                  <p>Trip-purpose-aware packing logic generated from current weather and risk conditions</p>
                </div>
                <span className="badge">{tripPurpose}</span>
              </div>

              <div className="kit-grid">
                {packingMatrix.map((entry) => (
                  <div key={entry.label} className="kit-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-subtle">{entry.value}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Home benchmark lab</h3>
                  <p>Measure the active city against your saved home city to spot friction immediately</p>
                </div>
                <span className="badge">{homeCity.city}</span>
              </div>

              <div className="digest-grid">
                {homeBenchmarks.map((entry) => (
                  <div key={entry.label} className="digest-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-value">
                      {entry.value > 0 ? '+' : ''}
                      {entry.value}
                      {entry.unit}
                    </p>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Advisory scripts</h3>
                  <p>Natural-language operational guidance assembled from weather, profile, and trip intent</p>
                </div>
                <span className="badge">Auto-brief</span>
              </div>

              <div className="journal-list">
                {advisoryScripts.map((entry) => (
                  <div key={entry.title} className="journal-card">
                    <strong>{entry.title}</strong>
                    <span className="metric-subtle">{entry.body}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Field guide</h3>
                  <p>Small high-signal guidance cards for quick reading under time pressure</p>
                </div>
                <span className="badge">Fast read</span>
              </div>

              <div className="journal-list">
                {fieldGuide.map((entry) => (
                  <div key={entry.title} className="journal-card">
                    <strong>{entry.title}</strong>
                    <span className="metric-subtle">{entry.body}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Recovery planner</h3>
                  <p>Post-activity and end-of-day recovery guidance generated from current conditions</p>
                </div>
                <span className="badge">{profile.name}</span>
              </div>

              <div className="health-grid">
                {recoveryPlan.map((entry) => (
                  <div key={entry.label} className="health-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${entry.score}%` }} />
                    </div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Historical playback</h3>
                  <p>Compare current weather against earlier mock states and baseline snapshots</p>
                </div>
                <span className="badge">{activeHistory.label}</span>
              </div>

              <div className="toggle-row">
                {historyStates.map((entry, index) => (
                  <button key={entry.label} type="button" className={index === historyIndex ? 'action-button' : 'ghost-button'} onClick={() => setHistoryIndex(index)}>
                    {entry.label}
                  </button>
                ))}
              </div>

              <div className="history-grid">
                <div className="history-card">
                  <strong>Temperature shift</strong>
                  <p className="metric-value">
                    {activeHistory.deltaTemp > 0 ? '+' : ''}
                    {activeHistory.deltaTemp}°C
                  </p>
                  <p className="metric-subtle">Relative to current reading</p>
                </div>
                <div className="history-card">
                  <strong>Rain shift</strong>
                  <p className="metric-value">
                    {activeHistory.deltaRain > 0 ? '+' : ''}
                    {activeHistory.deltaRain}%
                  </p>
                  <p className="metric-subtle">Relative precipitation deviation</p>
                </div>
                <div className="history-card">
                  <strong>Wind shift</strong>
                  <p className="metric-value">
                    {activeHistory.deltaWind > 0 ? '+' : ''}
                    {activeHistory.deltaWind} km/h
                  </p>
                  <p className="metric-subtle">Across the selected reference state</p>
                </div>
                <div className="history-card">
                  <strong>Playback summary</strong>
                  <p className="metric-subtle">
                    {activeHistory.deltaRain > 0 ? 'Current cycle is drier than the selected reference.' : 'Current cycle is wetter than the selected reference.'}
                  </p>
                </div>
              </div>
            </article>
          </div>

          <aside className="stack">
            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Environment metrics</h3>
                  <p>Core live-style indicators</p>
                </div>
                <span className="badge">{city.condition}</span>
              </div>
              <div className="card-grid">
                <div className="metric-card">
                  <header>
                    <h3>Humidity</h3>
                    <span className="metric-subtle">Comfort</span>
                  </header>
                  <p className="metric-value">{city.humidity}%</p>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${city.humidity}%` }} />
                  </div>
                </div>
                <div className="metric-card">
                  <header>
                    <h3>Visibility</h3>
                    <span className="metric-subtle">Distance</span>
                  </header>
                  <p className="metric-value">{formatVisibility(city.visibilityKm, unit)}</p>
                  <p className="metric-subtle">
                    Pressure {city.pressureHpa} hPa · {formatPressureTrend(city.pressureHpa)}
                  </p>
                </div>
                <div className="metric-card">
                  <header>
                    <h3>UV index</h3>
                    <span className="metric-subtle">Exposure</span>
                  </header>
                  <p className="metric-value">{city.uvIndex}</p>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${clampPercent(city.uvIndex * 10)}%` }} />
                  </div>
                </div>
                <div className="metric-card">
                  <header>
                    <h3>Air quality</h3>
                    <span className="metric-subtle">AQI</span>
                  </header>
                  <p className="metric-value">{city.airQuality}</p>
                  <p className="metric-subtle">{getAirQualityLabel(city.airQuality)}</p>
                </div>
                <div className="metric-card">
                  <header>
                    <h3>Sea level</h3>
                    <span className="metric-subtle">Altitude</span>
                  </header>
                  <p className="metric-value">{city.seaLevelM} m</p>
                  <p className="metric-subtle">Relative station height · {formatDistanceMeters(city.seaLevelM, unit)}</p>
                </div>
                <div className="metric-card">
                  <header>
                    <h3>Feels difference</h3>
                    <span className="metric-subtle">Perceived</span>
                  </header>
                  <p className="metric-value">{formatTemp(city.feelsLikeC - city.temperatureC, unit)}</p>
                  <p className="metric-subtle">Against measured air temperature</p>
                </div>
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Astronomy deep dive</h3>
                  <p>Daylight structure, moonlight intensity and visual shooting windows</p>
                </div>
                <span className="badge">{city.moonPhase}</span>
              </div>

              <div className="astro-grid">
                <div className="astro-card">
                  <strong>Daylight span</strong>
                  <p className="metric-value">{astronomy.daylight}</p>
                  <p className="metric-subtle">Sunrise {city.sunrise} to sunset {city.sunset}</p>
                </div>
                <div className="astro-card">
                  <strong>Golden hour</strong>
                  <p className="metric-value">{astronomy.goldenHour}</p>
                  <p className="metric-subtle">Visual softness adjusted by local visibility</p>
                </div>
                <div className="astro-card">
                  <strong>Blue hour</strong>
                  <p className="metric-value">{astronomy.blueHour}</p>
                  <p className="metric-subtle">Best for cinematic cityscape contrast</p>
                </div>
                <div className="astro-card">
                  <strong>Moon illumination</strong>
                  <p className="metric-value">{astronomy.moonIllumination}</p>
                  <p className="metric-subtle">Derived from current phase</p>
                </div>
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Profile impact</h3>
                  <p>Personal comfort model shaped by home city and sensitivity settings</p>
                </div>
                <span className="badge">{profile.name}</span>
              </div>

              <div className="profile-grid">
                <div className="profile-card">
                  <strong>Home city</strong>
                  <p className="metric-value">{data.find((item) => item.id === profile.homeCityId)?.city ?? city.city}</p>
                  <p className="metric-subtle">Default anchor for planning heuristics</p>
                </div>
                <div className="profile-card">
                  <strong>Comfort bias</strong>
                  <p className="metric-value" style={{ color: getMoodColor(profileBias) }}>
                    {profileBias}
                  </p>
                  <p className="metric-subtle">Weather-to-profile fit score</p>
                </div>
                <div className="profile-card">
                  <strong>Heat sensitivity</strong>
                  <p className="metric-value">{profile.heatSensitivity}</p>
                  <p className="metric-subtle">Higher values penalize hot windows sooner</p>
                </div>
                <div className="profile-card">
                  <strong>Cold sensitivity</strong>
                  <p className="metric-value">{profile.coldSensitivity}</p>
                  <p className="metric-subtle">Higher values penalize cold exposure sooner</p>
                </div>
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Saved views + settings</h3>
                  <p>Store dashboard snapshots and tune behavior without leaving the single-file app shell</p>
                </div>
                <button type="button" className="action-button" onClick={saveCurrentView}>
                  Save current view
                </button>
              </div>

              <div className="savedviews-list">
                {savedViews.length > 0 ? (
                  savedViews.map((entry) => (
                    <button key={entry.id} type="button" className="savedview-card" onClick={() => applySavedView(entry)}>
                      <strong>{entry.name}</strong>
                      <span className="metric-subtle">
                        {entry.cityId} · {entry.preset} · {entry.mapLayer} · {entry.unit}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="empty-state">No saved views yet. Save the current dashboard state to reuse it later.</div>
                )}
              </div>

              <div className="settings-grid">
                <button
                  type="button"
                  className="settings-card"
                  onClick={() => setSettings((current) => ({ ...current, motion: !current.motion }))}
                >
                  <strong>Motion</strong>
                  <span className="metric-subtle">{settings.motion ? 'Animated fronts and transitions enabled' : 'Reduced motion mode enabled'}</span>
                </button>
                <button
                  type="button"
                  className="settings-card"
                  onClick={() => setSettings((current) => ({ ...current, denseCards: !current.denseCards }))}
                >
                  <strong>Density</strong>
                  <span className="metric-subtle">{settings.denseCards ? 'Compact card behavior active' : 'Default spacing active'}</span>
                </button>
                <button
                  type="button"
                  className="settings-card"
                  onClick={() => setSettings((current) => ({ ...current, advisoryMode: !current.advisoryMode }))}
                >
                  <strong>Advisory mode</strong>
                  <span className="metric-subtle">{settings.advisoryMode ? 'Health and trip prep guidance emphasized' : 'Guidance layer softened'}</span>
                </button>
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Operations center</h3>
                  <p>High-level execution board for current city viability and plan durability</p>
                </div>
                <span className="badge">{tripPurpose}</span>
              </div>

              <div className="ops-grid">
                {operationsCenter.map((entry) => (
                  <div key={entry.label} className="ops-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${entry.score}%` }} />
                    </div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Daypart operations</h3>
                  <p>Quick operational read across the main parts of the day, not just forecast timestamps</p>
                </div>
                <span className="badge">Ops by daypart</span>
              </div>

              <div className="ops-grid">
                {daypartOperations.map((entry) => (
                  <div key={entry.label} className="ops-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Trip board</h3>
                  <p>Checklist-style execution board per city with reusable scenario templates</p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="ghost-button" onClick={seedTripTasks}>
                    Load template
                  </button>
                </div>
              </div>

              <div className="field">
                <label htmlFor="task-draft">Add task</label>
                <input
                  id="task-draft"
                  value={taskDraft}
                  onChange={(event) => setTaskDraft(event.target.value)}
                  placeholder="Book route fallback, refill water, confirm first stop..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="action-button" onClick={addTripTask}>
                  Add task
                </button>
              </div>

              <div className="task-list">
                {currentTasks.length > 0 ? (
                  currentTasks.map((task) => (
                    <button key={task.id} type="button" className={`task-card ${task.done ? 'done' : ''}`} onClick={() => toggleTripTask(task.id)}>
                      <div className="task-top">
                        <strong>{task.text}</strong>
                        <span className="status-pill">{task.done ? 'Done' : 'Open'}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="empty-state">No trip tasks yet. Add one manually or load a template for the selected trip purpose.</div>
                )}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>City dossier</h3>
                  <p>Compact fact board summarizing the city context beyond raw forecast numbers</p>
                </div>
                <span className="badge">{city.city}</span>
              </div>

              <div className="dossier-grid">
                {cityDossier.map((entry) => (
                  <div key={entry.label} className="dossier-card">
                    <strong>{entry.label}</strong>
                    <span className="metric-subtle">{entry.value}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Neighborhood guide</h3>
                  <p>Fast area-level guidance for where the city is strongest or weakest under current conditions</p>
                </div>
                <span className="badge">{city.city} map logic</span>
              </div>

              <div className="dossier-grid">
                {neighborhoodGuide.map((entry) => (
                  <div key={entry.label} className="dossier-card">
                    <strong>{entry.label}</strong>
                    <span className="metric-subtle">{entry.note}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Notification controls</h3>
                  <p>Preference-level control and severity digest for the currently visible alert stream</p>
                </div>
                <span className="badge">{filteredNotifications.length} visible</span>
              </div>

              <div className="digest-grid">
                {notificationDigest.map((entry) => (
                  <div key={entry.label} className="digest-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-value">{entry.value}</p>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>

              <div className="prefs-grid">
                {(['storm', 'air', 'uv', 'commute', 'hydration', 'travel'] as NotificationType[]).map((type) => (
                  <button key={type} type="button" className="prefs-card" onClick={() => toggleNotificationPref(type)}>
                    <div className="toggle-check">
                      <strong>{type}</strong>
                      <span className={`toggle-indicator ${notificationPrefs[type] ? 'active' : ''}`}>
                        <span />
                      </span>
                    </div>
                    <span className="metric-subtle">{notificationPrefs[type] ? 'Enabled in the alert stream' : 'Muted from the alert stream'}</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Air quality lab</h3>
                  <p>Expanded pollutant breakdown generated from AQI and local atmospheric profile</p>
                </div>
                <span className="badge">{getAirQualityLabel(city.airQuality)}</span>
              </div>

              <div className="aqi-grid">
                {airBreakdown.map((entry) => (
                  <div key={entry.label} className="aqi-item">
                    <strong>{entry.label}</strong>
                    <p className="metric-value">{entry.value}</p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${entry.severity}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="advisor-note">
                <strong style={{ display: 'block', marginBottom: 10 }}>Exposure advisory</strong>
                {city.airQuality >= 80
                  ? 'Reduce long midday exposure, prioritize shaded routes and consider mask-friendly commuting.'
                  : city.airQuality >= 45
                    ? 'Outdoor activity is viable, but high-output training is better scheduled for the coolest window.'
                    : 'Air quality is supportive for long outdoor sessions and open-window ventilation.'}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Emergency readiness</h3>
                  <p>Compact carry recommendations driven by current weather risk and movement constraints</p>
                </div>
                <span className="badge">{city.condition}</span>
              </div>

              <div className="kit-grid">
                {emergencyKit.map((entry) => (
                  <div key={entry.label} className="kit-card">
                    <strong>{entry.label}</strong>
                    <p className="metric-subtle">{entry.value}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Micro-climate bands</h3>
                  <p>Different urban zones can feel materially different from the city-level reading</p>
                </div>
                <span className="badge">{city.city} zones</span>
              </div>

              <div className="micro-grid">
                {microClimate.map((entry) => (
                  <div key={entry.zone} className="micro-card">
                    <strong>{entry.zone}</strong>
                    <div className="tiny-stat">{formatTemp(entry.temp, unit)}</div>
                    <div className="tiny-stat">{formatWind(entry.wind, unit)}</div>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Wardrobe assistant</h3>
                  <p>Adaptive clothing suggestions based on current city and profile tolerance</p>
                </div>
                <span className="badge">Live outfit</span>
              </div>

              <div className="wardrobe-grid">
                {wardrobe.map((entry) => (
                  <div key={entry.slot} className="wardrobe-card">
                    <strong>{entry.slot}</strong>
                    <p className="metric-subtle">{entry.value}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Route risk simulator</h3>
                  <p>Mock trip confidence for core urban transfer scenarios</p>
                </div>
                <span className="badge">{city.city}</span>
              </div>

              <div className="route-grid">
                {routeRisk.map((entry) => (
                  <div key={entry.route} className="route-card">
                    <strong>{entry.route}</strong>
                    <p className="metric-value" style={{ color: getMoodColor(entry.score) }}>
                      {entry.score}
                    </p>
                    <p className="metric-subtle">{entry.note}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>City explorer</h3>
                  <p>Search-driven mock dataset</p>
                </div>
                <button type="button" className="ghost-button" onClick={() => setQuery('')}>
                  Reset
                </button>
              </div>

              <div className="city-results">
                {filteredCities.length > 0 ? (
                  filteredCities.map((item) => (
                    <div key={item.id} className="result-card">
                      <div className="alert-top">
                        <strong>
                          {item.city}, {item.country}
                        </strong>
                        <WeatherGlyph condition={item.condition} />
                      </div>
                      <span className="result-meta">
                        {item.condition} · {formatTemp(item.temperatureC, unit)} · AQI {item.airQuality}
                      </span>
                      <span className="result-meta">{item.summary}</span>
                      <button
                        type="button"
                        className={item.id === city.id ? 'ghost-button' : 'action-button'}
                        onClick={() => setSelectedCityId(item.id)}
                      >
                        {item.id === city.id ? 'Currently selected' : 'Open dashboard'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No mock locations match “{query}”. Try Tokyo, Dubai, Reykjavik, or New York.</div>
                )}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Notification center</h3>
                  <p>Static and dynamic alerts shaped by city conditions and user sensitivity</p>
                </div>
                <span className="badge">{filteredNotifications.length} active</span>
              </div>

              <div className="filter-row">
                {(['all', 'storm', 'air', 'uv', 'commute', 'hydration', 'travel'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`filter-chip ${notificationFilter === item ? 'active' : ''}`}
                    onClick={() => setNotificationFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="notification-list">
                {filteredNotifications.map((alert) => (
                  <div key={alert.id} className="notification-card">
                    <div className="alert-top">
                      <strong>{alert.title}</strong>
                      <span className={`alert-pill ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                    </div>
                    <span className="alert-meta">{alert.window}</span>
                    <span className="alert-meta">{alert.detail}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Weather journal</h3>
                  <p>Local notes per city, stored in localStorage and tied to the active dashboard context</p>
                </div>
                <span className="badge">{cityJournal.length} notes</span>
              </div>

              <div className="field">
                <label htmlFor="journal-note">Quick note</label>
                <textarea
                  id="journal-note"
                  value={journalDraft}
                  onChange={(event) => setJournalDraft(event.target.value)}
                  placeholder="Sunset looked great, commute felt rough, air was dry..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="action-button" onClick={addJournalEntry}>
                  Save note
                </button>
              </div>

              <div className="journal-list">
                {cityJournal.length > 0 ? (
                  cityJournal.map((entry, index) => (
                    <div key={`${entry}-${index}`} className="journal-card">
                      <strong>Entry {index + 1}</strong>
                      <span className="metric-subtle">{entry}</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No notes yet for {city.city}. Add one from the field above.</div>
                )}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Command reference</h3>
                  <p>Compact helper panel for the single-file power-user interactions already present in the app</p>
                </div>
                <span className="badge">Power user</span>
              </div>

              <div className="command-help-grid">
                {[
                  ['Ctrl/Cmd + K', 'Open the command palette from anywhere in the dashboard.'],
                  ['Personalization', 'Adjust home city, activity profile, and sensitivity thresholds.'],
                  ['Mock editor', 'Override live mock values and force the whole dashboard to recalculate.'],
                  ['Save current view', 'Store city, preset, unit, and map layer as a reusable snapshot.'],
                ].map(([title, note]) => (
                  <div key={title} className="command-help-card">
                    <strong>{title}</strong>
                    <span className="metric-subtle">{note}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Quick wins</h3>
                  <p>Compact operational highlights that summarize what matters most right now</p>
                </div>
                <span className="badge">Immediate actions</span>
              </div>

              <div className="dossier-grid">
                {quickWins.map((entry) => (
                  <div key={entry.label} className="dossier-card">
                    <strong>{entry.label}</strong>
                    <span className="metric-subtle">{entry.note}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass-card">
              <div className="section-title">
                <div>
                  <h3>Signal summary</h3>
                  <p>Ultra-short summary layer for the current cycle when you need a decision in seconds</p>
                </div>
                <span className="badge">Snapshot</span>
              </div>

              <div className="dossier-grid">
                {signalSummary.map((entry) => (
                  <div key={entry.label} className="dossier-card">
                    <strong>{entry.label}</strong>
                    <span className="metric-subtle">{entry.note}</span>
                  </div>
                ))}
              </div>
            </article>

            <p className="footer-note">
              Single-file build: the full UI, CSS, mock data, React bootstrap, and helper logic live inside `src/App.tsx`.
              It now operates as a large concept project with a timeline, compare mode, planner engine, weather map,
              climate intelligence, astronomy, and an AQI lab.
            </p>
          </aside>
        </section>
      </main>

      {showCommandPalette ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="section-title">
              <div>
                <h3>Command palette</h3>
                <p>Quick actions for navigation and state changes. Hotkey: Ctrl/Cmd + K</p>
              </div>
              <button type="button" className="ghost-button" onClick={() => setShowCommandPalette(false)}>
                Close
              </button>
            </div>

            <div className="command-list">
              {[
                ...data.map((item) => ({
                  label: `Open ${item.city}`,
                  note: `Switch dashboard context to ${item.country}`,
                  action: () => {
                    setSelectedCityId(item.id)
                    setShowCommandPalette(false)
                  },
                })),
                {
                  label: 'Toggle units',
                  note: `Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`,
                  action: () => {
                    setUnit((current) => (current === 'C' ? 'F' : 'C'))
                    setShowCommandPalette(false)
                  },
                },
                {
                  label: 'Open profile panel',
                  note: 'Edit name, home city, activity type and sensitivities',
                  action: () => {
                    setShowProfilePanel(true)
                    setShowCommandPalette(false)
                  },
                },
                {
                  label: 'Open mock editor',
                  note: 'Change temperature, humidity, AQI and more in real time',
                  action: () => {
                    setShowEditorPanel(true)
                    setShowCommandPalette(false)
                  },
                },
              ].map((item) => (
                <button key={item.label} type="button" className="command-item" onClick={item.action}>
                  <strong>{item.label}</strong>
                  <span className="metric-subtle">{item.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {showProfilePanel ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="section-title">
              <div>
                <h3>User profile + personalization</h3>
                <p>These settings feed the planning engine, activity recommendations and dynamic alerts</p>
              </div>
              <button type="button" className="ghost-button" onClick={() => setShowProfilePanel(false)}>
                Close
              </button>
            </div>

            <div className="profile-grid">
              <div className="field">
                <label htmlFor="profile-name">Name</label>
                <input id="profile-name" value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="profile-home">Home city</label>
                <select id="profile-home" value={profile.homeCityId} onChange={(event) => setProfile((current) => ({ ...current, homeCityId: event.target.value }))}>
                  {data.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="profile-activity">Primary activity</label>
                <select
                  id="profile-activity"
                  value={profile.activity}
                  onChange={(event) => setProfile((current) => ({ ...current, activity: event.target.value as ProfileActivity }))}
                >
                  <option value="commuter">Commuter</option>
                  <option value="runner">Runner</option>
                  <option value="traveler">Traveler</option>
                  <option value="photographer">Photographer</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="profile-heat">Heat sensitivity</label>
                <input
                  id="profile-heat"
                  type="range"
                  min="0"
                  max="100"
                  value={profile.heatSensitivity}
                  onChange={(event) => setProfile((current) => ({ ...current, heatSensitivity: Number(event.target.value) }))}
                />
              </div>
              <div className="field">
                <label htmlFor="profile-cold">Cold sensitivity</label>
                <input
                  id="profile-cold"
                  type="range"
                  min="0"
                  max="100"
                  value={profile.coldSensitivity}
                  onChange={(event) => setProfile((current) => ({ ...current, coldSensitivity: Number(event.target.value) }))}
                />
              </div>
            </div>

            <p className="small-note">
              Profile-aware comfort for {city.city}: {profileBias}. This value shifts recommendations, notifications, wardrobe and activity scores.
            </p>
          </div>
        </div>
      ) : null}

      {showEditorPanel ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <div className="section-title">
              <div>
                <h3>Mock data editor</h3>
                <p>Live-edit selected city metrics and watch every downstream module update from the same source</p>
              </div>
              <button type="button" className="ghost-button" onClick={() => setShowEditorPanel(false)}>
                Close
              </button>
            </div>

            <div className="editor-grid">
              {([
                ['temperatureC', 'Temperature C', city.temperatureC, -15, 45],
                ['humidity', 'Humidity %', city.humidity, 0, 100],
                ['windKph', 'Wind km/h', city.windKph, 0, 60],
                ['airQuality', 'AQI', city.airQuality, 0, 150],
                ['precipitation', 'Precipitation %', city.precipitation, 0, 100],
                ['uvIndex', 'UV index', city.uvIndex, 0, 12],
              ] as const).map(([field, label, value, min, max]) => (
                <div key={field} className="editor-card">
                  <div className="field">
                    <label htmlFor={`editor-${field}`}>{label}</label>
                    <input
                      id={`editor-${field}`}
                      type="range"
                      min={min}
                      max={max}
                      value={value}
                      onChange={(event) => updateCityField(city.id, field, Number(event.target.value))}
                    />
                  </div>
                  <p className="metric-value">{value}</p>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={() => setEditedWeather((current) => ({ ...current, [city.id]: {} }))}>
                Reset city edits
              </button>
              <button type="button" className="action-button" onClick={() => setEditedWeather({})}>
                Reset all edits
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container not found')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
