import pytest

from catalog.infrastructure.repositories.product_repo_impl import ProductRepository
from catalog.infrastructure.repositories.category_repo_impl import CategoryRepository

from catalog.domain.entities.product import Product


@pytest.mark.asyncio
async def test_category_repository_create_and_get(db_session):
    repo = CategoryRepository(db_session)

    category = await repo.create(
        name="Electronics",
        parent_id=None,
    )

    assert category.id is not None
    assert category.name == "Electronics"
    assert category.parent_id is None

    result = await repo.get_by_id(category.id)

    assert result is not None
    assert result.id == category.id
    assert result.name == "Electronics"
    assert result.parent_id is None


@pytest.mark.asyncio
async def test_category_repository_list(db_session):
    repo = CategoryRepository(db_session)

    category1 = await repo.create(
        name="Electronics",
        parent_id=None,
    )

    category2 = await repo.create(
        name="Clothing",
        parent_id=None,
    )

    categories = await repo.list()

    assert len(categories) == 2
    assert {category.id for category in categories} == {
        category1.id,
        category2.id,
    }


@pytest.mark.asyncio
async def test_category_repository_update(db_session):
    repo = CategoryRepository(db_session)

    category = await repo.create(
        name="Electronics",
        parent_id=None,
    )

    updated = await repo.update(
        category_id=category.id,
        name="Computers",
        parent_id=None,
    )

    assert updated is not None
    assert updated.id == category.id
    assert updated.name == "Computers"


@pytest.mark.asyncio
async def test_category_repository_update_nonexistent(db_session):
    repo = CategoryRepository(db_session)

    result = await repo.update(
        category_id=99999,
        name="Does Not Exist",
        parent_id=None,
    )

    assert result is None


@pytest.mark.asyncio
async def test_category_repository_delete(db_session):
    repo = CategoryRepository(db_session)

    category = await repo.create(
        name="Electronics",
        parent_id=None,
    )

    await repo.delete(category.id)

    result = await repo.get_by_id(category.id)

    assert result is None


@pytest.mark.asyncio
async def test_product_repository_create_and_get(db_session):
    category_repo = CategoryRepository(db_session)
    product_repo = ProductRepository(
        db_session,
        category_repo,
    )

    category = await category_repo.create(
        name="Electronics",
        parent_id=None,
    )

    product = Product(
        id=None,
        name="Laptop",
        description="Gaming laptop",
        price=999.99,
        stock=10,
        category_id=category.id,
        image_url="https://example.com/laptop.jpg",
        is_active=True,
    )

    created = await product_repo.create(product)

    assert created.id is not None
    assert created.name == "Laptop"
    assert created.description == "Gaming laptop"
    assert created.price == 999.99
    assert created.stock == 10
    assert created.category_id == category.id
    assert created.image_url == "https://example.com/laptop.jpg"
    assert created.is_active is True

    result = await product_repo.get_by_id(created.id)

    assert result is not None
    assert result.id == created.id
    assert result.name == "Laptop"


@pytest.mark.asyncio
async def test_product_repository_get_nonexistent(db_session):
    category_repo = CategoryRepository(db_session)
    product_repo = ProductRepository(
        db_session,
        category_repo,
    )

    result = await product_repo.get_by_id(99999)

    assert result is None


@pytest.mark.asyncio
async def test_product_repository_list(db_session):
    category_repo = CategoryRepository(db_session)
    product_repo = ProductRepository(
        db_session,
        category_repo,
    )

    category = await category_repo.create(
        name="Electronics",
        parent_id=None,
    )

    product1 = await product_repo.create(
        Product(
            id=None,
            name="Laptop",
            description="Gaming laptop",
            price=999.99,
            stock=10,
            category_id=category.id,
            image_url=None,
            is_active=True,
        )
    )

    product2 = await product_repo.create(
        Product(
            id=None,
            name="Keyboard",
            description="Mechanical keyboard",
            price=99.99,
            stock=20,
            category_id=category.id,
            image_url=None,
            is_active=True,
        )
    )

    products = await product_repo.list()

    assert len(products) == 2
    assert {product.id for product in products} == {
        product1.id,
        product2.id,
    }


@pytest.mark.asyncio
async def test_product_repository_list_by_category(db_session):
    category_repo = CategoryRepository(db_session)
    product_repo = ProductRepository(
        db_session,
        category_repo,
    )

    electronics = await category_repo.create(
        name="Electronics",
        parent_id=None,
    )

    clothing = await category_repo.create(
        name="Clothing",
        parent_id=None,
    )

    laptop = await product_repo.create(
        Product(
            id=None,
            name="Laptop",
            description="Gaming laptop",
            price=999.99,
            stock=10,
            category_id=electronics.id,
            image_url=None,
            is_active=True,
        )
    )

    shirt = await product_repo.create(
        Product(
            id=None,
            name="Shirt",
            description="Cotton shirt",
            price=29.99,
            stock=50,
            category_id=clothing.id,
            image_url=None,
            is_active=True,
        )
    )

    products = await product_repo.list_by_category(electronics.id)

    assert len(products) == 1
    assert products[0].id == laptop.id
    assert products[0].category_id == electronics.id
    assert products[0].id != shirt.id


@pytest.mark.asyncio
async def test_product_repository_update(db_session):
    category_repo = CategoryRepository(db_session)
    product_repo = ProductRepository(
        db_session,
        category_repo,
    )

    category = await category_repo.create(
        name="Electronics",
        parent_id=None,
    )

    product = await product_repo.create(
        Product(
            id=None,
            name="Laptop",
            description="Old description",
            price=999.99,
            stock=10,
            category_id=category.id,
            image_url=None,
            is_active=True,
        )
    )

    updated_product = Product(
        id=product.id,
        name="Better Laptop",
        description="New description",
        price=1199.99,
        stock=15,
        category_id=category.id,
        image_url="new-image.jpg",
        is_active=True,
    )

    result = await product_repo.update(updated_product)

    assert result is not None
    assert result.id == product.id
    assert result.name == "Better Laptop"
    assert result.description == "New description"
    assert result.price == 1199.99
    assert result.stock == 15
    assert result.image_url == "new-image.jpg"


@pytest.mark.asyncio
async def test_product_repository_update_nonexistent(db_session):
    category_repo = CategoryRepository(db_session)
    product_repo = ProductRepository(
        db_session,
        category_repo,
    )

    product = Product(
        id=99999,
        name="Does Not Exist",
        description="Nothing",
        price=10.0,
        stock=1,
        category_id=None,
        image_url=None,
        is_active=True,
    )

    result = await product_repo.update(product)

    assert result is None


@pytest.mark.asyncio
async def test_product_repository_delete(db_session):
    category_repo = CategoryRepository(db_session)
    product_repo = ProductRepository(
        db_session,
        category_repo,
    )

    category = await category_repo.create(
        name="Electronics",
        parent_id=None,
    )

    product = await product_repo.create(
        Product(
            id=None,
            name="Laptop",
            description="Gaming laptop",
            price=999.99,
            stock=10,
            category_id=category.id,
            image_url=None,
            is_active=True,
        )
    )

    await product_repo.delete(product.id)

    result = await product_repo.get_by_id(product.id)

    assert result is None


@pytest.mark.asyncio
async def test_product_repository_delete_nonexistent(db_session):
    category_repo = CategoryRepository(db_session)
    product_repo = ProductRepository(
        db_session,
        category_repo,
    )

    result = await product_repo.delete(99999)

    assert result is None


@pytest.mark.asyncio
async def test_product_repository_search_keyword(db_session):
    category_repo = CategoryRepository(db_session)
    product_repo = ProductRepository(
        db_session,
        category_repo,
    )

    category = await category_repo.create(
        name="Electronics",
        parent_id=None,
    )

    laptop = await product_repo.create(
        Product(
            id=None,
            name="Gaming Laptop",
            description="Powerful computer for gaming",
            price=1499.99,
            stock=5,
            category_id=category.id,
            image_url=None,
            is_active=True,
        )
    )

    keyboard = await product_repo.create(
        Product(
            id=None,
            name="Mechanical Keyboard",
            description="RGB gaming keyboard",
            price=99.99,
            stock=20,
            category_id=category.id,
            image_url=None,
            is_active=True,
        )
    )

    result = await product_repo.search_keyword("gaming")

    assert laptop.id in result
    assert keyboard.id in result
    assert len(result) == 2


@pytest.mark.asyncio
async def test_product_repository_search_keyword_case_insensitive(db_session):
    category_repo = CategoryRepository(db_session)
    product_repo = ProductRepository(
        db_session,
        category_repo,
    )

    category = await category_repo.create(
        name="Electronics",
        parent_id=None,
    )

    product = await product_repo.create(
        Product(
            id=None,
            name="Gaming Laptop",
            description="Powerful laptop",
            price=999.99,
            stock=10,
            category_id=category.id,
            image_url=None,
            is_active=True,
        )
    )

    result = await product_repo.search_keyword("GAMING")

    assert result == [product.id]