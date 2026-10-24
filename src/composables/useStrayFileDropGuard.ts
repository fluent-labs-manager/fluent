import { onScopeDispose } from 'vue';

// файл, брошенный мимо области загрузки, браузер открывает сам — страница
// со всем, что студент заполнил, пропадает. Пока composable активен, такой
// файл никуда не попадает. Область загрузки отменяет события сама, поэтому
// её файл сюда приходит уже обработанным
export function useStrayFileDropGuard(): void {
  function blockDragOver(event: DragEvent): void {
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    // курсор «нельзя» вместо «копировать»: сюда файл не примут
    if (event.dataTransfer !== null) {
      event.dataTransfer.dropEffect = 'none';
    }
  }

  function blockDrop(event: DragEvent): void {
    if (!event.defaultPrevented) {
      event.preventDefault();
    }
  }

  window.addEventListener('dragover', blockDragOver);
  window.addEventListener('drop', blockDrop);

  onScopeDispose(() => {
    window.removeEventListener('dragover', blockDragOver);
    window.removeEventListener('drop', blockDrop);
  });
}
