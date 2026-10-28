import { describe, expect, it } from 'vitest';

import { MAX_FILE_SIZE_BYTES } from '@/constants/labSubmission.ts';
import { validateSubmissionFile } from '@/utils/FileValidation.ts';

function createFile(name: string, size = 1024): File {
  const file = new File([''], name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('validateSubmissionFile', () => {
  it('принимает файлы разрешённых типов', () => {
    for (const name of ['a.pdf', 'a.zip', 'a.ipynb', 'a.py', 'Main.java']) {
      expect(validateSubmissionFile(createFile(name))).toBeNull();
    }
  });

  it('тип по расширению не зависит от регистра', () => {
    expect(validateSubmissionFile(createFile('OTCHET.PDF'))).toBeNull();
  });

  it('другой тип не принимает и перечисляет допустимые', () => {
    expect(validateSubmissionFile(createFile('setup.exe'))).toBe(
      'Этот тип файла не принимается. Можно: PDF, ZIP, IPYNB, PY, JAVA',
    );
  });

  it('файл без расширения не принимает', () => {
    expect(validateSubmissionFile(createFile('Makefile'))).not.toBeNull();
  });

  it('пустой файл не принимает', () => {
    expect(validateSubmissionFile(createFile('a.pdf', 0))).toBe('Файл пустой');
  });

  it('у пустого файла другого типа сначала говорит про тип', () => {
    expect(validateSubmissionFile(createFile('a.exe', 0))).toBe(
      'Этот тип файла не принимается. Можно: PDF, ZIP, IPYNB, PY, JAVA',
    );
  });

  it('файл ровно 20 МБ принимает, а больше — нет', () => {
    expect(
      validateSubmissionFile(createFile('a.zip', MAX_FILE_SIZE_BYTES)),
    ).toBeNull();
    expect(
      validateSubmissionFile(createFile('a.zip', MAX_FILE_SIZE_BYTES + 1)),
    ).toBe('Файл больше 20 МБ');
  });
});
