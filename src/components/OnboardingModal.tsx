import './OnboardingModal.css'

const ONBOARDING_KEY = 'hue-ni-onboarded'

export function hasSeenOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

interface OnboardingModalProps {
  onDismiss: () => void
}

export function OnboardingModal({ onDismiss }: OnboardingModalProps) {
  function dismiss() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    onDismiss()
  }

  function handleLocationRequest() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => dismiss(),
        () => dismiss(),
      )
    } else {
      dismiss()
    }
  }

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="Chào mừng">
      <div className="onboarding-modal">
        <div className="onboarding-modal__emoji">🌸</div>
        <h1 className="onboarding-modal__title">Chào mừng đến Huế</h1>
        <p className="onboarding-modal__subtitle">
          Cho phép truy cập vị trí để khám phá những địa điểm gần bạn nhất.
        </p>
        <button
          className="onboarding-modal__btn-primary"
          onClick={handleLocationRequest}
        >
          📍 Cho phép truy cập vị trí
        </button>
        <button
          className="onboarding-modal__btn-skip"
          onClick={dismiss}
        >
          Bỏ qua
        </button>
      </div>
    </div>
  )
}
