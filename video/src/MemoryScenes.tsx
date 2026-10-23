import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const color = {
  ink: "#192941",
  teal: "#008f84",
  purple: "#6954d5",
  orange: "#c65d36",
  muted: "#63788e",
  line: "#cfdee6",
};
export const mono = 'Consolas,"Microsoft YaHei",monospace';
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const ease = Easing.bezier(0.2, 0.75, 0.2, 1);
export const ramp = (t: number, start: number, end: number) =>
  interpolate(t, [start, end], [0, 1], { ...clamp, easing: ease });
type Children = React.PropsWithChildren;

export const Label: React.FC<
  Children & {
    x: number;
    y: number;
    size?: number;
    width?: number;
    tone?: string;
    style?: React.CSSProperties;
  }
> = ({ children, x, y, size = 34, width, tone = color.ink, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      fontSize: size,
      lineHeight: 1.5,
      color: tone,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Reveal: React.FC<
  Children & { at?: number; style?: React.CSSProperties }
> = ({ children, at = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = ramp(f / fps, at, at + 0.55);
  return (
    <div style={{ opacity: p, translate: `0 ${(1 - p) * 16}px`, ...style }}>
      {children}
    </div>
  );
};

const Pane: React.FC<
  Children & {
    x: number;
    y: number;
    w: number;
    h: number;
    tone?: string;
    style?: React.CSSProperties;
  }
> = ({ children, x, y, w, h, tone = color.line, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      border: `1.5px solid ${tone}`,
      borderRadius: 24,
      background:
        "linear-gradient(145deg,rgba(255,255,255,.96),rgba(230,243,247,.75))",
      boxShadow:
        "0 12px 35px rgba(36,81,106,.045),inset 0 2px 0 rgba(255,255,255,.95)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge: React.FC<
  Children & {
    x: number;
    y: number;
    tone?: string;
    size?: number;
    style?: React.CSSProperties;
  }
> = ({ children, x, y, tone = color.teal, size = 28, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      fontSize: size,
      lineHeight: 1.5,
      color: tone,
      border: `1px solid ${tone}38`,
      background: `${tone}0b`,
      borderRadius: 12,
      padding: "9px 18px",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

type Point = [number, number];
const Arrow: React.FC<{
  points: Point[];
  tone?: string;
  opacity?: number;
  progress?: number;
  dashed?: boolean;
}> = ({ points, tone = color.teal, opacity = 1, progress, dashed = false }) => {
  const a = points[points.length - 2],
    b = points[points.length - 1];
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = [
    b,
    [b[0] - 15 * Math.cos(angle - 0.45), b[1] - 15 * Math.sin(angle - 0.45)],
    [b[0] - 15 * Math.cos(angle + 0.45), b[1] - 15 * Math.sin(angle + 0.45)],
  ];
  const lengths = points
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let distance = (progress ?? 0) * lengths.reduce((s, n) => s + n, 0);
  let dot = points[0];
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i]) {
      const p = distance / lengths[i];
      dot = [
        points[i][0] + (points[i + 1][0] - points[i][0]) * p,
        points[i][1] + (points[i + 1][1] - points[i][1]) * p,
      ];
      break;
    }
    distance -= lengths[i];
  }
  return (
    <svg
      width={1920}
      height={1080}
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <polyline
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={tone}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeDasharray={dashed ? "9 9" : undefined}
      />
      <polygon points={head.map((p) => p.join(",")).join(" ")} fill={tone} />
      {progress !== undefined && progress > 0 && progress < 1 && (
        <>
          <circle cx={dot[0]} cy={dot[1]} r={17} fill={`${tone}18`} />
          <circle cx={dot[0]} cy={dot[1]} r={7} fill={tone} />
        </>
      )}
    </svg>
  );
};

/** One allocation, divided into four int elements. No physical-address claim. */
const Block: React.FC<{
  values: (number | string)[];
  x?: number;
  y?: number;
  w?: number;
  active?: number;
  pointer?: boolean;
  released?: boolean;
  stamp?: string;
  sizeLabel?: boolean;
  progress?: number;
}> = ({
  values,
  x = 1020,
  y = 470,
  w = 720,
  active = -1,
  pointer = true,
  released = false,
  stamp,
  sizeLabel = true,
  progress = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      opacity: progress,
      translate: `0 ${(1 - progress) * 18}px`,
    }}
  >
    {pointer && (
      <>
        <div
          style={{
            position: "absolute",
            top: -100,
            left: 5,
            fontSize: 34,
            color: released ? color.orange : color.purple,
            fontFamily: mono,
          }}
        >
          {released ? "p" : "p"}
        </div>
        <svg
          width={80}
          height={90}
          style={{
            position: "absolute",
            left: 2,
            top: -58,
            overflow: "visible",
          }}
        >
          <path
            d={released ? "M18 0V15 M18 38V53" : "M18 0V53"}
            stroke={released ? color.orange : color.purple}
            strokeWidth={3}
          />
          {!released && (
            <path
              d="M10 43L18 55L26 43"
              fill="none"
              stroke={color.purple}
              strokeWidth={3}
            />
          )}
          {released && (
            <>
              <path
                d="M9 19L26 34M26 19L9 34"
                stroke={color.orange}
                strokeWidth={3}
              />
            </>
          )}
        </svg>
        <div
          style={{
            position: "absolute",
            left: 56,
            top: -95,
            fontSize: 26,
            color: released ? color.orange : color.muted,
          }}
        >
          {released ? "不会自动变为 NULL" : "指向分配空间的起始位置"}
        </div>
      </>
    )}
    <div
      style={{
        display: "flex",
        position: "relative",
        height: 144,
        border: `2px solid ${released ? "#a1b3bf" : "#37a99e"}`,
        borderRadius: 19,
        background: released
          ? "linear-gradient(155deg,#f1f5f7,#e2eaf0)"
          : "linear-gradient(155deg,#f8ffff 0%,#e1f7f3 42%,#bce8e5 100%)",
        boxShadow:
          "inset 0 4px 0 rgba(255,255,255,.95),0 16px 26px rgba(0,120,112,.07)",
        overflow: "hidden",
      }}
    >
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight:
              i < 3
                ? `1px solid ${released ? "#b9c9d1" : "#69bdb5"}`
                : undefined,
            fontFamily: mono,
            fontSize: 58,
            fontWeight: 600,
            background: i === active ? "rgba(255,202,160,.42)" : undefined,
            color: i === active ? color.orange : color.ink,
          }}
        >
          {released ? "" : v}
          {i === active && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 5,
                background: color.orange,
              }}
            />
          )}
        </div>
      ))}
      {released && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 37,
            color: color.muted,
          }}
        >
          原对象生命周期已结束
        </div>
      )}
    </div>
    <div style={{ display: "flex", marginTop: 16 }}>
      {values.map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: mono,
            fontSize: 27,
            color: color.muted,
          }}
        >
          {released ? "" : "p[" + i + "]"}
        </div>
      ))}
    </div>
    {sizeLabel && (
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 216,
          textAlign: "center",
          color: released ? color.muted : color.teal,
          fontSize: 29,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: -14,
            height: 10,
            border: `solid ${released ? "#afbec7" : "#79bfb9"}`,
            borderWidth: "0 1.5px 1.5px",
          }}
        />
        {stamp ?? (
          <>
            一次申请 · <span style={{ fontFamily: mono }}>4 × sizeof(int)</span>{" "}
            字节
          </>
        )}
      </div>
    )}
  </div>
);

export const BackgroundScene: React.FC<{ second: number; third: number }> = ({
  second,
  third,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const lengths = [3, 7, 5];
  const phase =
    t < second
      ? Math.floor(t / 1.8) % 3
      : t < third
        ? Math.floor((t - second) / 2.5) % 3
        : 1;
  const n = lengths[phase];
  const dynamic = t >= third;
  const showFixed = t >= second && !dynamic;
  const filled = dynamic ? n : Math.min(n, 5);
  const at = dynamic ? third : showFixed ? second : 0;
  return (
    <>
      <Label x={128} y={280} size={32} tone={color.muted}>
        输入长度在运行时变化，所需空间也随之变化。
      </Label>
      <Pane x={128} y={367} w={470} h={362}>
        <Label x={32} y={27} size={27} tone={color.muted}>
          嵌入式设备 · 接收数据
        </Label>
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 97,
            width: 112,
            height: 112,
            borderRadius: 20,
            background: "linear-gradient(140deg,#e6fffa,#93d4cf)",
            border: "2px solid #6ab7b1",
            display: "grid",
            placeItems: "center",
            color: color.teal,
            fontFamily: mono,
            fontSize: 31,
            fontWeight: 700,
          }}
        >
          DATA
        </div>
        <Label x={172} y={110} size={46} tone={color.teal}>
          {n} 个元素
        </Label>
        <Label x={34} y={260} size={28} tone={color.muted}>
          示例长度：3 → 7 → 5
        </Label>
      </Pane>
      <Arrow
        points={[
          [630, 535],
          [860, 535],
        ]}
        progress={(t % 1.8) / 1.8}
      />
      <Pane
        x={900}
        y={367}
        w={890}
        h={362}
        tone={dynamic ? "#75c7bd" : color.line}
      >
        <Label x={34} y={28} size={31} tone={dynamic ? color.teal : color.ink}>
          {dynamic
            ? "动态分配：按当前需要申请"
            : showFixed
              ? "固定数组：容量预先确定"
              : "程序需要保存收到的数据"}
        </Label>
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 116,
            display: "flex",
            gap: 10,
          }}
        >
          {Array.from({ length: 7 }, (_, i) => {
            const visible = i < (dynamic ? n : 5);
            const used = i < filled;
            const p = ramp(t, at + i * 0.12, at + i * 0.12 + 0.45);
            return (
              <div
                key={i}
                style={{
                  width: 99,
                  height: 94,
                  borderRadius: 12,
                  border: `2px solid ${visible ? (used ? "#42aa9d" : "#b8c7d0") : "#c65d3655"}`,
                  background: visible
                    ? used
                      ? "linear-gradient(145deg,#e6faf7,#a8dcd5)"
                      : "#edf1f4"
                    : "transparent",
                  opacity: visible ? p : showFixed && n > 5 ? 0.7 : 0,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 30,
                  color: visible ? color.teal : color.orange,
                }}
              >
                {i < n ? i + 1 : ""}
              </div>
            );
          })}
        </div>
        <Label
          x={34}
          y={265}
          size={30}
          tone={dynamic ? color.teal : showFixed ? color.orange : color.muted}
        >
          {dynamic
            ? "运行时，按需申请。"
            : showFixed
              ? n > 5
                ? "容量为 5：当前输入放不下"
                : "容量为 5：部分空间闲置"
              : "长度变化，需要灵活的空间"}
        </Label>
      </Pane>
      <Label x={128} y={762} size={25} tone={color.muted}>
        概念示例：比较容量选择，不代表具体设备的内存测量。
      </Label>
    </>
  );
};

export const InterfaceScene: React.FC<{ second: number; third: number }> = ({
  second,
  third,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  return (
    <>
      <Label x={128} y={277} size={32} tone={color.muted}>
        从一个请求开始：申请空间，获得访问它的指针。
      </Label>
      <Pane x={128} y={364} w={795} h={160}>
        <Label
          x={30}
          y={30}
          size={39}
          tone={color.teal}
          style={{ fontFamily: mono }}
        >
          void *malloc(size_t size);
        </Label>
        <Label x={30} y={94} size={27} tone={color.muted}>
          size 的单位是字节
        </Label>
      </Pane>
      <Reveal at={second}>
        <Badge x={128} y={574}>
          成功 → 返回指针
        </Badge>
        <Badge x={492} y={574} tone={color.orange}>
          失败 → NULL
        </Badge>
      </Reveal>
      <Reveal at={third}>
        <Label x={128} y={681} size={37} tone={color.purple}>
          拿到空间后，先初始化再读取。
        </Label>
      </Reveal>
      <Block
        values={["?", "?", "?", "?"]}
        progress={ramp(t, second, second + 0.65)}
      />
      <Reveal at={third}>
        <Badge x={1194} y={755} tone={color.purple}>
          ? 表示内容尚未初始化
        </Badge>
      </Reveal>
    </>
  );
};

export const AllocatorScene: React.FC<{ second: number; third: number }> = ({
  second,
  third,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const request = ramp(t, second + 0.2, second + 1.5);
  const found = t >= second + 2.1;
  const returned = t >= second + 4.2;
  const expansion = t >= second + 7.2;
  const expandProgress = ramp(t, second + 7.5, second + 9.2);
  return (
    <>
      <Label x={128} y={277} size={32} tone={color.muted}>
        C 库管理分配；Linux 内核在需要时提供更多空间。
      </Label>
      <Pane x={128} y={370} w={460} h={412}>
        <Label x={30} y={27} size={26} tone={color.purple}>
          本次请求的示意路径
        </Label>
        {[
          ["01", "发出申请", t >= 0.7],
          ["02", "复用可用块", found],
          ["03", "返回起始指针", returned],
        ].map(([n, text, active], i) => (
          <div
            key={String(n)}
            style={{
              position: "absolute",
              top: 95 + i * 82,
              left: 30,
              right: 25,
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: active ? 1 : 0.35,
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 27,
                color: color.teal,
                border: `1px solid ${color.teal}45`,
                borderRadius: 10,
                padding: "7px 11px",
              }}
            >
              {n}
            </span>
            <span style={{ fontSize: 32 }}>{text}</span>
          </div>
        ))}
        <Label x={30} y={353} size={26} tone={color.muted}>
          分配路径的简化示意
        </Label>
      </Pane>
      <Pane x={1010} y={338} w={500} h={80} tone="#b3a9e2">
        <Label x={23} y={14} size={32} tone={color.purple}>
          应用程序 · malloc(size)
        </Label>
      </Pane>
      <Arrow
        points={[
          [1110, 422],
          [1110, 472],
        ]}
        progress={request}
        tone={color.purple}
      />
      <Reveal at={second + 0.3}>
        <Label x={700} y={431} size={26} tone={color.purple}>
          请求所需字节数
        </Label>
      </Reveal>
      <Pane x={683} y={475} w={1107} h={192} tone="#85c6bd">
        <Label x={25} y={14} size={27} tone={color.teal}>
          C 库分配器 · 已管理的空间
        </Label>
        {[
          { x: 25, w: 190, text: "已占用", free: false },
          {
            x: 229,
            w: 280,
            text: returned ? "本次分配" : "可用块",
            free: true,
          },
          { x: 523, w: 205, text: "已占用", free: false },
          { x: 742, w: 335, text: "可用块", free: true },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x,
              top: 70,
              width: b.w,
              height: 91,
              borderRadius: 12,
              border: `2px solid ${i === 1 && found ? color.teal : b.free ? "#86bfb8" : "#c9d4dc"}`,
              background:
                i === 1 && found
                  ? "linear-gradient(130deg,#e1f9f3,#a7ddd3)"
                  : b.free
                    ? "#f4fcfa"
                    : "#e7edf2",
              boxShadow:
                i === 1 && found ? "0 0 0 5px rgba(0,143,132,.08)" : undefined,
              display: "grid",
              placeItems: "center",
              fontSize: 29,
              color: b.free ? color.teal : color.muted,
            }}
          >
            {b.text}
          </div>
        ))}
        {!returned && request > 0 && (
          <div
            style={{
              position: "absolute",
              top: 59,
              left: interpolate(
                t,
                [second + 1.5, second + 2.2],
                [34, 229],
                clamp,
              ),
              width: 280,
              height: 113,
              border: `2px solid ${color.orange}`,
              borderRadius: 15,
              opacity: ramp(t, second + 1.3, second + 1.6),
            }}
          />
        )}
      </Pane>
      <Reveal at={second + 4.2}>
        <Arrow
          points={[
            [1170, 475],
            [1170, 445],
            [1455, 445],
            [1455, 418],
          ]}
          tone={color.teal}
          progress={ramp(t, second + 4.2, second + 5.1)}
        />
        <Label x={1540} y={372} size={27} tone={color.teal}>
          返回 p
        </Label>
      </Reveal>
      <Reveal at={second + 7.2}>
        <Arrow
          points={[
            [1635, 667],
            [1635, 770],
            [1513, 770],
          ]}
          tone={color.orange}
          dashed
          progress={expandProgress}
        />
        <Pane x={1010} y={737} w={500} h={66} tone="#d6bba5">
          <Label x={23} y={9} size={29} tone={color.orange}>
            Linux 内核 · brk / mmap
          </Label>
        </Pane>
        <Label x={686} y={703} width={300} size={25} tone={color.orange}>
          另一种情况：
          <br />
          需更多空间时才可能扩展
        </Label>
      </Reveal>
      <Reveal at={third}>
        <Badge x={128} y={795} size={27} tone={color.orange}>
          一次 malloc ≠ 一次系统调用
        </Badge>
      </Reveal>
      {expansion && (
        <Label x={1320} y={699} size={22} tone={color.muted}>
          可选扩展路径
        </Label>
      )}
    </>
  );
};

export const UsageScene: React.FC<{ second: number; third: number }> = ({
  second,
  third,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const writeStart = second + 0.8;
  const writeEnd = third - 0.6;
  const written =
    t < writeStart
      ? 0
      : Math.min(
          4,
          Math.floor(((t - writeStart) / (writeEnd - writeStart)) * 4) + 1,
        );
  const reading = t >= third + 0.55;
  const checked = t >= second + 0.35;
  const active = reading ? 4 : written > 0 ? 3 : checked ? 1 : 0;
  const code = [
    "int *p = malloc(4 * sizeof *p);",
    "if (p == NULL) return EXIT_FAILURE;",
    "for (int i = 0; i < 4; ++i)",
    "    p[i] = i + 1;",
    'printf("%d\\n", p[3]);',
    "free(p);",
  ];
  const writeIndex = Math.max(0, written - 1);
  const localWrite = (t - writeStart) % ((writeEnd - writeStart) / 4);
  return (
    <>
      <Label x={128} y={277} size={32} tone={color.muted}>
        同一块连续空间：先确认申请成功，再写入和读取。
      </Label>
      <Pane x={128} y={363} w={828} h={427}>
        {code.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 22 + i * 57,
              left: 20,
              right: 20,
              padding: "6px 12px",
              fontFamily: mono,
              fontSize: 31,
              lineHeight: "40px",
              whiteSpace: "pre",
              borderLeft: `3px solid ${i === active ? color.teal : "transparent"}`,
              background: i === active ? "rgba(0,143,132,.08)" : undefined,
              color: i === active ? color.teal : color.ink,
              opacity: i === 5 ? 0.4 : 1,
              fontWeight: i === active ? 650 : 400,
            }}
          >
            {s}
          </div>
        ))}
        <Label x={34} y={377} size={23} tone={color.muted}>
          C 主线片段；完整程序需包含头文件与 main。
        </Label>
      </Pane>
      <Block
        values={[0, 1, 2, 3].map((i) => (i < written ? i + 1 : "?"))}
        active={reading ? 3 : written > 0 ? written - 1 : -1}
      />
      {written > 0 && !reading && (
        <div
          style={{
            position: "absolute",
            left: 1020 + (writeIndex + 0.5) * 180 - 23,
            top: 435 - ramp(localWrite, 0, 0.4) * 32,
            opacity: 1 - ramp(localWrite, 0.35, 0.7),
            fontSize: 32,
            color: color.teal,
            fontFamily: mono,
          }}
        >
          +{written}
        </div>
      )}
      <Badge x={1042} y={756} tone={reading ? color.orange : color.teal}>
        {reading
          ? "p[3] → 第四个元素 → 4"
          : written === 4
            ? "初始化完成，可以在范围内读取"
            : checked
              ? `返回值已检查 · 已写入 ${written} 个元素`
              : "先检查 p 是否为 NULL"}
      </Badge>
    </>
  );
};

export const ReleaseScene: React.FC<{ second: number; third: number }> = ({
  second,
  third,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const released = t >= 2.6;
  return (
    <>
      <Label x={128} y={277} size={32} tone={color.muted}>
        释放结束的是对象的生命周期；不保证立即归还操作系统。
      </Label>
      <Pane x={128} y={364} w={795} h={426}>
        <Label
          x={32}
          y={31}
          size={69}
          tone={color.purple}
          style={{ fontFamily: mono }}
        >
          free(p);
        </Label>
        <Reveal at={second}>
          <Label x={32} y={151} size={36} tone={color.orange}>
            原对象不能再访问
            <br />
            同一块空间不能重复释放
          </Label>
        </Reveal>
        <Reveal at={third}>
          <Label x={32} y={307} size={29} tone={color.muted}>
            不保证清零，也不保留可读取的数据。
          </Label>
        </Reveal>
      </Pane>
      <Block
        values={[1, 2, 3, 4]}
        released={released}
        stamp={released ? "这块空间可供后续分配复用" : "使用结束，准备释放"}
      />
      <Reveal at={third}>
        <Badge x={1087} y={755} tone={color.teal}>
          free 不等于清零或销毁物理内存
        </Badge>
      </Reveal>
      {released && (
        <div
          style={{
            position: "absolute",
            left: 1736,
            top: 470,
            width: 5,
            height: 144,
            background: color.teal,
            opacity:
              0.5 +
              0.5 * Math.sin((Math.min(1, (t - 2.6) / 1.5) * Math.PI) / 2),
          }}
        />
      )}
    </>
  );
};

export const BoundariesScene: React.FC<{ second: number; third: number }> = ({
  second,
  third,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const phase = t < second ? 0 : t < third ? 1 : 2;
  if (phase === 0) {
    const beyond = t > 3.1;
    const leak = t > 4.8;
    return (
      <>
        <Label x={128} y={277} size={32} tone={color.muted}>
          空间有边界，分配大小与指针的管理同样重要。
        </Label>
        <Pane x={128} y={366} w={735} h={423}>
          <Label x={32} y={26} size={27} tone={color.purple}>
            大小计算
          </Label>
          <Label x={32} y={84} size={39} style={{ fontFamily: mono }}>
            n × sizeof *p
          </Label>
          <Label x={32} y={148} size={28} tone={color.orange}>
            先防止乘法溢出，再调用 malloc。
          </Label>
          <div
            style={{
              position: "absolute",
              left: 32,
              right: 32,
              top: 218,
              height: 1,
              background: color.line,
            }}
          />
          <Label x={32} y={246} size={27} tone={color.purple}>
            生命周期
          </Label>
          <Label
            x={32}
            y={298}
            size={32}
            tone={leak ? color.orange : color.ink}
          >
            {leak
              ? "丢失最后一个可用指针 → 泄漏风险"
              : "及时释放仍然需要你管理"}
          </Label>
        </Pane>
        <Block
          values={[1, 2, 3, 4]}
          x={950}
          y={470}
          w={620}
          active={-1}
          sizeLabel={false}
          pointer={!leak}
        />
        {leak && (
          <Label x={950} y={370} size={29} tone={color.orange}>
            p 丢失，空间仍被占用
          </Label>
        )}
        <div
          style={{
            position: "absolute",
            left: 1600,
            top: 470,
            width: 155,
            height: 144,
            border: `2px dashed ${color.orange}`,
            borderRadius: 17,
            display: "grid",
            placeItems: "center",
            fontSize: 46,
            fontFamily: mono,
            color: color.orange,
            opacity: ramp(t, 2.8, 3.2),
          }}
        >
          p[4]
        </div>
        <Label x={950} y={669} size={31} tone={color.teal}>
          合法下标：0 ～ 3
        </Label>
        {beyond && (
          <Badge x={1600} y={655} tone={color.orange}>
            越界
          </Badge>
        )}
        <Label x={950} y={756} size={26} tone={color.muted}>
          虚线格只表示越界位置，不属于已申请空间。
        </Label>
      </>
    );
  }
  if (phase === 1) {
    const zero = t >= second + 3.5;
    return (
      <>
        <Label x={128} y={277} size={32} tone={color.muted}>
          相关接口各有用途；malloc 本身不初始化内容。
        </Label>
        <Pane x={128} y={370} w={795} h={417}>
          <Label
            x={32}
            y={33}
            size={44}
            tone={color.teal}
            style={{ fontFamily: mono }}
          >
            realloc
          </Label>
          <Label x={32} y={102} size={32}>
            调整已有块大小；返回地址可能改变。
          </Label>
          <div
            style={{
              position: "absolute",
              left: 32,
              right: 32,
              top: 191,
              height: 1,
              background: color.line,
            }}
          />
          <Label
            x={32}
            y={227}
            size={44}
            tone={color.purple}
            style={{ fontFamily: mono }}
          >
            calloc
          </Label>
          <Label x={32} y={299} size={32}>
            分配空间，并将其中的字节置零。
          </Label>
        </Pane>
        <Block
          values={zero ? [0, 0, 0, 0] : ["?", "?", "?", "?"]}
          pointer={false}
        />
        <Badge x={1094} y={370} tone={zero ? color.purple : color.teal}>
          {zero ? "calloc：按字节清零" : "malloc：内容未初始化"}
        </Badge>
        <Label x={1050} y={756} size={27} tone={color.muted}>
          此处分别示意两种接口的初始化语义。
        </Label>
      </>
    );
  }
  const progress = ramp(t, third + 0.6, third + 2.2);
  return (
    <>
      <Label x={128} y={277} size={32} tone={color.muted}>
        嵌入式系统还需要结合资源和时延要求选择分配策略。
      </Label>
      <Pane x={128} y={370} w={795} h={417}>
        <Label x={32} y={31} size={28} tone={color.purple}>
          内存预算 · 概念示意
        </Label>
        <div
          style={{
            position: "absolute",
            left: 33,
            right: 33,
            top: 108,
            height: 66,
            border: `1px solid ${color.line}`,
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            background: "#eff4f7",
          }}
        >
          <div
            style={{
              width: `${56 * progress}%`,
              background: "linear-gradient(90deg,#84cfc2,#00988b)",
            }}
          />
          <div style={{ width: `${24 * progress}%`, background: "#d3ccee" }} />
        </div>
        <Label x={32} y={203} size={27} tone={color.teal}>
          已用空间
        </Label>
        <Label x={254} y={203} size={27} tone={color.purple}>
          预留余量
        </Label>
        <Label x={32} y={290} size={34}>
          控制总量，为运行变化留出余地。
        </Label>
      </Pane>
      <Pane x={987} y={370} w={803} h={417}>
        <Label x={32} y={31} size={28} tone={color.purple}>
          关键路径 · 时延要求
        </Label>
        <svg
          width={730}
          height={146}
          style={{ position: "absolute", left: 32, top: 99 }}
        >
          <path d="M0 120H730" stroke={color.line} strokeWidth={2} />
          <path
            d="M10 108H150V50H205V108H360V25H410V108H570V76H630V108H720"
            stroke={color.teal}
            strokeWidth={4}
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress}
          />
        </svg>
        <Label x={32} y={290} size={34}>
          有严格时限时，评估动态分配开销。
        </Label>
      </Pane>
      <Label x={128} y={805} size={23} tone={color.muted}>
        预算条和波形为设计示意，不是本项目测量结果。
      </Label>
    </>
  );
};
