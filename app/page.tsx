"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const mixColor = (intensity) => {
  const colors = [
    [254, 243, 199], // pale amber
    [217, 119, 6], // amber
    [120, 53, 15], // dark caramel
    [28, 9, 0], // burnt brown / black
  ];

  const scaled = intensity * (colors.length - 1);
  const index = Math.floor(scaled);
  const next = Math.min(index + 1, colors.length - 1);
  const progress = scaled - index;

  const rgb = colors[index].map((channel, i) =>
    Math.round(channel + (colors[next][i] - channel) * progress)
  );

  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
};

export default function MaillardPredictor() {
  const [ph, setPh] = useState(8.2);
  const [time, setTime] = useState(72);
  const [sugar, setSugar] = useState("Fructosa");
  const [amino, setAmino] = useState("Garum");

  const prediction = useMemo(() => {
    const timeFactor = 1 - Math.exp(-(time - 12) / 72);
    const alkalinityBoost = ph > 8 ? 1 + ((ph - 8) / 2) * 0.75 : 0.72 + (ph - 6) * 0.14;
    const globalIntensity = clamp((0.32 + timeFactor * 0.78) * alkalinityBoost, 0, 1.35);

    const sugarProfile =
      sugar === "Fructosa"
        ? { umami: 2, toasted: 10, caramel: 34, meaty: 4, sweet: 18 }
        : { umami: 4, toasted: 20, caramel: 18, meaty: 5, sweet: 24 };

    const aminoProfile =
      amino === "Garum"
        ? { umami: 42, toasted: 8, caramel: 4, meaty: 24, sweet: 2 }
        : amino === "Extracto de Levadura"
        ? { umami: 30, toasted: 18, caramel: 8, meaty: 18, sweet: 4 }
        : { umami: 16, toasted: 15, caramel: 16, meaty: 10, sweet: 20 };

    const base = {
      umami: 18,
      toasted: 20,
      caramel: 18,
      meaty: 14,
      sweet: 14,
    };

    const values = {
      umami: clamp((base.umami + sugarProfile.umami + aminoProfile.umami) * globalIntensity),
      toasted: clamp((base.toasted + sugarProfile.toasted + aminoProfile.toasted) * globalIntensity),
      caramel: clamp((base.caramel + sugarProfile.caramel + aminoProfile.caramel) * globalIntensity),
      meaty: clamp((base.meaty + sugarProfile.meaty + aminoProfile.meaty) * globalIntensity),
      sweet: clamp((base.sweet + sugarProfile.sweet + aminoProfile.sweet) * globalIntensity),
    };

    const reactionIntensity = clamp(
      (values.umami + values.toasted + values.caramel + values.meaty + values.sweet) / 500,
      0,
      1
    );

    return {
      values,
      reactionIntensity,
      color: mixColor(reactionIntensity),
      label:
        reactionIntensity > 0.82
          ? "Reaccion avanzada"
          : reactionIntensity > 0.58
          ? "Dorado activo"
          : reactionIntensity > 0.32
          ? "Desarrollo inicial"
          : "Reposo tenue",
    };
  }, [ph, time, sugar, amino]);

  const radarData = [
    { flavor: "Umami", value: prediction.values.umami },
    { flavor: "Tostado", value: prediction.values.toasted },
    { flavor: "Caramelo", value: prediction.values.caramel },
    { flavor: "Carnoso", value: prediction.values.meaty },
    { flavor: "Dulce", value: prediction.values.sweet },
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-stone-100 font-sans">
      <section className="min-h-screen w-full px-5 py-6 md:px-10 md:py-10">
        <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
          <aside className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-xl">
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-amber-600">
                Beta Lab
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">
                Maillard Predictor
              </h1>
              <p className="mt-3 text-sm leading-6 text-stone-400">
                Simulador experimental de intensidad aromática para sistemas
                alcalinos, azúcares reductores y fuentes de aminoácidos.
              </p>
            </div>

            <div className="space-y-7">
              <ControlBlock
                label="Nivel de pH"
                value={ph.toFixed(1)}
                hint="Alcalinidad"
              >
                <input
                  type="range"
                  min="6"
                  max="10"
                  step="0.1"
                  value={ph}
                  onChange={(event) => setPh(Number(event.target.value))}
                  className="w-full accent-amber-600"
                />
                <div className="mt-2 flex justify-between text-xs text-stone-500">
                  <span>6.0</span>
                  <span>10.0</span>
                </div>
              </ControlBlock>

              <ControlBlock
                label="Tiempo de Reposo"
                value={`${time} h`}
                hint="Maduración"
              >
                <input
                  type="range"
                  min="12"
                  max="168"
                  step="12"
                  value={time}
                  onChange={(event) => setTime(Number(event.target.value))}
                  className="w-full accent-amber-600"
                />
                <div className="mt-2 flex justify-between text-xs text-stone-500">
                  <span>12 h</span>
                  <span>168 h</span>
                </div>
              </ControlBlock>

              <ControlBlock label="Azúcar" value={sugar} hint="Reductor">
                <select
                  value={sugar}
                  onChange={(event) => setSugar(event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-600"
                >
                  <option>Fructosa</option>
                  <option>Glucosa</option>
                </select>
              </ControlBlock>

              <ControlBlock label="Aminoácido" value={amino} hint="Fuente nitrogenada">
                <select
                  value={amino}
                  onChange={(event) => setAmino(event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-3 text-sm text-stone-100 outline-none transition focus:border-amber-600"
                >
                  <option>Garum</option>
                  <option>Extracto de Levadura</option>
                  <option>Proteína de Suero</option>
                </select>
              </ControlBlock>
            </div>
          </aside>

          <section className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl md:p-7">
            <div className="flex flex-col gap-6 lg:h-full">
              <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-amber-600">
                    Reaction Output
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    Perfil sensorial predictivo
                  </h2>
                </div>

                <div className="rounded-md border border-amber-600/30 bg-amber-600/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                    Estado
                  </p>
                  <p className="mt-1 text-sm font-medium text-amber-500">
                    {prediction.label}
                  </p>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 items-center gap-6 xl:grid-cols-[1fr_280px]">
                <div className="h-[420px] min-h-[360px] rounded-lg border border-white/10 bg-black/30 p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="72%">
                      <PolarGrid stroke="rgba(255,255,255,0.14)" />
                      <PolarAngleAxis
                        dataKey="flavor"
                        tick={{
                          fill: "#d6d3d1",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{
                          fill: "rgba(214,211,209,0.55)",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickCount={5}
                      />
                      <Radar
                        name="Intensidad"
                        dataKey="value"
                        stroke="#D97706"
                        fill="#D97706"
                        fillOpacity={0.34}
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#fbbf24",
                          stroke: "#0A0A0A",
                          strokeWidth: 2,
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-black/30 p-6">
                  <motion.div
                    animate={{
                      backgroundColor: prediction.color,
                      scale: 0.92 + prediction.reactionIntensity * 0.22,
                      boxShadow: `0 0 ${
                        24 + prediction.reactionIntensity * 70
                      }px rgba(217, 119, 6, ${0.18 + prediction.reactionIntensity * 0.38})`,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 90,
                      damping: 18,
                    }}
                    className="h-44 w-44 rounded-full border border-white/20"
                  />

                  <div className="mt-8 w-full">
                    <div className="mb-2 flex justify-between text-xs text-stone-400">
                      <span>Intensidad Maillard</span>
                      <span>{Math.round(prediction.reactionIntensity * 100)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        animate={{ width: `${prediction.reactionIntensity * 100}%` }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="h-full rounded-full bg-amber-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {radarData.map((item) => (
                  <div
                    key={item.flavor}
                    className="rounded-md border border-white/10 bg-white/[0.04] p-3"
                  >
                    <p className="text-xs text-stone-500">{item.flavor}</p>
                    <p className="mt-1 text-xl font-semibold text-stone-100">
                      {Math.round(item.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function ControlBlock({ label, value, hint, children }) {
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-200">{label}</p>
          <p className="mt-1 text-xs text-stone-500">{hint}</p>
        </div>
        <span className="rounded-md border border-amber-600/30 bg-amber-600/10 px-2.5 py-1 text-xs font-semibold text-amber-500">
          {value}
        </span>
      </div>
      {children}
    </div>
  );
}
