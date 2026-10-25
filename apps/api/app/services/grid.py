def generate_demo_grid():
    cells = []
    for y in range(32):
        for x in range(32):
            cx, cy = 15.5, 16.0
            dist = ((x-cx)**2 + (y-cy)**2)**0.5
            if dist > 9.5:
                continue
            if dist > 7.0:
                risk, rig, press = "CAUTION", 0.68, 9.4
            elif dist > 5.0:
                risk, rig, press = "SAFE", 0.74, 7.8
            else:
                risk, rig, press = "SAFE", 0.81, 6.2
            if 14 <= x <= 17 and 9 <= y <= 12:
                risk, rig, press = "DANGER", 0.42, 1.0
            cells.append({"x": x, "y": y, "max_pressure_kPa": press, "rigidity_score": rig, "risk_level": risk})
    return cells
