from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.models.enums import ModelTask

ComponentState = Literal["ok", "unavailable"]


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    version: str
    environment: str
    database: ComponentState


CapabilityName = Literal["sign_recognition", "speech_recognition"]
CapabilityState = Literal["not_configured", "unavailable", "ready"]


class ActiveModelInfo(BaseModel):
    model_name: str
    model_version: str
    task: ModelTask
    class_count: int = Field(ge=0)
    artifact_present: bool


class CapabilityStatus(BaseModel):
    capability: CapabilityName
    status: CapabilityState
    reason: str = Field(description="Human-readable explanation (English, for operators)")
    model: ActiveModelInfo | None = None


class ModelsStatusResponse(BaseModel):
    capabilities: list[CapabilityStatus]
