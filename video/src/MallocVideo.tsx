import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import timeline from "./timeline.json";
import {
  BackgroundScene,
  InterfaceScene,
  AllocatorScene,
  UsageScene,
  ReleaseScene,
  BoundariesScene,
} from "./MemoryScenes";
type Scene = (typeof timeline.scenes)[number];
const C = {
  ink: "#192941",
  teal: "#008f84",
  purple: "#6954d5",
  orange: "#c65d36",
  muted: "#63788e",
};
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const mono = 'Consolas,"Microsoft YaHei",monospace';
function formatCaption(text: string) {
  const weights = Array.from(text).map((c) =>
    c.charCodeAt(0) <= 127 ? 0.52 : 1,
  );
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 38) return text;
  let running = 0,
    best = Infinity,
    split = 0;
  for (let i = 1; i < text.length; i++) {
    running += weights[i - 1];
    if (/[A-Za-z0-9]/.test(text[i - 1]) && /[A-Za-z0-9]/.test(text[i]))
      continue;
    const cost =
      Math.abs(running - total / 2) -
      (/[，；。！？]/.test(text[i - 1]) ? 2 : 0);
    if (cost < best) {
      best = cost;
      split = i;
    }
  }
  return text.slice(0, split) + "\n" + text.slice(split);
}
const Reveal: React.FC<
  React.PropsWithChildren<{ delay?: number; style?: React.CSSProperties }>
> = ({ children, delay = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(f, [delay * fps, (delay + 0.65) * fps], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.2, 0.75, 0.2, 1),
  });
  return (
    <div style={{ opacity: p, translate: `0 ${(1 - p) * 22}px`, ...style }}>
      {children}
    </div>
  );
};
const Art: React.FC<{ name: string; duration: number; opacity?: number }> = ({
  name,
  duration,
  opacity = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <Img
      src={staticFile(`images/${name}.png`)}
      style={{
        position: "absolute",
        left: 248,
        top: 45,
        width: 1672,
        height: 941,
        objectFit: "contain",
        opacity,
        scale: interpolate(f, [0, duration], [0.975, 1], clamp),
        translate: `${interpolate(f, [0, duration], [-12, 0], clamp)}px ${Math.sin(f / 140) * 4}px`,
        maskImage:
          "linear-gradient(to right,transparent,black 10%,black 97%,transparent)",
      }}
    />
  );
};
const Title: React.FC<React.PropsWithChildren<{ width?: number }>> = ({
  children,
  width = 1630,
}) => (
  <Reveal
    style={{
      position: "absolute",
      left: 128,
      top: 160,
      width,
      fontSize: 70,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: -2,
    }}
  >
    {children}
  </Reveal>
);
const Text: React.FC<
  React.PropsWithChildren<{
    x?: number;
    y: number;
    delay?: number;
    color?: string;
    size?: number;
    width?: number;
  }>
> = ({
  children,
  x = 132,
  y,
  delay = 0,
  color = C.ink,
  size = 42,
  width = 1600,
}) => (
  <Reveal
    delay={delay}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      fontSize: size,
      lineHeight: 1.65,
      color,
    }}
  >
    {children}
  </Reveal>
);
const SceneView: React.FC<{ scene: Scene }> = ({ scene: s }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const caption = s.captions.find((c) => t >= c.start && t < c.end);
  const second = s.captions[1]?.start ?? 5;
  const third = s.captions[2]?.start ?? 10;
  let body: React.ReactNode;
  switch (s.id) {
    case "opening":
      body = (
        <>
          <Art name="hero" duration={s.durationInFrames} />
          <Text y={222} size={168} color={C.teal}>
            malloc
          </Text>
          <Text y={448} size={78}>
            一块内存的旅程
          </Text>
          <Text y={602} size={40} color={C.muted} delay={0.6}>
            从申请到释放，理解 malloc
          </Text>
        </>
      );
      break;
    case "background":
      body = (
        <>
          <Title>数据在变，空间按需申请</Title>
          <BackgroundScene second={second} third={third} />
        </>
      );
      break;
    case "history":
      body = (
        <>
          <Art name="hero" duration={s.durationInFrames} opacity={0.08} />
          <Title>标准接口，与分配器实现</Title>
          <Text y={280} size={32} color={C.muted}>
            接口回答“怎样调用”，实现决定“怎样管理空间”。
          </Text>
          <Reveal
            style={{
              position: "absolute",
              left: 128,
              top: 380,
              width: 1662,
              height: 170,
              border: "1px solid #d6d0ee",
              borderRadius: 22,
              background: "rgba(250,249,255,.9)",
            }}
          >
            <Text x={32} y={22} size={29} color={C.purple}>
              标准化节点
            </Text>
            <Text x={32} y={67} size={66} color={C.purple}>
              C89
            </Text>
            <Text x={410} y={67} size={57}>
              <span style={{ fontFamily: mono }}>malloc / free</span>
            </Text>
            <Text x={1030} y={87} size={29} color={C.muted}>
              规定接口与使用约定
            </Text>
          </Reveal>
          <Text y={600} size={28} color={C.teal} delay={third}>
            glibc 分配器的实现来源
          </Text>
          {["dlmalloc", "ptmalloc", "glibc 中的 malloc"].map((label, i) => (
            <Reveal
              key={label}
              delay={third + i * 0.55}
              style={{
                position: "absolute",
                left: 128 + i * 570,
                top: 663,
                width: 520,
                height: 104,
                border: "1px solid #9dcfc6",
                borderRadius: 17,
                display: "grid",
                placeItems: "center",
                background: "rgba(239,251,248,.92)",
                fontFamily: mono,
                fontSize: i === 2 ? 35 : 45,
                color: C.teal,
              }}
            >
              {label}
            </Reveal>
          ))}
          <Text x={665} y={676} size={39} color={C.teal} delay={third + 0.5}>
            →
          </Text>
          <Text x={1235} y={676} size={39} color={C.teal} delay={third + 1}>
            →
          </Text>
        </>
      );
      break;
    case "interface":
      body = (
        <>
          <Title>申请的是字节，返回的是指针</Title>
          <InterfaceScene second={second} third={third} />
        </>
      );
      break;
    case "allocator":
      body = (
        <>
          <Title>分配器如何响应一次申请</Title>
          <AllocatorScene second={second} third={third} />
        </>
      );
      break;
    case "usage":
      body = (
        <>
          <Title>先检查，再写入，最后读取</Title>
          <UsageScene second={second} third={third} />
        </>
      );
      break;
    case "release":
      body = (
        <>
          <Title>free：结束使用，让空间可被复用</Title>
          <ReleaseScene second={second} third={third} />
        </>
      );
      break;
    case "boundaries":
      body = (
        <>
          <Title>把安全边界放进代码</Title>
          <BoundariesScene second={second} third={third} />
        </>
      );
      break;
    default:
      body = (
        <>
          <Art name="hero" duration={s.durationInFrames} opacity={0.65} />
          <Title width={880}>
            理解空间
            <br />
            也理解生命周期
          </Title>
          <Text y={465} size={62} color={C.teal}>
            <span>
              <span style={{ fontFamily: mono }}>malloc</span> → 使用 →{" "}
              <span style={{ fontFamily: mono }}>free</span>
            </span>
          </Text>
          <Text y={607} size={40} color={C.muted} delay={second}>
            先检查，再初始化，使用结束后释放。
          </Text>
          <Text y={758} size={28} color={C.muted}>
            何伟明 · 24电信4班
          </Text>
        </>
      );
  }
  const note =
    s.id === "allocator"
      ? "进程虚拟内存 · 分配路径简化示意"
      : s.id === "interface" || s.id === "usage"
        ? "一块连续空间 · 每格为一个 int 元素"
        : s.id === "release"
          ? "释放不保证清零或保留原数据"
          : "";
  return (
    <AbsoluteFill
      style={{
        fontFamily: '"Microsoft YaHei","Noto Sans CJK SC",sans-serif',
        color: C.ink,
        background:
          "radial-gradient(ellipse at 95% 10%,#e6f3f7 0%,#f7f9fc 57%)",
      }}
    >
      {body}
      <div
        style={{
          position: "absolute",
          left: 128,
          top: 66,
          fontSize: 27,
          color: C.muted,
          letterSpacing: 2,
        }}
      >
        嵌入式 Linux 系统{" "}
        <span style={{ margin: "0 22px", color: "#afbdca" }}>/</span>
        <span style={{ color: C.teal }}>{s.chapter}</span>
      </div>
      {note && (
        <div
          style={{
            position: "absolute",
            right: 128,
            top: 75,
            fontSize: 24,
            color: C.muted,
          }}
        >
          {note}
        </div>
      )}
      <Audio
        src={staticFile(s.audio)}
        from={0.6 * fps}
        volume={10 ** (-2.78 / 20)}
      />
      {caption && (
        <div
          style={{
            position: "absolute",
            left: 160,
            right: 160,
            bottom: 105,
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 38,
              lineHeight: 1.6,
              fontWeight: 500,
              whiteSpace: "pre-line",
              maxWidth: 1600,
              padding: "12px 24px",
              background: "rgba(247,249,252,.94)",
              borderRadius: 4,
            }}
          >
            {formatCaption(caption.text)}
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 58,
          left: 128,
          right: 128,
          height: 2,
          background: "#dce5eb",
        }}
      >
        <div
          style={{
            height: 2,
            width: `${Math.min(100, (f / s.durationInFrames) * 100)}%`,
            background: C.teal,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
export const MallocVideo: React.FC = () => (
  <TransitionSeries>
    {timeline.scenes.flatMap((scene, i) => [
      ...(i > 0
        ? [
            <TransitionSeries.Transition
              key={`transition-${scene.id}`}
              presentation={fade()}
              timing={linearTiming({ durationInFrames: 15 })}
            />,
          ]
        : []),
      <TransitionSeries.Sequence
        key={scene.id}
        name={scene.title}
        durationInFrames={scene.durationInFrames}
      >
        <SceneView scene={scene} />
      </TransitionSeries.Sequence>,
    ])}
  </TransitionSeries>
);
