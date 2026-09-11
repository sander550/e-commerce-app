from core.infrastructure.ollama import OllamaClient


class EmbeddingService:
    def __init__(self, ollama_client: OllamaClient, model_name: str = "bge-large"):
        self.model_name = model_name
        self.client = ollama_client

    async def embed(self, input: str):
        response = self.client.embedding(model=self.model_name, input=input)
        return response

