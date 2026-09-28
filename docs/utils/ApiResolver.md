# ApiResolver

`ApiResolver` — утилита для выполнения HTTP-запросов через `axios`. Она собирает полный URL из базового адреса API, endpoint и относительного пути, при необходимости добавляет JWT и пользовательские заголовки, а также приводит ошибки к единому формату.

Исходный код: [`src/utils/ApiResolver.ts`](../../src/utils/ApiResolver.ts).

## Создание экземпляра

```ts
import ApiResolver from '@/utils/ApiResolver.ts';

// Базовый URL будет взят из apiConf.apiUrl.
const usersApi = new ApiResolver('users');

// При необходимости URL API можно переопределить.
const usersApiForTest = new ApiResolver('users', 'https://api.example.com');
```

Для `new ApiResolver('users', 'https://api.example.com')` и `url: 'profile'` итоговый адрес запроса будет `https://api.example.com/users/profile`.

## Запрос

Метод `request<S>(options)` возвращает `Promise<S>`. В `options` обязательны `url` и `method`; остальные поля передаются по необходимости.

```ts
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

const profile = await usersApi.request<UserProfile>({
  url: 'profile',
  method: 'GET',
  jwt: accessToken,
  customHeaders: {
    'X-Client': 'web',
  },
});
```

Для запросов с телом используйте `data`. Тип ответа по умолчанию — `json`; например, для загрузки файла можно передать `responseType: 'blob'`.

```ts
const report = await usersApi.request<Blob>({
  url: 'report',
  method: 'POST',
  data: { period: '2026-09' },
  timeout: 5_000, // Максимальное время ожидания в миллисекундах
  responseType: 'blob',
});
```

Непустой `jwt` добавляется как заголовок `Authorization: Bearer <jwt>`. Пользовательские заголовки объединяются с ним. `timeout` задаёт максимальное время ожидания ответа в миллисекундах и передаётся в конфигурацию Axios; если его не указывать, используется стандартное значение Axios.

## Успешный ответ

`request` возвращает только тело ответа (`response.data`), без HTTP-статуса и заголовков.

```json
{
  "id": 42,
  "name": "Иван Петров",
  "email": "ivan@example.com"
}
```

## Ошибки

`ApiResolver` не выбрасывает ошибку Axios: он возвращает объект, который также следует типизировать как возможный результат запроса. Статус берётся из HTTP-ответа, либо из поля `status` в его теле; если он недоступен, используется `500`.

```ts
interface ApiRequestError {
  status: number;
  message: string;
}

const result = await usersApi.request<UserProfile | ApiRequestError>({
  url: 'profile',
  method: 'GET',
});

if ('status' in result) {
  console.error(`Запрос завершился с ошибкой ${result.status}: ${result.message}`);
}
```

Пример результата при ответе сервера `404`:

```json
{
  "status": 404,
  "message": "Not found"
}
```

Если сервер вернул сообщение в виде `"ERROR: Not found"`, утилита оставляет часть после первого двоеточия. Для ошибки не от Axios возвращается:

```json
{
  "status": 500,
  "message": "Неизвестная ошибка"
}
```

## Преобразование DTO

Для multipart- и query-параметров доступны вспомогательные методы:

```ts
const formData = usersApi.DTOToFormData({
  name: 'Иван',
  avatar: avatarFile,
} as never);

const params = usersApi.DTOToURLSearchParams({
  page: '1',
  query: 'vue',
  archived: null, // null и undefined не попадут в строку запроса
} as never);
```

`DTOToFormData` добавляет все собственные поля DTO в `FormData`, а `DTOToURLSearchParams` пропускает значения `null` и `undefined`.
