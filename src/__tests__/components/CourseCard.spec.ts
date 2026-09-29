import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import CourseCard from '@/components/CourseCard.vue';
import type { Course } from '@/types/course.ts';

const baseCourse: Course = {
  id: 'course',
  title: 'Курс',
  teacher: 'Преподаватель',
  completedLabs: 2,
  totalLabs: 4,
  nearestDeadline: '2026-10-22',
  isGradeSheetClosed: false,
};

function mountCard(course: Partial<Course>): ReturnType<typeof mount> {
  return mount(CourseCard, {
    props: { course: { ...baseCourse, ...course }, role: 'student' },
  });
}

function deadlineText(course: Partial<Course>): string {
  return mountCard(course).find('.course-card__deadline-value').text();
}

describe('CourseCard', () => {
  it('показывает дату ближайшего дедлайна', () => {
    expect(deadlineText({})).toBe('22 октября');
  });

  it('показывает «Нет», если дедлайна нет', () => {
    expect(deadlineText({ nearestDeadline: null })).toBe('Нет');
  });

  it('не считает курс завершённым, если все лабораторные сданы, но ведомость открыта', () => {
    expect(deadlineText({ completedLabs: 4, nearestDeadline: null })).toBe(
      'Нет',
    );
  });

  it('при закрытой ведомости показывает только «Курс завершён»', () => {
    const deadline = mountCard({
      isGradeSheetClosed: true,
      nearestDeadline: null,
    }).find('.course-card__deadline');
    expect(deadline.text()).toBe('Курс завершён');
    expect(deadline.text()).not.toContain('Ближайший дедлайн');
  });

  it('подписывает прогресс в зависимости от роли', () => {
    const wrapper = mount(CourseCard, {
      props: { course: baseCourse, role: 'teacher' },
    });
    expect(wrapper.text()).toContain('Проверено лабораторных');
  });
});
