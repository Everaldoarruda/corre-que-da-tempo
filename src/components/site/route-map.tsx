"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { animate, svg } from "animejs";
import "leaflet/dist/leaflet.css";
import { ROUTE, START, TURNAROUND } from "@/lib/route";

/**
 * Mapa real (OpenStreetMap via Leaflet) com o trajeto pelas ruas.
 * O traçado é desenhado com svg.createDrawable e o corredor segue a linha
 * com svg.createMotionPath, exatamente como no exemplo da doc do Anime.js.
 */
export function RouteMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!inView || !containerRef.current) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: true,
      });

      // Tiles do OpenStreetMap (escurecidos via CSS no container para seguir o tema)
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const renderer = L.svg({ padding: 1 });

      // Linha de fundo (apagada) + linha que será "desenhada"
      L.polyline(ROUTE, { color: "#ffffff", opacity: 0.15, weight: 10, renderer }).addTo(map);
      const line = L.polyline(ROUTE, {
        color: "#FFD400",
        weight: 6,
        lineCap: "round",
        lineJoin: "round",
        renderer,
      }).addTo(map);

      const pin = (label: string, color: string) =>
        L.divIcon({
          className: "",
          html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-100%)">
              <span style="background:#000;color:#fff;font:700 11px/1 system-ui;padding:4px 6px;border:2px solid ${color};border-radius:6px;white-space:nowrap">${label}</span>
              <span style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #000;margin-top:4px"></span>
            </div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
      L.marker([START.lat, START.lng], { icon: pin("CAMPO DO CAFÉ • início/fim", "#FFD400") }).addTo(map);
      L.marker([TURNAROUND.lat, TURNAROUND.lng], { icon: pin("PRAÇA DA CONVENÇÃO • retorno", "#e5484d") }).addTo(map);

      map.fitBounds(line.getBounds(), { padding: [48, 48] });

      // Elemento SVG do traçado gerado pelo Leaflet
      const path = line.getElement() as SVGPathElement | null;
      if (!path) return;
      const svgRoot = path.ownerSVGElement;
      if (!svgRoot) return;

      // Corredor: círculo dentro do mesmo SVG, para compartilhar o sistema de coordenadas do path
      const ns = "http://www.w3.org/2000/svg";
      const runner = document.createElementNS(ns, "g");
      runner.innerHTML =
        '<circle r="11" fill="#FFD400" stroke="#000" stroke-width="3"/>' +
        '<circle r="4" fill="#000"/>';
      runner.style.opacity = "0";
      path.parentNode?.appendChild(runner);

      const build = () => {
        const run = animate(runner, {
          ease: "linear",
          duration: 9000,
          loop: true,
          opacity: { to: 1, duration: 300 },
          ...svg.createMotionPath(path),
        });
        const draw = animate(svg.createDrawable(path), {
          draw: "0 1",
          ease: "linear",
          duration: 9000,
          loop: true,
        });
        return () => {
          run.cancel();
          draw.cancel();
        };
      };
      let stop = build();

      // Se a tela redimensionar, o Leaflet reprojeta o path: reconstruir a animação
      const onResize = () => {
        stop();
        map.invalidateSize();
        map.fitBounds(line.getBounds(), { padding: [48, 48] });
        stop = build();
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        stop();
        map.remove();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [inView]);

  return (
    <div
      ref={containerRef}
      className="h-[420px] w-full overflow-hidden rounded-xl bg-black md:h-[520px] [&_.leaflet-tile-pane]:[filter:invert(1)_hue-rotate(180deg)_brightness(0.75)_contrast(1.1)_saturate(0.6)] [&_.leaflet-control-attribution]:bg-black/70 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-zinc-400 [&_.leaflet-control-attribution_a]:text-brand"
      role="img"
      aria-label="Mapa real do percurso: Campo do Café até a Praça da Convenção e volta"
    />
  );
}
