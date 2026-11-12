// студент из списка группы; список придёт через ITMO ID
export interface GroupStudent {
  id: number;
  fullName: string;
  // номер в ИСУ
  isuId: number;
  stream: string;
}
