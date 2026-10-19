from jkj.config import Settings


def test_neon_url_is_translated_for_asyncpg():
    s = Settings(DATABASE_URL="postgres://u:p@ep-x.neon.tech/neondb?sslmode=require&channel_binding=require")
    url, args = s.sqlalchemy_url
    assert url == "postgresql+asyncpg://u:p@ep-x.neon.tech/neondb"
    assert args == {"statement_cache_size": 0, "ssl": "require"}


def test_unpooled_url_preferred():
    s = Settings(DATABASE_URL="postgres://pooled/db", DATABASE_URL_UNPOOLED="postgresql://direct/db")
    assert s.sqlalchemy_url[0] == "postgresql+asyncpg://direct/db"


def test_multiple_recipients_and_origins():
    s = Settings(NOTIFICATION_TO_EMAIL="a@x.com, b@y.com", FRONTEND_URL="https://jkj.com/, https://www.jkj.com")
    assert s.notification_recipients == ["a@x.com", "b@y.com"]
    assert s.allowed_origins == ["https://jkj.com", "https://www.jkj.com"]
    assert s.cookie_secure is True
