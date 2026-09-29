import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import CourseCard from '@/components/CourseCard.vue';
import type { Course, UserRole } from '@/types/course.ts';

const course: Course = {
  id: 'course',
  title: 'Курс',
  teacher: 'Преподаватель',
  completedLabs: 2,
  totalLabs: 3,
};

function mountCard(role: UserRole = 'student'): ReturnType<typeof mount> {
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

  it('подписывает прогресс в зависимости от роли', () => {
    expect(mountCard('student').text()).toContain('Выполнено лабораторных');
    expect(mountCard('teacher').text()).toContain('Проверено лабораторных');
  });
});
