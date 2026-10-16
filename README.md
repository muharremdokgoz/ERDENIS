# ERDENIS — Autonomous UAV Defense & Evasion Decision-Making Framework

> **Senior Capstone Graduation Design Project**  
> **Official Project Web Page:** [https://erdenis.com](https://erdenis.com) | [GitHub Pages Showcase](https://muharremdokgoz.github.io/erdenis/)

An advanced reinforcement learning decision-making framework engineered for military unmanned aerial vehicles (UAVs) to autonomously detect, evaluate, and execute high-agility evasive maneuvers against dynamic aerial threats (Surface-to-Air Missiles, adversarial interceptor drones) within physical flight envelope limits.

---

## 👥 Academic Supervision & Engineering Team

### Academic Advisor & Supervisor
- **Dr. Gökçe Nur Yılmaz** — Project Advisor & Academic Mentor

### Core Engineering Team
- **Muharrem Dokgöz** ([@muharremdokgoz](https://github.com/muharremdokgoz)) — Deep Reinforcement Learning & Tactical Policy Optimization
- **Ayberk Neşeli** ([@ayberkneseli](https://github.com/ayberkneseli)) — UAV Dynamics, Aerodynamic Modeling & Kinematic Envelope Protection
- **Zeynep Sinem Anlar** ([@zsinemanlar](https://github.com/zsinemanlar)) — AirSim / Gazebo High-Fidelity Simulation & Scenario Generation
- **Ata Türkdoğan** — Comparative Benchmarking, APF/PID Baselines & Autopilot Integration

---

## 🎯 Project Overview & Objectives

- **The Problem:** Modern combat environments feature supersonic missile locks and adversarial drone swarms where human teleoperation latency (150ms–500ms) or electronic jamming results in fatal collisions. Rigid rule-based algorithms (APF/PID) frequently fall into local minima or exceed structural G-limits.
- **The Solution:** A Deep Reinforcement Learning (PPO/SAC) continuous-action decision agent trained in **Microsoft AirSim** and **Open Robotics Gazebo**, optimizing survival probability while preserving vehicle structural limits (-3.0G ≤ $n_z$ ≤ +9.0G).
- **Key Benchmarks:**
  - Avoidance Success in Multi-Threat Saturation: **91.4%** (vs 53.0% APF baseline)
  - Control Decision Latency: **< 82 ms** (vs 240 ms PID baseline)
  - Flight Envelope Violations: **0% (100% compliance)**

---

## 🚀 Live Interactive Radar Simulator

The project includes an interactive 2D Tactical Radar HUD simulation engine built directly in the browser using HTML5 Canvas & Web Audio API:
- **Threat Vector Spawning:** Surface-to-Air Missile (SAM), Adversarial Drone, and Pincer Saturation.
- **Mode Toggle:** Deep RL Policy (Active Countermeasures & Teğetsel Evasion) vs Conventional Artificial Potential Field.
- **Real-Time Telemetry:** Closing velocity ($V_c$), threat bearing, instantaneous G-force, and envelope integrity.

---

## 💻 Local Execution

To run the project webpage locally:

```bash
# Clone the repository
git clone https://github.com/muharremdokgoz/erdenis.git

# Navigate to project folder
cd erdenis

# Start local server (using Python)
python -m http.server 8099
```

Open [http://localhost:8099](http://localhost:8099) in your browser.

---

## 📄 License & Academic Note
Developed for the Senior Design Capstone Project. All rights reserved.
