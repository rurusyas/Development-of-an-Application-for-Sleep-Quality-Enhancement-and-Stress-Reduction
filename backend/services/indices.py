def _clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def _to_1(value, vmin, vmax):
    if vmax == vmin:
        return 0.0
    return _clamp((value - vmin) / (vmax - vmin))


def compute_sleep_index(sleep_hours, sleep_latency_min, wake_feeling, bedtime_regularity):
    hours_score = _to_1(sleep_hours, 4.0, 8.0)
    latency_score = _clamp(1.0 - sleep_latency_min / 60.0)
    wake_score = _to_1(wake_feeling, 1, 5)
    reg_score = _to_1(bedtime_regularity, 1, 5)
    raw = 0.4 * hours_score + 0.2 * latency_score + 0.2 * wake_score + 0.2 * reg_score
    return round(100.0 * raw, 1)


def compute_stress_index(stress_freq, thoughts_racing, overload):
    parts = [_to_1(stress_freq, 1, 5), _to_1(thoughts_racing, 1, 5), _to_1(overload, 1, 5)]
    raw = sum(parts) / len(parts)
    return round(100.0 * raw, 1)


def compute_focus_index(focus_difficulty, distraction):
    parts = [1.0 - _to_1(focus_difficulty, 1, 5), 1.0 - _to_1(distraction, 1, 5)]
    raw = sum(parts) / len(parts)
    return round(100.0 * raw, 1)


def compute_all(ob):
    return {
        "sleep_index": compute_sleep_index(
            ob.sleep_hours, ob.sleep_latency_min, ob.wake_feeling, ob.bedtime_regularity
        ),
        "stress_index": compute_stress_index(ob.stress_freq, ob.thoughts_racing, ob.overload),
        "focus_index": compute_focus_index(ob.focus_difficulty, ob.distraction),
    }
