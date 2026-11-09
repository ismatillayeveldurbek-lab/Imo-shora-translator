from __future__ import annotations

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models import ModelStatus, ModelTask, ModelVersion


def _capability(body: dict[str, list[dict[str, object]]], name: str) -> dict[str, object]:
    return next(c for c in body["capabilities"] if c["capability"] == name)


async def _add_active_model(db: AsyncSession, artifact_uri: str) -> None:
    db.add(
        ModelVersion(
            model_name="isolated-sign-gru",
            model_version="2026.11.0",
            task=ModelTask.ISOLATED_SIGN_CLASSIFIER,
            artifact_uri=artifact_uri,
            supported_classes=[{"class_index": 0, "gloss": "X"}],
            status=ModelStatus.ACTIVE,
        )
    )
    await db.commit()


async def test_not_configured_without_models(client: AsyncClient) -> None:
    body = (await client.get("/api/models/status")).json()
    sign = _capability(body, "sign_recognition")
    speech = _capability(body, "speech_recognition")
    assert sign["status"] == "not_configured"
    assert sign["model"] is None
    assert speech["status"] == "not_configured"


async def test_active_model_with_missing_artifact_is_unavailable(
    client: AsyncClient, db: AsyncSession
) -> None:
    await _add_active_model(db, "isolated-sign-gru/2026.11.0/model.pt")
    sign = _capability((await client.get("/api/models/status")).json(), "sign_recognition")
    assert sign["status"] == "unavailable"
    assert sign["model"]["artifact_present"] is False  # type: ignore[index]


async def test_present_artifact_without_runtime_is_still_unavailable(
    client: AsyncClient, db: AsyncSession, settings: Settings
) -> None:
    artifact = settings.model_artifacts_dir / "isolated-sign-gru" / "model.pt"
    artifact.parent.mkdir(parents=True)
    artifact.write_bytes(b"not a real model")
    await _add_active_model(db, "isolated-sign-gru/model.pt")

    sign = _capability((await client.get("/api/models/status")).json(), "sign_recognition")
    assert sign["model"]["artifact_present"] is True  # type: ignore[index]
    # No inference runtime exists yet, so the capability must not claim readiness.
    assert sign["status"] == "unavailable"


async def test_artifact_path_traversal_is_rejected(
    client: AsyncClient, db: AsyncSession, settings: Settings
) -> None:
    outside = settings.model_artifacts_dir.parent / "outside.pt"
    outside.write_bytes(b"x")
    settings.model_artifacts_dir.mkdir()
    await _add_active_model(db, "../outside.pt")

    sign = _capability((await client.get("/api/models/status")).json(), "sign_recognition")
    assert sign["model"]["artifact_present"] is False  # type: ignore[index]
