"""Upload only public app assets. Explicit FTPS; no third-party dependencies."""
import ftplib
import os
from pathlib import Path
import ssl
import sys

FILES = ("geometry.js", "styles.css", "app.js", "index.html")


def main():
    required = ("FTPS_HOST", "FTPS_USER", "FTPS_PASSWORD", "FTPS_REMOTE_DIR")
    missing = [key for key in required if not os.environ.get(key)]
    if missing:
        raise ValueError("Add these repository Actions secrets: " + ", ".join(missing))
    host = os.environ["FTPS_HOST"]
    remote = os.environ["FTPS_REMOTE_DIR"]
    if any(c in host + remote for c in "\r\n") or "://" in host:
        raise ValueError("FTPS_HOST must be a hostname; values cannot contain line breaks.")
    root = Path(__file__).resolve().parent.parent
    for name in FILES:
        if not (root / name).is_file():
            raise ValueError("Missing asset: " + name)
    with ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=60) as ftp:
        ftp.connect(host, int(os.environ.get("FTPS_PORT") or "21"))
        ftp.login(os.environ["FTPS_USER"], os.environ["FTPS_PASSWORD"])
        ftp.prot_p()
        ftp.set_pasv(True)
        # Require an existing directory, so a typo cannot create a wrong tree.
        ftp.cwd(remote)
        for name in FILES:
            with (root / name).open("rb") as asset:
                ftp.storbinary("STOR " + name, asset)
            print("Uploaded " + name)
    print("Deployment complete.")


if __name__ == "__main__":
    try:
        main()
    except ValueError as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
    except Exception as error:
        # Server responses can contain account information; do not log them.
        print("FTPS deployment failed (" + type(error).__name__ + "). Check credentials, directory, TLS certificate and passive FTP access.", file=sys.stderr)
        sys.exit(1)
