import { onScopeDispose, ref } from 'vue';
import type { Ref } from 'vue';

const UPDATE_INTERVAL_MS = 60 * 1000;

// текущее время для расчётов, которые должны меняться на открытой странице.
// Обновляется раз в минуту и при возврате на вкладку: в фоне браузер замедляет таймеры
export function useNow(): Ref<Date> {
  const now = ref<Date>(new Date());

  function update(): void {
    now.value = new Date();
  }

  function updateWhenVisible(): void {
    if (document.visibilityState === 'visible') {
      update();
    }
  }

  const timer = setInterval(update, UPDATE_INTERVAL_MS);
  document.addEventListener('visibilitychange', updateWhenVisible);

  onScopeDispose(() => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', updateWhenVisible);
  });

  return now;
}
