const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * 1024;

const megabyteFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
});

// «640 Б», «512 КБ», «2,4 МБ»
export function formatFileSize(bytes: number): string {
  if (bytes < KILOBYTE) {
    return `${String(bytes)} Б`;
  }
  if (bytes < MEGABYTE) {
    return `${String(Math.round(bytes / KILOBYTE))} КБ`;
  }
  return `${megabyteFormatter.format(bytes / MEGABYTE)} МБ`;
}

// тип по расширению: «report.pdf» → «PDF»; без расширения — пустая строка
export function getFileType(name: string): string {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex > 0 ? name.slice(dotIndex + 1).toUpperCase() : '';
}
