from core.gemini import client


def ask_gemini(prompt: str, model: str = "gemini-flash-lite-latest") -> str:
    response = client.models.generate_content(
        model=model,
        contents=prompt
    )
    return response.text
