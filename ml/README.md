# UzSign AI — ML pipeline

> **Holat (1-bosqich):** faqat papka tuzilmasi. Ma'lumotlar to'plami, o'qitish
> skriptlari va model checkpointlari hali yo'q. Hech qanday model natijasi
> yoki aniqlik ko'rsatkichi e'lon qilinmaydi.

| Papka | Vazifasi | Qaysi bosqichda |
|---|---|---|
| `datasets/` | Rozilik berilgan ishtirokchilar videolari va `manifest.csv` (gitga kiritilmaydi) | 6 |
| `preprocessing/` | Manifest validatsiyasi, MediaPipe landmark ajratish, normalizatsiya | 6 |
| `training/` | Baseline (Random Forest) va temporal (GRU/LSTM) modellar | 6 |
| `evaluation/` | Accuracy, precision, recall, F1, confusion matrix, latency | 6 |
| `inference/` | Backend yuklaydigan checkpoint loader | 6 |
| `checkpoints/` | Versiyalangan model artefaktlari (gitga kiritilmaydi) | 6 |

Asosiy qoidalar:

- Train/val/test bo'linishi **ishtirokchi bo'yicha** (participant leakage yo'q).
- Har bir yozuv uchun ishtirokchining **ma'lumotli roziligi** bo'lishi shart va
  materialni o'chirish imkoniyati saqlanadi.
- Belgilar (labels) faqat mutaxassis tomonidan tasdiqlangan `sign_id` larga
  bog'lanadi.
- Metrikalar faqat haqiqiy test bo'linmasida o'lchab, `model_versions.evaluation_metadata`
  ga avtomatik yoziladi.
