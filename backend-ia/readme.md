# backend-ia

Microservicio de IA para NovaCloud con FastAPI.

## Objetivo

Exponer un endpoint aislado para resumir texto usando Gemini, con modo mock para pruebas sin consumo de tokens.

## Requisitos

- Python 3.10+
- Dependencias en `requirements.txt`

## Setup rapido

```bash
cd /home/ubuntu/NovaCloud-AuraTech/backend-ia
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edita .env y agrega GEMINI_API_KEY
```

## Ejecutar

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /health`
- `POST /api/ai/summarize`

### Request

```json
{
  "document_id": "6f95c8d4-3b9a-4f19-a18a-58ca3053de8e",
  "content": "Aqui va todo el texto extraido del documento..."
}
```

### Response

```json
{
  "success": true,
  "summary": "- Punto clave 1\n- Punto clave 2\n- Punto clave 3",
  "metadata": {
    "model_used": "gemini-1.5-flash",
    "tokens_estimated": 450
  }
}
```

## Mock mode

Para simular respuesta de IA sin llamar a Gemini:

```bash
curl -X POST 'http://localhost:8000/api/ai/summarize?mock=true' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "document_id": "6f95c8d4-3b9a-4f19-a18a-58ca3053de8e",
    "content": "Texto de prueba"
  }'
```

### Subir archivo .txt

Si prefieres enviar un archivo `.txt` directamente, usa el endpoint `POST /api/ai/summarize-file` con `multipart/form-data`:

```bash
curl -X POST 'http://localhost:8000/api/ai/summarize-file?mock=true' \\
  -F 'file=@/ruta/a/mi/archivo.txt' \\
  -F 'document_id=6f95c8d4-3b9a-4f19-a18a-58ca3053de8e'
```

Si no envias `document_id`, el servicio generara uno automaticamente.
