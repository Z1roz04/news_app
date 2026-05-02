import os
import json
from typing import Any, Dict, List
from urllib.parse import parse_qs, urlparse

import httpx


class ExampleNewsApiProvider:

    def __init__(self) -> None:
        self.api_url = os.getenv("NEWS_API_URL", "").strip()
        self.api_key = os.getenv("NEWS_API_KEY", "").strip()
        self.platform = os.getenv("NEWS_API_PLATFORM", "").strip()
        self.auth_mode = os.getenv("NEWS_API_AUTH_MODE", "bearer").strip().lower()
        self.limit_param = os.getenv("NEWS_API_LIMIT_PARAM", "limit").strip() or "limit"
        self.extra_params = os.getenv("NEWS_API_EXTRA_PARAMS", "").strip()
        self.timeout = int(os.getenv("NEWS_API_TIMEOUT", "10"))

    def _build_params(self, limit: int) -> Dict[str, Any]:
        params: Dict[str, Any] = {self.limit_param: limit}

        parsed = urlparse(self.api_url)
        query_params = parse_qs(parsed.query)
        if "platform" not in query_params and self.platform:
            params["platform"] = self.platform

        if self.extra_params:
            try:
                extra = json.loads(self.extra_params)
                if isinstance(extra, dict):
                    params.update(extra)
            except json.JSONDecodeError:
                print("[ingest] NEWS_API_EXTRA_PARAMS 不是合法 JSON，已忽略。")

        return params

    def _build_headers(self) -> Dict[str, str]:
        headers: Dict[str, str] = {}
        if not self.api_key:
            return headers

        if self.auth_mode == "appcode":
            headers["Authorization"] = f"APPCODE {self.api_key}"
        elif self.auth_mode == "bearer":
            headers["Authorization"] = f"Bearer {self.api_key}"
        else:
            headers["Authorization"] = self.api_key

        return headers

    @staticmethod
    def _extract_items(payload: Any) -> List[Dict[str, Any]]:
        if isinstance(payload, list):
            return [item for item in payload if isinstance(item, dict)]

        if not isinstance(payload, dict):
            return []

        # 一级列表字段
        for key in ("data", "list", "articles", "results", "newslist", "result"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]

        # 二级嵌套结构
        for key in ("data", "result"):
            value = payload.get(key)
            if isinstance(value, dict):
                for inner_key in ("list", "items", "news", "newslist", "articles", "results"):
                    inner_value = value.get(inner_key)
                    if isinstance(inner_value, list):
                        return [item for item in inner_value if isinstance(item, dict)]

        # 阿里云 showapi 结构: showapi_res_body.pagebean.contentlist
        showapi_body = payload.get("showapi_res_body")
        if isinstance(showapi_body, dict):
            pagebean = showapi_body.get("pagebean")
            if isinstance(pagebean, dict):
                content_list = pagebean.get("contentlist")
                if isinstance(content_list, list):
                    return [item for item in content_list if isinstance(item, dict)]

        return []

    async def fetch(self, limit: int = 20) -> List[Dict[str, Any]]:
        if not self.api_url:
            print("[ingest] NEWS_API_URL 未配置，跳过采集。")
            return []

        params = self._build_params(limit=limit)
        headers = self._build_headers()

        async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
            resp = await client.get(self.api_url, params=params, headers=headers)
            resp.raise_for_status()
            payload = resp.json()
        return self._extract_items(payload)
