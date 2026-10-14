// дата и время с часовым поясом в формате ISO 8601. Получается только через
// toIsoDateTime, поэтому строку без проверки сюда не подставить
export type IsoDateTime = string & { readonly __brand: 'IsoDateTime' };
