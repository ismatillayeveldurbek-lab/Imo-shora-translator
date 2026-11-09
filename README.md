# UzSign AI

**Til va imo-ishora o'rtasidagi ko'prik** — o'zbek tili va imo-ishora tili o'rtasida
tarjima qilishga yordam beruvchi platforma.

> **Joriy holat: 1-bosqich (arxitektura va sozlash).** Platforma skeleti, ma'lumotlar bazasi
> sxemasi, API asosi va bosh sahifa ishlaydi. Imo-ishora videolari, o'qitilgan model va ASR
> hali ulanmagan — ilova buni ochiq ko'rsatadi. Arxitektura: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Talablar

- Node.js 22+
- Python 3.12+ va [uv](https://docs.astral.sh/uv/)
- PostgreSQL 16 (yoki Docker)

## Docker bilan ishga tushirish

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8000 · OpenAPI hujjati: http://localhost:8000/docs

## Mahalliy ishga tushirish (Dockersiz)

```bash
cp .env.example .env
```

Backend:

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

Ixtiyoriy — dasturlash uchun **test deb belgilangan** fixture yozuvlar (productionda ishlamaydi):

```bash
cd backend && uv run python -m app.scripts.seed_dev_fixtures
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Tekshiruvlar

Backend (testlar haqiqiy PostgreSQL bazasidan foydalanadi; `TEST_DATABASE_URL` bilan o'zgartiring):

```bash
cd backend && uv run ruff check . && uv run mypy app tests && uv run pytest
```

```bash
cd backend && uv run alembic check
```

Frontend:

```bash
cd frontend && npm run lint && npm run typecheck && npm test && npm run build
```

## API

| Metod | Yo'l | Tavsif |
|---|---|---|
| GET | `/api/health` | Servis va DB holati. DB ishlamasa `503` va `"status": "degraded"` |
| GET | `/api/models/status` | Sun'iy intellekt imkoniyatlarining haqiqiy holati |
| GET | `/api/signs` | Lug'at: `q`, `category`, `letter` (o'zbek alifbosi, `o'`, `g'`, `sh`, `ch`, `ng` bilan), `variant`, `page`, `page_size` (≤100) |
| GET | `/api/signs/{id}` | Imo-ishora tafsilotlari va tasdiqlangan videolar. Ommaviy bo'lmasa — `404` |
| GET | `/api/categories` | Ommaviy imo-ishoralari bor toifalar va ularning soni |

**Lug'atda ko'rinish qoidasi:** yozuv `verified` holatida bo'lishi, test ma'lumoti bo'lmasligi va
kamida bitta tasdiqlangan (`validated`) videoga ega bo'lishi shart. Qidiruvda apostrof variantlari
(`'` `‘` `’` `ʻ` `ʼ`) bir xil hisoblanadi.

```bash
curl -s "http://localhost:8000/api/signs?q=o%E2%80%98zbek&page_size=10"
```

```json
{"items": [], "total": 0, "page": 1, "page_size": 10, "total_pages": 0}
```

Dasturlashda test yozuvlarini ko'rish uchun (productionda taqiqlangan):

```bash
cd backend && DICTIONARY_INCLUDE_TEST_DATA=true uv run uvicorn app.main:app --reload
```

Misol:

```bash
curl -s http://localhost:8000/api/models/status
```

```json
{
  "capabilities": [
    {"capability": "sign_recognition", "status": "not_configured",
     "reason": "No trained sign recognition model is registered as active.", "model": null},
    {"capability": "speech_recognition", "status": "not_configured",
     "reason": "ASR_PROVIDER is not set; no Uzbek speech recognition backend is configured.", "model": null}
  ]
}
```

Barcha xatolar bir xil formatda: `{"error": {"code": "...", "message": "...", "details": ...}}`.

## Tamoyillar

- Imo-ishoralar, videolar, datasetlar va model natijalari **o'ylab topilmaydi**.
- Ommaga faqat mutaxassis tasdiqlagan (`verified`) yozuvlar ko'rsatiladi.
- Ma'lumot yetishmaydigan funksiya "sozlanmagan" holatini ko'rsatadi, soxta natija bermaydi.
- Kamera/mikrofon faqat aniq ruxsat bilan; xom video serverga yuborilmaydi.
