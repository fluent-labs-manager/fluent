import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import CourseCard from '@/components/CourseCard.vue';
import type { Course } from '@/api/courses/Course.dto.ts';
import { UserRole } from '@/types/UserRole.ts';

const course: Course = {
  id: 1,
  title: 'Курс',
  teacher: 'Преподаватель',
  completedLabs: 2,
  totalLabs: 3,
};

function mountCard(
  role: UserRole = UserRole.Student,
): ReturnType<typeof mount> {
  return mount(CourseCard, {
    props: { course, role },
  });
}

describe('CourseCard', () => {
  it('отображает название курса и преподавателя', () => {
    const wrapper = mountCard();
    expect(wrapper.find('.course-card__title').text()).toBe('Курс');
    expect(wrapper.find('.course-card__teacher').text()).toBe('Преподаватель');
  });

  it('показывает количество и процент выполненных лабораторных', () => {
    const wrapper = mountCard();
    expect(wrapper.find('.course-card__value').text()).toBe('2 из 3 (66,7%)');
  });

  it('показывает полосу прогресса с процентом и подписью', () => {
    const bar = mountCard().find('[role="progressbar"]');
    expect(Number(bar.attributes('aria-valuenow'))).toBeCloseTo(66.7, 1);
    expect(bar.attributes('aria-label')).toBe('Выполнено лабораторных');
  });

  it('подписывает прогресс в зависимости от роли', () => {
    expect(mountCard(UserRole.Student).text()).toContain(
      'Выполнено лабораторных',
    );
    expect(mountCard(UserRole.Teacher).text()).toContain(
      'Проверено лабораторных',
    );
  });
});
