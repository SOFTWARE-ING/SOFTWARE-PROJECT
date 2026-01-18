from core.gemini import client


def ask_gemini(prompt: str, model: str = "gemini-3-flash-preview") -> str:
    response = client.models.generate_content(
        model=model,
        contents=prompt
    )
    return response.text


