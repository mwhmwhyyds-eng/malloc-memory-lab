"""Generate Chinese narration with boundary-timed subtitles and measured durations."""
import asyncio
import json
import math
import os
import subprocess
from pathlib import Path
import edge_tts
import imageio_ffmpeg
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parent.parent
VOICE = 'zh-CN-XiaoxiaoNeural'
FPS = 30
LEAD = 0.6
TAIL = 0.7
OVERLAP = 15
semaphore = asyncio.Semaphore(2)

async def generate(scene):
    async with semaphore:
        folder = ROOT / 'public/voice'
        folder.mkdir(exist_ok=True, parents=True)
        raw = folder / (scene['id'] + '-raw.mp3')
        cues_path = folder / (scene['id'] + '-boundaries.json')
        if raw.exists() and cues_path.exists():
            cues = json.loads(cues_path.read_text(encoding='utf-8'))
        else:
            cues = []
            stream = edge_tts.Communicate(scene['text'], VOICE, rate='-6%', volume='+0%')
            temporary = raw.with_suffix('.partial')
            with temporary.open('wb') as audio:
                async for chunk in stream.stream():
                    if chunk['type'] == 'audio':
                        audio.write(chunk['data'])
                    elif chunk['type'] in ('WordBoundary', 'SentenceBoundary'):
                        cues.append({'start':chunk['offset']/10_000_000,
                                     'end':(chunk['offset']+chunk['duration'])/10_000_000,
                                     'text':chunk['text']})
            assert temporary.stat().st_size > 1000 and cues
            temporary.replace(raw)
            cues_path.write_text(json.dumps(cues, ensure_ascii=False, indent=2),encoding='utf-8')
        duration = MP3(raw).info.length
        normalized = folder / (scene['id'] + '.wav')
        if not normalized.exists() or normalized.stat().st_mtime < raw.stat().st_mtime:
            subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-hide_banner', '-loglevel', 'error',
                '-y', '-i', str(raw), '-af', 'loudnorm=I=-16:LRA=7:TP=-1.5',
                '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', str(normalized)], check=True)
        for i, cue in enumerate(cues):
            # Boundary metadata can overlap slightly; show only one caption at a time.
            if i+1 < len(cues): cue['end'] = min(cue['end'], cues[i+1]['start'])
            cue['start'] += LEAD
            cue['end'] = min(cue['end'], duration) + LEAD
            cue.update(startMs=round(cue['start']*1000), endMs=round(cue['end']*1000), timestampMs=None, confidence=None)
        result = {**scene, 'audio':'voice/'+scene['id']+'.wav', 'audioDuration':round(duration,3),
                  'durationInFrames':math.ceil((LEAD+duration+TAIL)*FPS), 'captions':cues}
        print(scene['id'], round(duration,2), 'seconds', len(cues), 'captions', flush=True)
        return result

def timestamp(seconds):
    ms = round(seconds*1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'

async def main():
    scenes = json.loads((ROOT/'narration.json').read_text(encoding='utf-8'))
    timeline = await asyncio.gather(*(generate(s) for s in scenes))
    total = sum(s['durationInFrames'] for s in timeline)-OVERLAP*(len(timeline)-1)
    (ROOT/'src/timeline.json').write_text(json.dumps({'fps':FPS,'overlap':OVERLAP,
         'durationInFrames':total,'voice':VOICE,'scenes':timeline},ensure_ascii=False,indent=2),encoding='utf-8')
    offset=0
    subtitles=[]
    for scene in timeline:
        for cue in scene['captions']:
            subtitles.append(f'{len(subtitles)+1}\n{timestamp(offset+cue["start"])} --> {timestamp(offset+cue["end"])}\n{cue["text"]}\n')
        offset+=(scene['durationInFrames']-OVERLAP)/FPS
    (ROOT/'public/malloc-zh.srt').write_text('\n'.join(subtitles),encoding='utf-8')
    print('TOTAL',total,'frames',round(total/FPS,2),'seconds',flush=True)

if __name__ == '__main__': asyncio.run(main())
