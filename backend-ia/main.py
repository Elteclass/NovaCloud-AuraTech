import os
from typing import Any
from uuid import UUID, uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from pydantic import BaseModel, Field

import google.generativeai as genai

load_dotenv()

APP_TITLE = "NovaCloud IA Microservice"
APP_VERSION = "0.1.0"
DEFAULT_MODEL = "gemini-2.5-flash"

SYSTEM_INSTRUCTION = (
    "Eres un Analista Corporativo de AuraTech. "
    "Tu salida debe ser formal, objetiva y clara. "
    "Resume el contenido en vinetas, destacando hallazgos clave, riesgos y recomendaciones accionables. "
    "Evita opiniones personales, relleno y lenguaje coloquial."
)

app = FastAPI(title=APP_TITLE, version=APP_VERSION)


class SummarizeRequest(BaseModel):
    document_id: UUID = Field(..., description="ID unico del documento")
    content: str = Field(..., min_length=1, description="Texto plano extraido del documento")


class SummaryMetadata(BaseModel):
    model_used: str
    tokens_estimated: int


class SummarizeResponse(BaseModel):
    success: bool
    summary: str
    metadata: SummaryMetadata


def estimate_tokens(text: str) -> int:
    # Heuristica comun: ~4 caracteres por token para texto en espanol/ingles.
    return max(1, len(text) // 4)


def build_mock_response() -> SummarizeResponse:
    return SummarizeResponse(
        success=True,
        summary=(
            "- El documento presenta objetivos y alcance con claridad operacional.\n"
            "- Se identifican dependencias criticas en integraciones externas y tiempos de entrega.\n"
            "- Recomendacion: priorizar plan de mitigacion de riesgos y definir hitos semanales de seguimiento."
        ),
        metadata=SummaryMetadata(
            model_used=DEFAULT_MODEL,
            tokens_estimated=450,
        ),
    )


def create_gemini_model() -> genai.GenerativeModel:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY no esta configurada en el entorno (.env).",
        )

    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        model_name=DEFAULT_MODEL,
        system_instruction=SYSTEM_INSTRUCTION,
    )


def extract_text_response(response: Any) -> str:
    text = getattr(response, "text", None)
    if text and text.strip():
        return text.strip()

    candidates = getattr(response, "candidates", []) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        if content is None:
            continue
        parts = getattr(content, "parts", []) or []
        for part in parts:
            part_text = getattr(part, "text", None)
            if part_text and part_text.strip():
                return part_text.strip()

    raise HTTPException(
        status_code=502,
        detail="Gemini no devolvio contenido de texto utilizable.",
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/ai/summarize", response_model=SummarizeResponse)
def summarize_document(
    payload: SummarizeRequest,
    mock: bool = Query(default=False, description="Si es true, evita llamar a Gemini."),
) -> SummarizeResponse:
    if mock:
        return build_mock_response()

    model = create_gemini_model()

    prompt = (
        "Analiza el siguiente documento y entrega un resumen ejecutivo breve en vinetas.\n"
        "Debe ser util para un equipo de negocio/tecnico.\n"
        "Incluye: puntos clave, riesgos y recomendaciones.\n\n"
        f"Document ID: {payload.document_id}\n"
        "Contenido:\n"
        f"{payload.content}"
    )

    try:
        llm_response = model.generate_content(prompt)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Error al invocar Gemini: {exc}",
        ) from exc

    summary_text = extract_text_response(llm_response)

    try:
        token_count = model.count_tokens(payload.content).total_tokens
    except Exception:
        token_count = estimate_tokens(payload.content)

    return SummarizeResponse(
        success=True,
        summary=summary_text,
        metadata=SummaryMetadata(
            model_used=DEFAULT_MODEL,
            tokens_estimated=token_count,
        ),
    )


@app.post("/api/ai/summarize-file", response_model=SummarizeResponse)
async def summarize_file(
    file: UploadFile = File(..., description="Archivo .txt a resumir"),
    document_id: str | None = Form(None, description="Opcional: UUID del documento"),
    mock: bool = Query(default=False, description="Si es true, evita llamar a Gemini."),
) -> SummarizeResponse:
    try:
        raw = await file.read()
        try:
            content = raw.decode("utf-8")
        except Exception:
            content = raw.decode("latin-1")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"No se pudo leer el archivo: {exc}")

    content = content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="El archivo esta vacío o no contiene texto legible.")

    if document_id:
        try:
            doc_uuid = UUID(document_id)
        except Exception:
            raise HTTPException(status_code=400, detail="document_id no es un UUID valido.")
    else:
        doc_uuid = uuid4()

    payload = SummarizeRequest(document_id=doc_uuid, content=content)
    return summarize_document(payload, mock=mock)
