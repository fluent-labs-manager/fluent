// ставит фокус на чип работы внутри container. false — такого чипа там нет.
// Нужен, когда чип перерисовывается в другом месте и фокус пропадает с ним
export function focusWorkChip(
  container: ParentNode | null,
  workId: number,
): boolean {
  const chip = container?.querySelector<HTMLElement>(
    `[data-work-id="${String(workId)}"]`,
  );
  if (chip === null || chip === undefined) {
    return false;
  }
  chip.focus();
  return true;
}
