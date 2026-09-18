from unittest.mock import AsyncMock

from fastapi.testclient import TestClient

from main import app
from search.application.use_cases.hybrid_search import HybridSearchUseCase
from core.application.use_case_factories.search_factories import get_search_use_case


client = TestClient(app)


def test_search_products():
    use_case = AsyncMock()

    use_case.execute.return_value = [
        {
            "id": 1,
            "name": "Test Product",
        }
    ]

    app.dependency_overrides[get_search_use_case] = lambda: use_case

    response = client.get(
        "/search/",
        params={"q": "test"},
    )

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 1,
            "name": "Test Product",
        }
    ]

    use_case.execute.assert_awaited_once_with(query="test")

    app.dependency_overrides = {}