import { describe, expect, it } from 'vitest';
import { formatFileSize, getFileType } from '@/utils/FileFormatter.ts';

describe('formatFileSize', () => {
  it('меньше килобайта пишет в байтах', () => {
    expect(formatFileSize(640)).toBe('640 Б');
  });

  it('килобайты округляет до целых', () => {
    expect(formatFileSize(524_288)).toBe('512 КБ');
    expect(formatFileSize(1024)).toBe('1 КБ');
  });

  it('мегабайты пишет с одним знаком через запятую', () => {
    expect(formatFileSize(2_516_582)).toBe('2,4 МБ');
  });

  it('целые мегабайты пишет без запятой', () => {
    expect(formatFileSize(3 * 1024 * 1024)).toBe('3 МБ');
  });
});

describe('getFileType', () => {
  it('берёт расширение заглавными буквами', () => {
    expect(getFileType('otchet.pdf')).toBe('PDF');
    expect(getFileType('archive.tar.gz')).toBe('GZ');
  });

  it('без расширения возвращает пустую строку', () => {
    expect(getFileType('README')).toBe('');
    expect(getFileType('.gitignore')).toBe('');
  });
});
