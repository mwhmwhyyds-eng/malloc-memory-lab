"""Add licensed boundary music and a closing credit to the approved silent-bed master.

Usage: python add_music.py INPUT.mp4 OUTPUT.mp4 --ffmpeg FFMPEG
Requires public/music/easy-lemon-60.mp3. The original video and voice remain the master.
"""
from pathlib import Path
import argparse, subprocess, tempfile, shutil

def main():
    ap=argparse.ArgumentParser();ap.add_argument('input',type=Path);ap.add_argument('output',type=Path);ap.add_argument('--ffmpeg',default='ffmpeg');ap.add_argument('--font',type=Path,default=Path('C:/Windows/Fonts/consola.ttf'));args=ap.parse_args()
    music=Path(__file__).resolve().parents[1]/'public/music/easy-lemon-60.mp3'
    # No music during the mechanism/code chapters. Fade both short excerpts gently.
    graph=(
      '[1:a]asplit=2[m1][m2];'
      '[m1]atrim=0:12.2,asetpts=PTS-STARTPTS,loudnorm=I=-30:TP=-4:LRA=7,afade=t=in:d=1.2,afade=t=out:st=10.2:d=2[mstart];'
      '[m2]atrim=45:58.533333,asetpts=PTS-STARTPTS,loudnorm=I=-30:TP=-4:LRA=7,afade=t=in:d=2,afade=t=out:st=11.333333:d=2.2,adelay=142000|142000[mend];'
      '[0:a][mstart][mend]amix=inputs=3:duration=first:normalize=0,alimiter=limit=0.95:level=false[a]'
    )
    credit='Music: Easy Lemon (60 second) - Kevin MacLeod | incompetech.com | CC BY 4.0 (edited)'
    with tempfile.TemporaryDirectory(prefix='malloc-mix-') as tmp:
        folder=Path(tmp);shutil.copy2(args.font,folder/'credit-font.ttf');(folder/'credit.txt').write_text(credit,encoding='utf-8')
        vf="drawtext=fontfile=credit-font.ttf:textfile=credit.txt:fontsize=20:fontcolor=0x63788e:x=128:y=h-37:enable='gte(t,150)'"
        cmd=[args.ffmpeg,'-hide_banner','-nostdin','-i',str(args.input.resolve()),'-i',str(music),'-filter_complex',graph,'-vf',vf,'-map','0:v:0','-map','[a]','-c:v','libx264','-crf','18','-preset','fast','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart','-metadata','comment=Music: Easy Lemon (60 second) by Kevin MacLeod (https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200077), CC BY 4.0 https://creativecommons.org/licenses/by/4.0/ ; excerpts, fades and volume adjusted.','-n',str(args.output.resolve())]
        subprocess.run(cmd,cwd=folder,check=True)

if __name__=='__main__':main()
