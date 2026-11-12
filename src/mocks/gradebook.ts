import type { CourseGradebook } from '@/api/gradebook/CourseGradebook.dto.ts';
import type { GroupStudent } from '@/api/gradebook/GroupStudent.dto.ts';
import type { SectionLimit } from '@/api/gradebook/SectionLimit.dto.ts';
import { BarsSection } from '@/types/BarsSection.ts';

// студенты группы с номерами ИСУ подряд, начиная с firstIsuId
function toStudents(
  stream: string,
  firstIsuId: number,
  names: string[],
): GroupStudent[] {
  return names.map((fullName, index) => ({
    id: firstIsuId + index,
    fullName,
    isuId: firstIsuId + index,
    stream,
  }));
}

// у всех дисциплин 100 баллов по разделам
function toLimits(limits: Record<BarsSection, number>): SectionLimit[] {
  return [
    { section: BarsSection.ClassWork, limit: limits[BarsSection.ClassWork] },
    { section: BarsSection.Labs, limit: limits[BarsSection.Labs] },
    { section: BarsSection.Tests, limit: limits[BarsSection.Tests] },
    { section: BarsSection.Midterm, limit: limits[BarsSection.Midterm] },
    { section: BarsSection.Exam, limit: limits[BarsSection.Exam] },
  ];
}

// данные для заглушки из src/api/gradebook/GradebookApi.ts. Ключ — id
// дисциплины из src/mocks/teaching.ts, группы совпадают с её groups.
// Баллы работ сходятся с лимитами: если разложить все работы по своим
// разделам, каждый заполнится ровно до лимита, а всего выйдет 100
export const courseGradebooks: Partial<Record<number, CourseGradebook>> = {
  // лабораторные частично разложены, остальное ждёт в «Работах курса»
  1: {
    courseId: 1,
    courseTitle: 'Разработка веб-приложений',
    groups: [
      {
        name: 'P3322',
        students: toStudents('Веб 1.2', 412301, [
          'Горелова Ульяна Андреевна',
          'Демидов Артём Сергеевич',
          'Ершова Полина Игоревна',
          'Калинин Максим Олегович',
          'Лебедева Анна Викторовна',
          'Морозов Илья Денисович',
        ]),
      },
      {
        name: 'P3323',
        students: toStudents('Веб 1.2', 412351, [
          'Абрамова Виктория Павловна',
          'Белов Кирилл Андреевич',
          'Волкова Дарья Сергеевна',
          'Григорьев Никита Ильич',
          'Зайцева Екатерина Олеговна',
        ]),
      },
    ],
    sectionLimits: toLimits({
      [BarsSection.ClassWork]: 10,
      [BarsSection.Labs]: 50,
      [BarsSection.Tests]: 15,
      [BarsSection.Midterm]: 5,
      [BarsSection.Exam]: 20,
    }),
    works: [
      { id: 1, title: 'ЛР1', maxScore: 10, section: BarsSection.Labs },
      { id: 2, title: 'ЛР2', maxScore: 10, section: BarsSection.Labs },
      { id: 3, title: 'ЛР3', maxScore: 10, section: BarsSection.Labs },
      { id: 4, title: 'ЛР4', maxScore: 10, section: BarsSection.Labs },
      { id: 5, title: 'ЛР5', maxScore: 10, section: null },
      { id: 6, title: 'Экзамен', maxScore: 20, section: null },
      { id: 7, title: 'Тест', maxScore: 5, section: null },
      { id: 8, title: 'Контрольная работа 1', maxScore: 10, section: null },
      { id: 9, title: 'Контрольная работа 2', maxScore: 5, section: null },
      { id: 10, title: 'Активность на занятиях', maxScore: 10, section: null },
    ],
  },
  6: {
    courseId: 6,
    courseTitle: 'Проектирование интерфейсов',
    groups: [
      {
        name: 'P3312',
        students: toStudents('Дизайн 1.1', 413101, [
          'Васильев Глеб Романович',
          'Егорова Мария Александровна',
          'Жуков Тимофей Евгеньевич',
          'Ильина Софья Дмитриевна',
          'Ковалёв Роман Алексеевич',
          'Никитина Алиса Юрьевна',
          'Орлов Даниил Михайлович',
        ]),
      },
      {
        name: 'P3313',
        students: toStudents('Дизайн 1.1', 413151, [
          'Павлова Вера Николаевна',
          'Романов Егор Владимирович',
          'Семёнова Ксения Артёмовна',
          'Тарасов Лев Игоревич',
          'Фёдорова Алёна Сергеевна',
        ]),
      },
    ],
    sectionLimits: toLimits({
      [BarsSection.ClassWork]: 10,
      [BarsSection.Labs]: 40,
      [BarsSection.Tests]: 10,
      [BarsSection.Midterm]: 10,
      [BarsSection.Exam]: 30,
    }),
    works: [
      { id: 21, title: 'ЛР1', maxScore: 10, section: BarsSection.Labs },
      { id: 22, title: 'ЛР2', maxScore: 10, section: BarsSection.Labs },
      { id: 23, title: 'ЛР3', maxScore: 10, section: null },
      { id: 24, title: 'ЛР4', maxScore: 10, section: null },
      { id: 25, title: 'Активность на занятиях', maxScore: 10, section: null },
      { id: 26, title: 'Контрольная работа', maxScore: 10, section: null },
      { id: 27, title: 'Рубежный тест', maxScore: 10, section: null },
      { id: 28, title: 'Защита проекта', maxScore: 30, section: null },
    ],
  },
  // ни одна работа ещё не разложена
  7: {
    courseId: 7,
    courseTitle: 'Технологии программирования',
    groups: [
      {
        name: 'P3210',
        students: toStudents('Прог 2.1', 414201, [
          'Алексеев Михаил Петрович',
          'Борисова Юлия Андреевна',
          'Денисов Артур Викторович',
          'Ефимова Ольга Сергеевна',
          'Захаров Иван Константинович',
        ]),
      },
      {
        name: 'P3211',
        students: toStudents('Прог 2.1', 414251, [
          'Исаева Мила Тимуровна',
          'Козлов Степан Андреевич',
          'Литвинова Ева Олеговна',
          'Макаров Георгий Ильич',
          'Носова Арина Денисовна',
          'Осипов Фёдор Романович',
        ]),
      },
      {
        name: 'P3212',
        students: toStudents('Прог 2.1', 414301, [
          'Петров Матвей Алексеевич',
          'Родионова Таисия Игоревна',
          'Сергеев Виктор Павлович',
          'Титова Злата Максимовна',
          'Устинов Ярослав Сергеевич',
        ]),
      },
    ],
    sectionLimits: toLimits({
      [BarsSection.ClassWork]: 20,
      [BarsSection.Labs]: 20,
      [BarsSection.Tests]: 20,
      [BarsSection.Midterm]: 20,
      [BarsSection.Exam]: 20,
    }),
    works: [
      { id: 41, title: 'ЛР1', maxScore: 10, section: null },
      { id: 42, title: 'ЛР2', maxScore: 10, section: null },
      { id: 43, title: 'Работа на семинарах', maxScore: 20, section: null },
      { id: 44, title: 'Контрольная работа', maxScore: 20, section: null },
      { id: 45, title: 'Рубежный тест', maxScore: 20, section: null },
      { id: 46, title: 'Экзамен', maxScore: 20, section: null },
    ],
  },
};
