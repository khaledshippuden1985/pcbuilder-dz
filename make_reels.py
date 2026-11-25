#!/usr/bin/env python3
"""Convert marketing reel images in marketing_assets/reels into 7s 1080x1920 MP4 videos.

Applies a smooth sub-pixel Ken Burns zoom-in (100% -> 108%) at 30 FPS and saves
the resulting H.264 MP4 videos into marketing_assets/videos/.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

try:
    from moviepy import VideoClip
except ImportError:  # Fallback for MoviePy 1.x
    from moviepy.editor import VideoClip  # type: ignore[no-redef]


ROOT_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT_DIR = ROOT_DIR / "marketing_assets" / "reels"
DEFAULT_OUTPUT_DIR = ROOT_DIR / "marketing_assets" / "videos"

TARGET_WIDTH = 1080
TARGET_HEIGHT = 1920
FPS = 30
DURATION_SECONDS = 7.0
ZOOM_START = 1.00
ZOOM_END = 1.08

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}


def prepare_base_image(image_path: Path, width: int, height: int) -> Image.Image:
    """Load an image as RGB and fit it to the exact target 9:16 dimensions."""
    with Image.open(image_path) as img:
        rgb = img.convert("RGB")
        if rgb.size == (width, height):
            return rgb.copy()
        return ImageOps.fit(rgb, (width, height), method=Image.Resampling.LANCZOS)


def create_zoom_clip(
    base_image: Image.Image,
    duration: float = DURATION_SECONDS,
    zoom_start: float = ZOOM_START,
    zoom_end: float = ZOOM_END,
) -> VideoClip:
    """Create a MoviePy VideoClip with a smooth sub-pixel center zoom-in."""
    width, height = base_image.size

    def make_frame(t: float) -> np.ndarray:
        progress = min(max(t / duration, 0.0), 1.0)
        zoom = zoom_start + (zoom_end - zoom_start) * progress
        crop_w = width / zoom
        crop_h = height / zoom
        left = (width - crop_w) * 0.5
        top = (height - crop_h) * 0.5
        right = left + crop_w
        bottom = top + crop_h

        # Use floating-point box coordinates with bicubic resampling to avoid integer jitter.
        frame = base_image.resize(
            (width, height),
            resample=Image.Resampling.BICUBIC,
            box=(left, top, right, bottom),
        )
        return np.asarray(frame)

    return VideoClip(make_frame, duration=duration)


def convert_image_to_reel(
    image_path: Path,
    output_path: Path,
    duration: float = DURATION_SECONDS,
    fps: int = FPS,
    width: int = TARGET_WIDTH,
    height: int = TARGET_HEIGHT,
) -> None:
    """Render a single image into a smooth zoom-in MP4 reel."""
    base_image = prepare_base_image(image_path, width, height)
    clip = create_zoom_clip(base_image, duration=duration)
    try:
        clip.write_videofile(
            str(output_path),
            fps=fps,
            codec="libx264",
            audio=False,
            preset="medium",
            threads=4,
            ffmpeg_params=["-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart"],
            logger=None,
        )
    finally:
        clip.close()


def collect_images(input_dir: Path) -> list[Path]:
    """Return sorted list of supported image files in input_dir."""
    if not input_dir.is_dir():
        raise FileNotFoundError(f"Input directory not found: {input_dir}")
    return sorted(
        p for p in input_dir.iterdir()
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert reel images into 7s 1080x1920 MP4 videos with smooth zoom-in."
    )
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--overwrite", action="store_true", default=True)
    args = parser.parse_args()

    images = collect_images(args.input_dir)
    if not images:
        print(f"No images found in {args.input_dir}")
        return 1

    args.output_dir.mkdir(parents=True, exist_ok=True)
    total = len(images)
    print(
        f"Found {total} images in {args.input_dir}. "
        f"Rendering {DURATION_SECONDS:.0f}s {TARGET_WIDTH}x{TARGET_HEIGHT} @ {FPS}fps MP4s..."
    )

    for idx, image_path in enumerate(images, start=1):
        output_path = args.output_dir / f"{image_path.stem}.mp4"
        if output_path.exists() and not args.overwrite:
            print(f"[{idx}/{total}] Skipping existing {output_path.name}")
            continue
        print(f"[{idx}/{total}] Rendering {image_path.name} -> {output_path.name}...")
        convert_image_to_reel(image_path, output_path)

    print(f"Done! Saved {total} videos to {args.output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
