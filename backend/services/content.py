import json
import os
from functools import lru_cache

_DEFAULT = os.path.join(os.path.dirname(__file__), "..", "..", "content")
CONTENT_DIR = os.getenv("CONTENT_DIR", _DEFAULT)


@lru_cache(maxsize=1)
def load_articles():
    path = os.path.join(CONTENT_DIR, "articles.json")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def get_article(article_id):
    for a in load_articles():
        if a["id"] == article_id:
            return a
    return None


def articles_as_context(limit_chars=12000):
    out = []
    total = 0
    for a in load_articles():
        block = "## " + a["title"] + "\n" + a["summary"] + "\n" + a["body"]
        if total + len(block) > limit_chars:
            break
        out.append(block)
        total += len(block)
    return "\n\n".join(out)
