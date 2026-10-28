const pluralRules = new Intl.PluralRules('ru-RU');

// формы слова для 1, 2 и 5: ['студент', 'студента', 'студентов']
type PluralForms = readonly [one: string, few: string, many: string];

// «1 студент», «3 студента», «11 студентов»
export function pluralize(count: number, forms: PluralForms): string {
  const [one, few, many] = forms;
  const rule = pluralRules.select(count);
  const word = rule === 'one' ? one : rule === 'few' ? few : many;
  return `${String(count)} ${word}`;
}
