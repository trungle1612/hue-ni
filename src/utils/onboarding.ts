const ONBOARDING_KEY = 'hue-ni-onboarded'

export function hasSeenOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function markOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_KEY, 'true')
}
