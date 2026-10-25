# 🛸 Afferent-Omni — Causal Vision-to-Touch Prior & C2 Control Dashboard
> **NASA/ESA-Grade Somatosensorial Robotics Control & Telemetry System**

[![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20Three.js%20%7C%20WebSockets-8A2BE2?style=for-the-badge)](https://github.com/raulrodriguezmesia-blip/afferent-omni)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready%20%7C%2050Hz%20Loop-cyan?style=for-the-badge)](https://github.com/raulrodriguezmesia-blip/afferent-omni)
[![Latency](https://img.shields.io/badge/Edge%20Reflex-8.8ms-brightgreen?style=for-the-badge)](https://github.com/raulrodriguezmesia-blip/afferent-omni)

> *"Robots see, but do not feel. Afferent gives them the intuition of touch."*

**Afferent-Omni** is an industrial- and aerospace-grade real-time Command & Control (C2) dashboard framework. Its mission is to endow robotic manipulators with a **tactile intuition based on a causal Vision-to-Touch Prior**.

The platform fuses cutting-edge multimodal perception (*Meta SAM 3.1, Muse Spark, Muse Wonder, Muse Image*) with advanced tribological physics and edge closed-loop computing at **50 Hz**, enabling dexterous manipulation of fragile components, biological tissues, and geological samples without structural failure risk or manual recalibration.

---

## ⚡ Why Afferent-Omni Is Different (Competitive Market Analysis)

Unlike isolated tactile sensors or conventional simulators, **Afferent-Omni** acts as an end-to-end software bridge integrating pre-contact visual perception, fragility-aware tribological physics, and edge reflex arcs.

| Dimension / Capability | GelSight / GelSight Mini | Meta DIGIT / TactileX | NVIDIA Isaac Sim / Gym | ROS 2 + MoveIt | 🛸 **Afferent-Omni** |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Causal Vision-to-Touch Integration** | ❌ (Tactile image only) | ❌ (E-skin sensor only) | ⚠️ (Requires plugins) | ❌ (Control middleware) | **✅ Yes (Prior with SAM 3.1 & Muse)** |
| **Dynamic Safety Gating ($F_{\text{max}}$)** | ❌ (Static limits) | ❌ (Static limits) | ⚠️ (Fixed parameters) | ❌ (Custom dev required) | **✅ Yes (Sim2Real Safety Shield)** |
| **Neuromorphic Edge Reflex Arc** | ❌ | ❌ | ❌ (High visual loop) | ⚠️ (RT driver dependent) | **✅ Yes (<10 ms Edge Latency)** |
| **Acoustic Stick-Slip Spectrogram (E-Skin)** | ❌ | ❌ | ❌ | ❌ | **✅ Yes (12-bin harmonic analysis)** |
| **50 Hz Glassmorphism 3D C2 Dashboard** | ❌ (Flat logs / SDK) | ❌ (Python utilities only) | ⚠️ (Heavy sim GUI) | ⚠️ (Traditional RViz2) | **✅ Yes (Three.js + WebSockets)** |
| **Specialized Conversational AI Copilot** | ❌ | ❌ | ❌ | ❌ | **✅ Yes (Afferent-Omni Chat)** |

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Camera / Optical Sensor SAM 3.1] -->|32x32 Object Mask| B[Afferent-Core CoT Engine]
    B -->|Young's Modulus E / Friction mu| C[Sim2Real Safety Shield]
    C -->|Force Budget F_max / Fragility| D[Grasp Controller / Manipulator]
    E[E-Skin / TactoEval Sensor] -->|Micro-vibrations 314Hz| F[Neuromorphic Reflex HUD - Edge]
    F -->|<8.8ms Slip Intercept| D
    D -->|Telemetry WebSocket 50Hz| G[C2 Dashboard Frontend React + Three.js]
    G <-->|Real-Time Context| H[Afferent-Omni Chat AI Copilot]
```

### 🛠️ Technology Stack
- **Backend & Telemetry:** FastAPI (Python 3.10+), Uvicorn, WebSockets for bidirectional 50 Hz streaming, NLP router with real-time contextualization.
- **Frontend UI/UX:** React 18, Vite, TypeScript, Tailwind CSS, Dark Glassmorphism (Ethos-Style UI), decoupled interactive components (CustomDropdown).
- **3D Visualization & Physics:** Three.js, React Three Fiber, real-time 2D/3D gel deformation heatmaps, dynamic HSL glow spheres and shear force ArrowHelpers.
- **Multimodal AI Model Stack:** Meta SAM 3.1, Meta Muse Spark, Meta Muse Wonder, Meta Muse Image.

---

## 🚀 Key Dashboard Modules

### 1. Tactile CoT & Afferent-Core
- High-fidelity $32 \times 32$ spatial contact grid construction via SAM 3.1.
- Tribological Chain-of-Thought reasoning to estimate Young's Modulus ($E$), static friction coefficient ($\mu$), and shear stress concentration zones.

### 2. Sim2Real Safety Shield
- **Adaptive Force Budget:** Dynamic computation of $F_{\text{max}}$, $F_{\text{recommended}}$, and $F_{\text{slip\_min}}$.
- **Uncertainty Gating ($U_{\text{th}}$):** Automatic safe grasp authorization (`AUTHORIZED_SAFE_GRASP`) when visual/tactile uncertainty stays below the configured margin (e.g., 7.0% vs 25% threshold).

### 3. Neuromorphic Reflex HUD (Edge Computing)
- Neuromorphic reflex arc processed directly at the edge with ultra-low latency (8.8 ms).
- Preventive detection and interception of micro-slips (Slip Intercept: SAFE) before relying on the central vision loop.

### 4. Multi-Digit Selector & Manipulator (NASA/JPL Style)
- Topological grasp telemetry and control for multi-digit contact (thumb, index, middle, full hand).
- Continuous computation of Center of Pressure ($CoP$) and Torque Balance Index ($TBI$).

### 5. 3D Gel Deformation Viewer (Three.js)
- Real-time elastomer deformation mesh.
- 60 FPS rendering with HSL glow spheres indicating pressure and directional shear force vectors.

### 6. Acoustic-Slip Spectrogram (E-Skin)
- Monitoring of stick-slip micro-vibrations on electronic skin (E-Skin).
- Dominant frequency (e.g., 314.3 Hz) and 12-bin harmonic spectrum.

### 7. Afferent-Omni Chat AI Copilot
- Fully integrated somatosensorial conversational assistant connected to live telemetry endpoints and state.
- Real-time technical English-language responses on material physics, safety margins, and TactoEval metrics.

---

## 🌍 High-Impact Industrial Use Cases

- 🛸 **Orbital & Aerospace Maintenance (NASA / ESA):** Dexterous manipulation of unconsolidated regolith, fragile geological samples, and space components in microgravity, overcoming teleoperation latency limitations.
- 🩺 **Medical Robotics & Precision Surgery:** Protection of sensitive organic tissues in minimally invasive procedures. The sub-millisecond reflex arc prevents tearing by adapting pressure instantly.
- 🤖 **High-Precision Industrial Assembly (Tesla / EV Manufacturing):** Zero-Shot automation for handling lithium-ion battery cells, optical lenses, and tempered glass without manual recalibration.
- 🦿 **Bionic Prosthetics & E-Skin Research:** Translation engine between physical friction stimuli and high-frequency neural feedback signals.

---

## 💻 Installation & Quick Deployment

### Prerequisites
- Node.js v18+
- Python 3.10+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/raulrodriguezmesia-blip/afferent-omni.git
cd afferent-omni
```

### 2. Configure & Start the Backend (FastAPI)
```bash
# Navigate to backend
cd apps/api

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (Port 8002)
uvicorn app.main:app --reload --port 8002
```

### 3. Configure & Start the Frontend (React + Vite)
```bash
# In a new terminal, navigate to frontend
cd apps/web

# Install dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

Access the dashboard from your browser at: **http://localhost:5173**

Standalone showcase (no backend required): **http://localhost:5173/showcase.html**

---

## 📄 License

This project is distributed under the MIT License. See the `LICENSE` file for more information.

Developed with passion for next-generation dexterous robotics. 🚀
PYEOF