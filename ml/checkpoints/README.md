# checkpoints/

Versiyalangan, o'qitilgan model artefaktlari (`<model_name>/<version>/...`).
Backend bu papkani `MODEL_ARTIFACTS_DIR` orqali faqat o'qish rejimida ko'radi.
Artefaktlar gitga kiritilmaydi. Hozircha bu yerda hech qanday model yo'q,
shuning uchun `/api/models/status` `not_configured` qaytaradi.
