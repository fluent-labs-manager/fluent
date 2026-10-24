// какие файлы принимаются к сдаче
// TODO: согласовать список, размер и кол-во с бэкендом
export const ALLOWED_FILE_EXTENSIONS = [
  'pdf',
  'zip',
  'ipynb',
  'py',,
  'java',
] as const;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
