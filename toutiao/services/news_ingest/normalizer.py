from datetime import datetime
from typing import Any, Dict, List, Optional


def _first_non_empty(item: Dict[str, Any], *keys: str) -> Optional[str]:
    for key in keys:
        value = item.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def _parse_publish_time(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value.replace(microsecond=0)
    if isinstance(value, str):
        raw = value.strip()
        if raw:
            try:
                return datetime.fromisoformat(raw.replace("Z", "+00:00")).replace(microsecond=0, tzinfo=None)
            except ValueError:
                pass
    return datetime.now().replace(microsecond=0)


def _clean_text(text: str) -> str:
    return " ".join(text.split())


def _dedupe_adjacent_sentence(content: str) -> str:
    """
    简单去除连续重复句段，避免出现 A + A 的重复正文。
    """
    parts = [part.strip() for part in content.replace("。", "。\n").splitlines() if part.strip()]
    if not parts:
        return content

    merged: List[str] = []
    for part in parts:
        if not merged or merged[-1] != part:
            merged.append(part)
    normalized = "\n".join(merged)
    return normalized if normalized else content


def _extract_first_image(item: Dict[str, Any]) -> Optional[str]:
    image = _first_non_empty(item, "image", "image_url", "cover")
    if image:
        return image

    imageurls = item.get("imageurls")
    if isinstance(imageurls, list):
        for image_item in imageurls:
            if isinstance(image_item, dict):
                url = image_item.get("url")
                if isinstance(url, str) and url.strip():
                    return url.strip()
    return None


def _extract_content(item: Dict[str, Any]) -> Optional[str]:
    content = _first_non_empty(item, "content", "body", "article")
    if content:
        return _dedupe_adjacent_sentence(_clean_text(content))

    # 阿里云 showapi 的 allList 里可能混合图文，提取文本段落拼接作为正文。
    all_list = item.get("allList")
    if isinstance(all_list, list):
        texts: List[str] = []
        for part in all_list:
            if isinstance(part, str) and part.strip():
                texts.append(_clean_text(part))
        if texts:
            return _dedupe_adjacent_sentence("\n".join(texts))

    # 兜底
    desc = _first_non_empty(item, "desc")
    return _clean_text(desc) if desc else None


def _build_description(item: Dict[str, Any], content: str, title: str) -> str:
    description = _first_non_empty(item, "description", "summary", "desc")
    if description:
        description = _clean_text(description)

    if not description:
        description = content[:120]

    # 避免描述和正文完全相同
    if description == content:
        if len(content) > 120:
            description = content[:120]
        elif title and title != content:
            description = title
        else:
            description = content[:80]

    return description


def normalize_news_item(item: Dict[str, Any],category_map: Dict[str, int],default_category_id: int,) -> Optional[Dict[str, Any]]:
    title = _first_non_empty(item, "title", "headline", "name")
    content = _extract_content(item)
    if not title or not content:
        return None

    title = _clean_text(title)
    content = _clean_text(content)
    description = _build_description(item, content, title)
    image = _extract_first_image(item)
    author = _first_non_empty(item, "author", "source")
    category_name = _first_non_empty(item, "category", "channel", "tag", "channelName")
    category_id = category_map.get(category_name, default_category_id)
    publish_time = _parse_publish_time(
        item.get("publish_time") or item.get("published_at") or item.get("pubDate")
    )

    return {
        "title": title[:255],
        "description": description[:500] if description else None,
        "content": content,
        "image": image[:255] if image else None,
        "author": author[:50] if author else None,
        "category_id": category_id,
        "publish_time": publish_time,
        "views": 0,
    }
