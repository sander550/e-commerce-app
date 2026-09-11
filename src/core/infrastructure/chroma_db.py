from chromadb import PersistentClient

class ChromaDBClient:
    def __init__(self, path="chroma_data"):
        self.client = PersistentClient(path=path)

    def get_collection(self, name: str):
        return self.client.get_or_create_collection(name)
