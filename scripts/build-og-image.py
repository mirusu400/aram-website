"""Build deterministic Open Graph cards from ARAM's real screenshots."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
WIDTH = 1200
HEIGHT = 630


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    filename = "malgunbd.ttf" if bold else "malgun.ttf"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / filename), size)


def background() -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT))
    pixels = image.load()
    for y in range(HEIGHT):
        for x in range(WIDTH):
            green = int(16 + 10 * (x / WIDTH) + 5 * (1 - y / HEIGHT))
            blue = int(16 + 7 * (x / WIDTH))
            pixels[x, y] = (15, green, blue)

    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((700, -240, 1370, 480), fill=(0, 217, 146, 72))
    glow_draw.ellipse((-260, 420, 500, 980), fill=(0, 132, 96, 30))
    glow = glow.filter(ImageFilter.GaussianBlur(100))
    image = Image.alpha_composite(image.convert("RGBA"), glow)

    grid = Image.new("RGBA", image.size, (0, 0, 0, 0))
    grid_draw = ImageDraw.Draw(grid)
    for x in range(0, WIDTH, 40):
        grid_draw.line((x, 0, x, HEIGHT), fill=(255, 255, 255, 7), width=1)
    for y in range(0, HEIGHT, 40):
        grid_draw.line((0, y, WIDTH, y), fill=(255, 255, 255, 7), width=1)
    return Image.alpha_composite(image, grid)


def phone_card(screenshot_path: Path, angle: float) -> Image.Image:
    card = Image.new("RGBA", (220, 356), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)
    draw.rounded_rectangle((4, 4, 216, 352), radius=27, fill=(27, 28, 29, 255), outline=(70, 78, 75, 255), width=3)
    draw.rounded_rectangle((18, 24, 202, 314), radius=8, fill=(0, 0, 0, 255), outline=(0, 217, 146, 150), width=2)
    draw.rounded_rectangle((91, 12, 129, 17), radius=3, fill=(0, 217, 146, 255))
    draw.ellipse((106, 329, 114, 337), fill=(96, 105, 101, 255))

    screenshot = Image.open(screenshot_path).convert("RGBA")
    fitted = ImageOps.contain(screenshot, (178, 284), method=Image.Resampling.NEAREST)
    x = 110 - fitted.width // 2
    y = 169 - fitted.height // 2
    card.alpha_composite(fitted, (x, y))
    return card.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)


def build(language: str, output: Path) -> None:
    image = background()
    draw = ImageDraw.Draw(image)

    icon = Image.open(ASSETS / "icon.png").convert("RGBA")
    icon = icon.resize((82, 82), Image.Resampling.NEAREST)
    image.alpha_composite(icon, (76, 72))
    draw.text((178, 81), "ARAM", font=font(66, True), fill=(255, 255, 255, 255))
    draw.text((80, 187), "ARCHIVED RUNTIME FOR ARM MOBILES", font=font(19, True), fill=(0, 217, 146, 255))

    if language == "ko":
        headline = "한국 피처폰·WIPI\n게임을 다시 실행하다"
        supporting = "Windows · macOS · Linux · Android · Web"
    else:
        headline = "Korean feature-phone\nsoftware, alive again"
        supporting = "WIPI emulator · Windows · macOS · Linux · Android · Web"

    draw.multiline_text((78, 232), headline, font=font(44, True), fill=(245, 247, 246, 255), spacing=12)
    draw.rounded_rectangle((77, 398, 620, 446), radius=8, fill=(23, 30, 28, 235), outline=(58, 75, 69, 255), width=2)
    draw.text((96, 410), supporting, font=font(19), fill=(204, 214, 210, 255))
    draw.text((80, 527), "aram.mir.sh", font=font(24, True), fill=(0, 217, 146, 255))

    phones = [
        (ASSETS / "shots" / "shot-02.png", -7, (690, 186)),
        (ASSETS / "shots" / "shot-01.png", 2, (835, 92)),
        (ASSETS / "shots" / "shot-04.png", 8, (990, 176)),
    ]
    for screenshot, angle, position in phones:
        card = phone_card(screenshot, angle)
        image.alpha_composite(card, position)

    output.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(output, "PNG", optimize=True)


if __name__ == "__main__":
    build("ko", ASSETS / "og-ko.png")
    build("en", ASSETS / "og-en.png")
    print("Built assets/og-ko.png and assets/og-en.png")
