import { onScopeDispose } from 'vue';

// перетаскивают ли файл: текст или ссылку браузер вставляет сам, их не трогаем
function isFileDrag(event: DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}

function blockDragOver(event: DragEvent): void {
  if (event.defaultPrevented || !isFileDrag(event)) {
    return;
  }
  event.preventDefault();
  // курсор «нельзя» вместо «копировать»: сюда файл не примут
  if (event.dataTransfer !== null) {
    event.dataTransfer.dropEffect = 'none';
  }
}

function blockDrop(event: DragEvent): void {
  if (!event.defaultPrevented && isFileDrag(event)) {
    event.preventDefault();
  }
}

// обработчики общие, поэтому снимать их можно только вместе с последним
// активным вызовом: иначе первый закрывшийся оставил бы остальных без защиты
let activeGuards = 0;

// файл, брошенный мимо области загрузки, браузер открывает сам — страница
// со всем, что студент заполнил, пропадает. Пока composable активен, такой
// файл никуда не попадает. Область загрузки отменяет события сама, поэтому
// её файл сюда приходит уже обработанным
export function useStrayFileDropGuard(): void {
  if (activeGuards === 0) {
    window.addEventListener('dragover', blockDragOver);
    window.addEventListener('drop', blockDrop);
  }
  activeGuards += 1;

  onScopeDispose(() => {
    activeGuards -= 1;
    if (activeGuards === 0) {
      window.removeEventListener('dragover', blockDragOver);
      window.removeEventListener('drop', blockDrop);
    }
  });
}
