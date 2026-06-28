from typing import List
from fastapi import APIRouter, HTTPException
from ..schemas import ArticleOut
from ..services.content import get_article, load_articles

router = APIRouter(tags=["content"])


@router.get("/content/articles", response_model=List[ArticleOut])
def list_articles():
    return load_articles()


@router.get("/content/article/{article_id}", response_model=ArticleOut)
def one_article(article_id: str):
    a = get_article(article_id)
    if not a:
        raise HTTPException(status_code=404, detail="article not found")
    return a
