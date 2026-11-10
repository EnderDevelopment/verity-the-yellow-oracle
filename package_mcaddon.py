import binascii
import math
import pathlib
import struct
import zlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent


def make_texture(path):
    width = height = 64
    rows = []
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            dx = x - 31.5
            dy = y - 31.5
            distance = math.sqrt(dx * dx + dy * dy)
            if distance > 25:
                color = (32, 37, 46, 255)
            elif distance > 23:
                color = (143, 101, 0, 255)
            elif (x < 31 and y < 29 and (x - 24) ** 2 + (y - 20) ** 2 < 70):
                color = (255, 229, 106, 255)
            else:
                shade = max(0.0, min(1.0, (x + y - 10) / 110))
                color = (round(255 - 36 * shade), round(229 - 36 * shade), round(106 - 16 * shade), 255)
            row.extend(color)
        rows.append(bytes(row))

    def chunk(kind, data):
        checksum = binascii.crc32(kind + data) & 0xffffffff
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", checksum)

    image = b"\x89PNG\r\n\x1a\n"
    image += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    image += chunk(b"IDAT", zlib.compress(b"".join(rows), 9))
    image += chunk(b"IEND", b"")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(image)


def add_pack(archive, folder, pack_name):
    source = ROOT / folder
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as pack:
        for file in sorted(source.rglob("*")):
            if file.is_file():
                pack.write(file, file.relative_to(source).as_posix())


def main():
    texture = ROOT / "verity_rp/textures/entity/verity.png"
    make_texture(texture)
    output = ROOT / "verity.mcaddon"
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as addon:
        for folder, pack_name in (("verity_rp", "verity_rp.mcpack"), ("verity_bp", "verity_bp.mcpack")):
            temp = ROOT / pack_name
            add_pack(temp, folder, pack_name)
            addon.write(temp, pack_name)
            temp.unlink()
    print(f"Created {output}")


if __name__ == "__main__":
    main()
