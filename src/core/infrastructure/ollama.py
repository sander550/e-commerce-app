import os
import ollama
from core.config.settings import settings


class OllamaClient:
    def __init__(self):
        host = settings.OLLAMA_HOST # Change this if you use localhost
        self.client = ollama.Client(host=host)

    def embedding(self, model: str, input: str):
        # Call the correct Ollama endpoint: /api/embed
        response = self.client.embed(model=model, input=input)
        return response["embeddings"][0]
