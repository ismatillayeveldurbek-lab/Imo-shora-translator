"""Reports which AI capabilities are genuinely usable.

A capability is only ``ready`` when an active, registered model has its
artifact on disk AND an inference runtime is able to serve it. Nothing here
fabricates availability: until the inference runtime lands (ML phase), sign
recognition reports ``unavailable`` even if a model is registered.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models import ModelStatus, ModelTask, ModelVersion
from app.schemas.system import ActiveModelInfo, CapabilityStatus

_SIGN_TASKS = (
    ModelTask.ISOLATED_SIGN_CLASSIFIER,
    ModelTask.STATIC_HAND_CLASSIFIER,
    ModelTask.CONTINUOUS_SIGN_RECOGNIZER,
)

# Tasks for which a server-side inference runtime is implemented.
# Empty until the ML inference phase registers real loaders.
SUPPORTED_INFERENCE_TASKS: frozenset[ModelTask] = frozenset()


def _artifact_present(settings: Settings, artifact_uri: str) -> bool:
    if artifact_uri.startswith("s3://"):
        # Remote artifacts are verified by the inference loader when it downloads them.
        return False
    base = settings.model_artifacts_dir.resolve()
    candidate = (base / artifact_uri).resolve()
    # Refuse paths escaping the artifacts directory.
    if not candidate.is_relative_to(base):
        return False
    return candidate.is_file()


async def get_sign_recognition_status(
    session: AsyncSession, settings: Settings
) -> CapabilityStatus:
    result = await session.execute(
        select(ModelVersion).where(
            ModelVersion.status == ModelStatus.ACTIVE, ModelVersion.task.in_(_SIGN_TASKS)
        )
    )
    active = result.scalars().all()
    if not active:
        return CapabilityStatus(
            capability="sign_recognition",
            status="not_configured",
            reason="No trained sign recognition model is registered as active.",
        )

    # Prefer the most capable task when several are active.
    model = sorted(active, key=lambda m: _SIGN_TASKS.index(m.task))[0]
    info = ActiveModelInfo(
        model_name=model.model_name,
        model_version=model.model_version,
        task=model.task,
        class_count=len(model.supported_classes),
        artifact_present=_artifact_present(settings, model.artifact_uri),
    )
    if not info.artifact_present:
        return CapabilityStatus(
            capability="sign_recognition",
            status="unavailable",
            reason="Active model artifact was not found in the artifacts directory.",
            model=info,
        )
    if model.task not in SUPPORTED_INFERENCE_TASKS:
        return CapabilityStatus(
            capability="sign_recognition",
            status="unavailable",
            reason=f"No inference runtime is implemented for task '{model.task.value}'.",
            model=info,
        )
    return CapabilityStatus(
        capability="sign_recognition", status="ready", reason="Model loaded.", model=info
    )


def get_speech_recognition_status(settings: Settings) -> CapabilityStatus:
    if settings.asr_provider is None:
        return CapabilityStatus(
            capability="speech_recognition",
            status="not_configured",
            reason="ASR_PROVIDER is not set; no Uzbek speech recognition backend is configured.",
        )
    return CapabilityStatus(
        capability="speech_recognition",
        status="unavailable",
        reason=f"ASR provider '{settings.asr_provider}' is not supported by this build.",
    )
