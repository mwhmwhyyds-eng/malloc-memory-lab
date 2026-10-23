import { Composition } from "remotion";
import { MallocVideo } from "./MallocVideo";
import timeline from "./timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MallocExplainer"
        component={MallocVideo}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={timeline.durationInFrames}
      />
    </>
  );
};
