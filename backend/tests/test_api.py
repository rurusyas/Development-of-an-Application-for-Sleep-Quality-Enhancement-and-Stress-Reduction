import io
import json
import backend.services.apnea as apnea_service
from backend.schemas import Onboarding
from backend.services.indices import compute_all


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_user_upsert_and_get(client):
    ob = {
        "sleep_hours": 8,
        "sleep_latency_min": 10,
        "wake_feeling": 4,
        "bedtime_regularity": 4,
        "stress_freq": 2,
        "thoughts_racing": 2,
        "overload": 2,
        "focus_difficulty": 2,
        "distraction": 2,
    }
    r = client.post("/user/tg_100", json={"name": "fedor", "onboarding": ob})
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "fedor"
    assert 0 <= data["sleep_index"] <= 100
    assert data["sleep_index"] > 50
    g = client.get("/user/tg_100")
    assert g.status_code == 200
    assert g.json()["id"] == data["id"]


def test_get_user_404(client):
    r = client.get("/user/does_not_exist")
    assert r.status_code == 404


def test_diary_add_and_list(client):
    u = client.post("/user/tg_diary", json={"name": "d"}).json()
    payload = {
        "user_id": u["id"],
        "mood": 4,
        "energy": 3,
        "stress": 2,
        "sleep_quality": 5,
        "note": "ок",
    }
    r = client.post("/diary", json=payload)
    assert r.status_code == 200
    lst = client.get(f"/diary/{u['id']}").json()
    assert len(lst) == 1
    assert lst[0]["sleep_quality"] == 5


def test_stats(client):
    u = client.post("/user/tg_stats", json={"name": "s"}).json()
    for q in (3, 5, 4):
        client.post(
            "/diary",
            json={"user_id": u["id"], "mood": 4, "energy": 4, "stress": 2, "sleep_quality": q},
        )
    client.post("/focus", json={"user_id": u["id"], "duration_min": 25, "completed": True})
    r = client.get(f"/stats/{u['id']}")
    assert r.status_code == 200
    s = r.json()
    assert s["entries"] == 3
    assert s["avg_sleep_quality_7d"] == 4.0
    assert s["focus_minutes_7d"] == 25


def test_content_articles(client):
    r = client.get("/content/articles")
    assert r.status_code == 200
    arts = r.json()
    assert len(arts) == 10
    one = client.get(f"/content/article/{arts[0]['id']}")
    assert one.status_code == 200
    assert one.json()["title"] == arts[0]["title"]
    assert client.get("/content/article/nope").status_code == 404


def test_apnea_analyze_with_mock_model(client, monkeypatch):
    def fake_predict(path):
        return True, 0.91

    monkeypatch.setattr(apnea_service, "_load_predict", lambda: fake_predict)
    u = client.post("/user/tg_apnea", json={"name": "a"}).json()
    files = {"file": ("rec.wav", io.BytesIO(b"RIFFfake"), "audio/wav")}
    r = client.post("/apnea/analyze", files=files, data={"user_id": str(u["id"]), "mode": "browser"})
    assert r.status_code == 200
    body = r.json()
    assert body["has_apnea"] is True
    assert body["confidence"] == 0.91
    assert body["used_model"] is True
    hist = client.get(f"/apnea/history/{u['id']}").json()
    assert len(hist) == 1


def test_apnea_stub_when_no_model(client, monkeypatch):
    def boom():
        raise ImportError("apnea_model not available")

    monkeypatch.setattr(apnea_service, "_load_predict", boom)
    files = {"file": ("rec.wav", io.BytesIO(b"some-bytes"), "audio/wav")}
    r = client.post("/apnea/analyze", files=files)
    assert r.status_code == 200
    assert r.json()["used_model"] is False


def test_chat_stub_without_key(client, monkeypatch):
    for k in ("LLM_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_API_KEY"):
        monkeypatch.delenv(k, raising=False)
    r = client.post("/chat", json={"message": "привет", "history": []})
    assert r.status_code == 200
    assert "Configure LLM_API_KEY" in r.text


def test_chat_mock_llm(client, monkeypatch):
    import backend.routes.chat as chat_route

    async def fake_stream(message, history):
        for token in ["при", "вет", "!"]:
            yield token

    monkeypatch.setattr(chat_route, "stream_chat", fake_stream)
    r = client.post("/chat", json={"message": "hi", "history": []})
    assert r.status_code == 200
    deltas = []
    for line in r.text.splitlines():
        if line.startswith("data:"):
            obj = json.loads(line[5:].strip())
            if "delta" in obj:
                deltas.append(obj["delta"])
    assert "".join(deltas) == "привет!"


def test_focus_add_and_list(client):
    u = client.post("/user/tg_focus", json={"name": "f"}).json()
    client.post("/focus", json={"user_id": u["id"], "duration_min": 50, "completed": True})
    lst = client.get(f"/focus/{u['id']}").json()
    assert len(lst) == 1
    assert lst[0]["duration_min"] == 50


def test_leaderboard(client):
    u = client.post("/user/tg_lb", json={"name": "lb"}).json()
    client.post(
        "/diary",
        json={"user_id": u["id"], "mood": 5, "energy": 5, "stress": 1, "sleep_quality": 5},
    )
    r = client.get("/leaderboard")
    assert r.status_code == 200
    names = [row["name"] for row in r.json()]
    assert "lb" in names


def test_indices_formulas():
    best = compute_all(
        Onboarding(
            sleep_hours=8,
            sleep_latency_min=0,
            wake_feeling=5,
            bedtime_regularity=5,
            stress_freq=1,
            thoughts_racing=1,
            overload=1,
            focus_difficulty=1,
            distraction=1,
        )
    )
    assert best["sleep_index"] == 100.0
    assert best["stress_index"] == 0.0
    assert best["focus_index"] == 100.0
    worst = compute_all(
        Onboarding(
            sleep_hours=4,
            sleep_latency_min=60,
            wake_feeling=1,
            bedtime_regularity=1,
            stress_freq=5,
            thoughts_racing=5,
            overload=5,
            focus_difficulty=5,
            distraction=5,
        )
    )
    assert worst["sleep_index"] == 0.0
    assert worst["stress_index"] == 100.0
    assert worst["focus_index"] == 0.0


def test_apnea_real_vad_model(client):
    import importlib
    import sys
    import tempfile
    import numpy as np
    import soundfile as sf

    sr = 16000
    np.random.seed(7)
    audio = np.concatenate([
        np.random.randn(sr * 4) * 0.1,
        np.zeros(sr * 15, dtype=np.float32),
        np.random.randn(sr * 4) * 0.1,
    ]).astype(np.float32)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        sf.write(f.name, audio, sr)
        tmp_path = f.name

    sys.modules.pop("apnea_model", None)
    import apnea_model
    importlib.reload(apnea_model)
    has_apnea, conf = apnea_model.predict(tmp_path)

    assert has_apnea is True
    assert conf > 0.0

    with open(tmp_path, "rb") as fh:
        r = client.post(
            "/apnea/analyze",
            files={"file": ("rec.wav", fh, "audio/wav")},
            data={"mode": "browser"},
        )
    assert r.status_code == 200
    body = r.json()
    assert body["has_apnea"] is True
    assert body["used_model"] is True


def test_apnea_browser_webm_decodes(client):
    import importlib
    import subprocess
    import sys
    import tempfile
    import numpy as np
    import pytest
    import soundfile as sf

    sys.modules.pop("apnea_model", None)
    import apnea_model
    importlib.reload(apnea_model)
    ff = apnea_model._ffmpeg_bin()
    if not ff:
        pytest.skip("ffmpeg недоступен")

    sr = 16000
    np.random.seed(11)
    audio = np.concatenate([
        np.random.randn(sr * 4) * 0.2,
        np.zeros(sr * 15, dtype=np.float32),
        np.random.randn(sr * 4) * 0.2,
    ]).astype(np.float32)

    wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    sf.write(wav.name, audio, sr)
    wav.close()
    webm_path = wav.name.replace(".wav", ".webm")
    rc = subprocess.run(
        [ff, "-v", "error", "-y", "-i", wav.name, "-c:a", "libopus", webm_path],
        capture_output=True,
    ).returncode
    if rc != 0:
        pytest.skip("сборка ffmpeg без libopus")

    has_apnea, conf = apnea_model.predict(webm_path)
    assert has_apnea is True
    assert conf > 0.0

    with open(webm_path, "rb") as fh:
        r = client.post(
            "/apnea/analyze",
            files={"file": ("rec.webm", fh, "audio/webm")},
            data={"mode": "browser"},
        )
    assert r.status_code == 200
    body = r.json()
    assert body["has_apnea"] is True
    assert body["used_model"] is True
