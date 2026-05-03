import type { Experience, ExperienceCategory } from '../types'

export function filterExperiences(
  experiences: Experience[],
  category: ExperienceCategory | 'all',
): Experience[] {
  if (category === 'all') return experiences
  return experiences.filter((e) => e.category === category)
}
