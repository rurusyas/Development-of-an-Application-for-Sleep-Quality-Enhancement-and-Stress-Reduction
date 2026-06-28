import hashlib


def _load_predict():
    from apnea_model import predict
    return predict


def _stub(audio_path):
    try:
        with open(audio_path, "rb") as f:
            data = f.read()
    except OSError:
        data = audio_path.encode("utf-8")
    h = hashlib.sha256(data).digest()
    conf = h[0] / 255.0
    return conf > 0.5, round(conf, 4)


def run_apnea(audio_path):
    try:
        predict = _load_predict()
    except Exception:
        has, conf = _stub(audio_path)
        return bool(has), float(conf), False
    has, conf = predict(audio_path)
    return bool(has), float(conf), True
