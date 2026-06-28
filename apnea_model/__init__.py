import numpy as np

WINDOW_MS = 100
APNEA_PAUSE_SEC = 10.0
ENERGY_RATIO = 0.05
MIN_AUDIO_SEC = 5.0
FFMPEG_SR = 16000


def _ffmpeg_bin():
    import shutil
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


def _decode_with_ffmpeg(path):
    import subprocess
    ff = _ffmpeg_bin()
    if not ff:
        return None, None
    cmd = [ff, "-v", "error", "-i", path, "-ac", "1", "-ar", str(FFMPEG_SR), "-f", "f32le", "-"]
    try:
        proc = subprocess.run(cmd, capture_output=True, timeout=60)
    except Exception:
        return None, None
    if proc.returncode != 0 or not proc.stdout:
        return None, None
    arr = np.frombuffer(proc.stdout, dtype="<f4").astype(np.float32)
    if arr.size == 0:
        return None, None
    return arr, FFMPEG_SR


def _read_audio(path):
    try:
        import soundfile as sf
        data, sr = sf.read(path, always_2d=False)
        if data.ndim > 1:
            data = data.mean(axis=1)
        return data.astype(np.float32), sr
    except Exception:
        pass
    try:
        import wave
        with wave.open(path, "rb") as w:
            sr = w.getframerate()
            n = w.getnframes()
            raw = w.readframes(n)
            ch = w.getnchannels()
            sw = w.getsampwidth()
        if sw == 2:
            arr = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
        elif sw == 1:
            arr = (np.frombuffer(raw, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
        elif sw == 4:
            arr = np.frombuffer(raw, dtype=np.int32).astype(np.float32) / 2147483648.0
        else:
            arr = None
        if arr is not None:
            if ch > 1:
                arr = arr.reshape(-1, ch).mean(axis=1)
            return arr, sr
    except Exception:
        pass
    return _decode_with_ffmpeg(path)


def predict(audio_path: str):
    audio, sr = _read_audio(audio_path)
    if audio is None or sr is None or len(audio) == 0:
        return False, 0.0
    duration = len(audio) / sr
    if duration < MIN_AUDIO_SEC:
        return False, 0.0

    win = max(1, int(sr * WINDOW_MS / 1000))
    n_full = (len(audio) // win) * win
    if n_full == 0:
        return False, 0.0
    frames = audio[:n_full].reshape(-1, win)
    rms = np.sqrt(np.mean(frames * frames, axis=1) + 1e-12)

    ref = np.percentile(rms, 90)
    if ref <= 1e-5:
        return False, 0.0
    threshold = ENERGY_RATIO * ref
    silent = rms < threshold

    frames_per_sec = sr / win
    needed = int(APNEA_PAUSE_SEC * frames_per_sec)

    events = 0
    run = 0
    for s in silent:
        if s:
            run += 1
            if run == needed:
                events += 1
        else:
            run = 0

    pause_ratio = float(silent.mean())
    has_apnea = events >= 1 or pause_ratio > 0.5
    events_per_hour = events * 3600.0 / duration
    confidence = max(0.0, min(1.0, events_per_hour / 15.0))
    if has_apnea and confidence < 0.15:
        confidence = 0.15 + pause_ratio * 0.5
        confidence = min(1.0, confidence)
    return bool(has_apnea), round(float(confidence), 4)
